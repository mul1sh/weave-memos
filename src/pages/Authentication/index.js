import React from 'react';
import './../../assets/scss/style.scss';
import Aux from "../../hoc/_Aux";
import { connect } from 'react-redux';
import * as actionTypes from "../../store/actions";

import { Button, Spinner } from 'react-bootstrap';
import { 
         getWalletAddress, 
         getWalletBalance
    } from "../../helpers/arweave";

class Login extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            fetchingWalletAddress: false
        }
    
        //bind my methods
        this.openFileBrowser = this.openFileBrowser.bind(this);
        this.fileSelected = this.fileSelected.bind(this);
    }

    openFileBrowser(e) {
        // open the file browser
        this.refs.fileUploader.click();
    }

    async fileSelected(e) {
          // change the login button state
        this.setState({ fetchingWalletAddress: true });
        // handle selection events
        const filereader = new FileReader();

        filereader.addEventListener('loadend', async e => {
          try {

            const userWallet = JSON.parse(e.target.result);
            const userArweaveAddress = await getWalletAddress(userWallet);
            let userArweaveBalance = '';
          
            if (userArweaveAddress) {
                userArweaveBalance = await getWalletBalance(userArweaveAddress);
            } else {
                throw new Error("Unable to get wallet address!!")
            }
    
            // save the login details in the global state
            this.props.dispatch({type: actionTypes.USER_AUTH,
                                 userWallet: userWallet, 
                                 userArweaveAddress: userArweaveAddress,
                                 userArweaveBalance: userArweaveBalance });   

            // then go to the memos home page
            this.props.history.push("/memos");
            
          } catch (err) {
            alert('Loading keystore failed, make sure you have uploaded the correct arweave keyfile');
            // change the login button state
            this.setState({ fetchingWalletAddress: false });
            console.log(err);
          }
        });

        filereader.readAsText(e.target.files[0]);
            
    }

    handleFetchWalletDetails() {

        let buttonState = 'LOAD KEYSTORE';
        const { fetchingWalletAddress } = this.state;

        if (fetchingWalletAddress) {
            buttonState = (
                <span>
                    <Spinner
                      as="span"
                      animation="grow"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    /> 
                    &nbsp;&nbsp;
                    Fetching Wallet Details...
                </span>
            )
        }

        return buttonState;
    }

    render () {
        
        return(
            <Aux>
                <div className="auth-wrapper">
                    <div className="auth-content">
                        <div className="auth-bg">
                            <span className="r"/>
                            <span className="r s"/>
                            <span className="r s"/>
                            <span className="r"/>
                        </div>
                        <div className="card">
                            <div className="card-body text-center">
                                <div className="mb-4">
                                    <i className="feather icon-user-plus auth-icon"/>
                                </div>
                                <h4>Welcome to Weave Voice Memos</h4>
                                <br/>
                                <h6>Your voice memos, stored securely in the permaweb</h6>
                                <br/>
                                <p>To continue, please load a valid Arweave Keystore.</p>
                                <Button 
                                    variant="primary"
                                    onClick={this.openFileBrowser}
                                >
                                
                                  { this.handleFetchWalletDetails() }
                                </Button>
                                <br/>
                                <br/>
                                <h6>Need tokens or a wallet ?</h6>
                                <Button 
                                    variant="outline-secondary"
                                    onClick={()=> window.open("https://tokens.arweave.org/", "_blank")}
                                > 
                                    Get Some Here
                                </Button>
                            </div>
                        </div>
                            <input type="file" 
                               ref="fileUploader" 
                               style={{display: "none"}} 
                               onChange={this.fileSelected}
                            />
                    </div>
                </div>
            </Aux>
        );
    }
}

export default connect() (Login);