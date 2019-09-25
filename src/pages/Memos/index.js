import React from 'react';
import {Row, Col, Card, Button, Table, Spinner, Alert } from 'react-bootstrap';
import Aux from "../../hoc/_Aux";
import { connect } from 'react-redux';
import { saveMemo, getUserMemos, getTransactionDetails } from "../../helpers/arweave";
import { getUserLocationData  } from "../../helpers/location";
import vmsg from "vmsg";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import moment from 'moment'

const recorder = new vmsg.Recorder({
  wasmURL: "https://unpkg.com/vmsg@0.3.6/vmsg.wasm"
});


const blobToBase64 = (blob, callback) => {
        const reader = new FileReader();
        reader.onload = function() {
            var dataUrl = reader.result;
            var base64 = dataUrl.split(',')[1];
            callback(base64);
        };
        reader.readAsDataURL(blob);
};


const b64toBlob = async (b64Data, contentType='audio/mpeg') => {
  const url = `data:${contentType};base64,${b64Data}`;
  const response = await fetch(url);
  const blob = await response.blob();
  return blob;
};

let saveTimer = null;


class VoiceMemos extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            microphoneAccessAllowed: false,
            micOptions: {},
            isRecording: false,
            isSaving: false,
            memos: [],
            countDownTimer: 0,
            savingMemoText: "Your memo is being saved to the arweave blockchain...."
        }

        // bind my local methods
        this.handleMicAccess = this.handleMicAccess.bind(this);
        this.hasGetUserMedia = this.hasGetUserMedia.bind(this);
        this.startRecordingMemo = this.startRecordingMemo.bind(this);
        this.stopRecordingMemo = this.stopRecordingMemo.bind(this);
        this.saveMemoToArweave = this.saveMemoToArweave.bind(this);
        this.fetchUserMemos = this.fetchUserMemos.bind(this);
    }

    componentDidMount() {
        if (!this.hasGetUserMedia()) {
            alert('Sorry, It seems your browser does not support audio record capabilities');
        } else {
            this.fetchUserMemos();
        }
    }

    componentWillUnmount() {

    }

    hasGetUserMedia() {
          return !!(navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia);
    }

    handleMicAccess() {
        window.navigator.mediaDevices
       .getUserMedia({audio: true})
       .then(
        (result) => {
            this.setState({ microphoneAccessAllowed: true, micOptions: result, isRecording: true });
            this.startRecordingMemo();
        },
        (error) => {
            alert('Sorry but in-order to record a voice memo you must give microphone permissions to this app');
        });
    }


    async startRecordingMemo() {
      try {
        await recorder.initAudio();
        await recorder.initWorker();
        recorder.startRecording();

        let timer = 0;
        const that = this;
        const intervalId = setInterval(function(){
            timer += 1;
            that.setState({ countDownTimer: timer });

            if(timer >= 120) {
                that.stopRecordingMemo();
            }

        }, 1000);
        // store intervalId in the state so it can be accessed later:
        this.setState({intervalId: intervalId});

      } catch (e) {
        console.error(e);
        this.setState({ isRecording: false, countDownTimer: 0 });
        clearInterval(this.state.intervalId);
      }

    }

    async stopRecordingMemo() {
        clearInterval(this.state.intervalId);
        const blob = await recorder.stopRecording();
        this.setState({ isRecording: false });
        this.setState({ isSaving: true });

        const that = this;
        // convert the memo to base64
        blobToBase64(blob, (base64) =>{
            that.setState({ countDownTimer: 0 });
            that.saveMemoToArweave(base64);
        
        });
    }


    async saveMemoToArweave(base64Audio) {
        try {
          const userLocationData = await getUserLocationData();
          const dateAdded = moment().format('MMMM Do YYYY, h:mm:ss a');
          const memo = {
            memo: base64Audio,
            dateAdded: dateAdded,
            memoLocation: userLocationData.regionName
          };
          const memoAdded = await saveMemo(this.props.userWallet, memo);

          if(memoAdded) { 

            this.setState({savingMemoText: "Your memo has been saved to the arweave blockchain, in a few minutes it will show up below after it is mined :) "});
            const that = this;
            saveTimer = setTimeout(function(){
                 that.setState({ savingMemoText: "Your memo is being saved to the arweave blockchain....", isSaving: false });

                window.clearTimeout(saveTimer);
            }, 3000)
           
          }
        }
        catch(error) {
            console.error(error);
        }

    }

    async fetchUserMemos() {
        let memos = [];
        try
        {
            const userMemos = await getUserMemos(this.props.userArweaveAddress);

            // decode the arweave transactions
            userMemos
            .forEach(async (userMemoTx) => {

                let memo = {};

                const transaction =  await getTransactionDetails(userMemoTx);
                const decodedTransaction = transaction.get('data', {decode: true, string: true});
              
                memo.soundMemo = URL.createObjectURL(await b64toBlob(decodedTransaction));

                transaction.get('tags').forEach(tag => {
                    let key = tag.get('name', {decode: true, string: true});
                    let value = tag.get('value', {decode: true, string: true});

                    if(key === "wevr-memo-date-added") {
                        memo.dateAdded = moment(value, 'MMMM Do YYYY, h:mm:ss a');
                    }

                    if(key === "wevr-memo-location") {
                        memo.location = value;
                    }
                });
                memos.push(memo);

                if(memos.length === userMemos.length) {
                    // sort the memo's by date
                    const sortedMemos = memos.sort((a,b) => a.dateAdded - b.dateAdded);
                    // then reverse the dates to get the newest date first
                    const reversedMemos = sortedMemos.reverse();
                    // finally update the memo's
                    this.setState({ memos: reversedMemos });
                }
            });


        }
        catch (error) {
            console.error(error);
        }
    }

   
    render() {

        const { isRecording, isSaving, memos, countDownTimer, savingMemoText } = this.state;

        return (
            <Aux>
                <Row>
                    <Col md={8} xl={8}>
                        <Card >
                            <Card.Body>
                                <div className="row d-flex align-items-center">
                
                                    <div className="col-12">
                                        <h4 className='text-center'>Welcome to Weave Voice Memos</h4>
                                        <br/>
                                        <h6 className='f-w-300 d-flex align-items-center m-b-0'>
                                        {
                                            isRecording ? 
                                            <div>
                                                <span>
                                                    Your voice memo is now being recorded, &nbsp;<strong>click on the button below</strong>&nbsp; to stop the recording and save the memo in arweave :)
                                                </span>
                                                <br/><br/>
                                                <span>
                                                    Please note the voice memo&nbsp;<strong>will automatically stop</strong>&nbsp;recording after&nbsp;<strong>120 seconds</strong>&nbsp; to save on space.
                                                </span>
                                            </div>
                                            : 
                                            <span>
                                                Please&nbsp;<strong>click</strong>&nbsp;on the button below, to&nbsp;<strong>start</strong>&nbsp;recording your voice memos.
                                            </span>
                                        }
                                        </h6>
                
                                        <br/>
                                        <div className="d-flex align-items-center justify-content-center">
                                            {
                                                isRecording & !isSaving ? 
                                                <div className="d-flex align-items-center justify-content-center">
                                                   
                                                   <Button 
                                                        variant="danger"
                                                        onClick={ this.stopRecordingMemo}
                                                    >
                                                       Stop Recording Memo!
                                                    </Button>
                                                    &nbsp;&nbsp;
                                                    <div  style={{ width: 50 }} >
                                                        <CircularProgressbar 
                                                                maxValue={120} 
                                                                value={countDownTimer} 
                                                                text={`${countDownTimer} secs`} 
                                                                styles={buildStyles({
                                                                        // Colors
                                                                        pathColor: '#dc3545',
                                                                        textColor: '#000',
                                                                        trailColor: '#d6d6d6',
                                                                      })}
                                                                />
                                                    </div>
                                                </div>  
                                                :
                                                !isRecording & !isSaving ? 
                                                    <Button 
                                                        variant="primary"
                                                        onClick={ this.handleMicAccess}
                                                    >
                                                      Start Recording Memo
                                                    </Button> 
                                                    : 
                                                    <Alert variant="primary">
                                                         <Spinner
                                                              as="span"
                                                              animation="grow"
                                                              size="sm"
                                                              role="status"
                                                              aria-hidden="true"
                                                        /> 
                                                        &nbsp;&nbsp;
                                                        {savingMemoText}
                                                    </Alert>
                                            }
                                           
                                           {
                                              !isRecording && isSaving ? 
                                                <div className="d-flex align-items-center justify-content-center">
                                                   
                                                   
                                                </div>
                                                :
                                                null
                                           }
                                        </div>

                                    </div>

                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} xl={4}>
                        <Card>
                            <Card.Body>
                                <h4 className='mb-4'>Arweave Wallet</h4>
                                <div className="row d-flex align-items-center">
                                    <div className="col-8">
                                    Address: 
                                        <h6 className="f-w-300 d-flex align-items-center m-b-0">
                                        <i className="feather icon-hash text-c-green f-30 m-r-5"/> 
                                        {this.props.userArweaveAddress}

                                        </h6>
                                    </div>
                                    <br/>
                                    <div className="col-8">
                                        Balance in AR: 
                                        <h6 className="f-w-300 d-flex align-items-center m-b-0">
                                        <i className="feather icon-zap text-c-green f-30 m-r-5"/> 
                                        {this.props.userArweaveBalance}

                                        </h6>
                                    </div>
                                </div>
                              
                            </Card.Body>
                        </Card>
                    </Col>
                    {
                        memos.length > 0 
                        ?
                        <Col md={12} xl={12}>
                            <Card>
                                <Card.Header>
                                    <Card.Title as='h5'>Your Memo's</Card.Title>
                                </Card.Header>
                                <Card.Body>
                                   <Table responsive hover>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Location</th>
                                                <th>Date Added</th>
                                                <th>Memo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {memos.map((memo, index) => (
                                                 <tr className="unread" key={index}>
                                                    <td>{(index + 1)}</td>
                                                    <td>{memo.location}</td>
                                                    <td>{memo.dateAdded.format('MMMM Do YYYY, h:mm:ss a')}</td>
                                                    <td>
                                                        <audio src={memo.soundMemo} controls />
                                                    </td>
                                                 </tr>
                                            ))}     
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                        :
                        null
                    }    
                    
                </Row>
            </Aux>
        );
    }
}

const mapStateToProps = state => {
    return {
      userWallet: state.userWallet,
      userArweaveAddress: state.userArweaveAddress,
      userArweaveBalance: state.userArweaveBalance
    }
};
export default connect(mapStateToProps) (VoiceMemos);