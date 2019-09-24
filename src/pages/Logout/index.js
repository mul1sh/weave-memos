import React from 'react';
import { connect } from 'react-redux';

class Logout extends React.Component {

	componentDidMount() {
        // go to login
        this.props.history.push("/login");
    }

    render() {
    	return <div/>
    }

}

export default connect()(Logout);