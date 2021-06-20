// DOM dependencies
import React from 'react';
import { MDBNavbar, MDBNavbarNav, MDBIcon } from 'mdbreact';
// NavBarMobile styles
import '../components_styles/NavBarMobile.css';

class NavBarMobile extends React.Component {
  /*constructor(props) {
      super(props);
  }*/

  LoggedInDetails = () => {
    // force redirect not logged-in employees to the login page
    if (this.props.strAuthToken && this.props.strAuthToken !== '') {
      return (
        <div className="d-flex align-items-center PersonalDetails">
          <div className="Boy"><img src="/boy.png" alt="boy" className="Boy" /></div>
          <div className="FirstName">{this.props.strFirstName}</div>
        </div>
      );
    }
    else {
      return '';
    }
  };

  SignOut = () => {
    // Revoke the authorization token
    this.props.removeToken();
    // Force redirect to login page
    window.location.href = '/employeesys/login';
  };

  GoBack = () => {
    if (window.location.href.indexOf('/employeesys/list') > 1) {
      this.SignOut();
    }
    else if (window.location.href.indexOf('/employeesys/verify') > 1) {
      this.SignOut();
    }
    else if (window.location.href.indexOf('/employeesys/update') > 1) {
      window.location.href = '/employeesys/list';
    }
    else {
      window.location.href = '/employeesys/list';
    }
  };

  render() {
    return(
      <div className="NavBarMobile">
        <MDBNavbar dark expand="md" scrolling fixed="top" className="d-flex d-md-none bg-white NavWrapper">

          {/* Left side */}
          <MDBNavbarNav left>
            <MDBIcon icon="angle-left" className="GoBack" style={{fontSize: 32}} title="Click to go back" onClick={this.GoBack} />
          </MDBNavbarNav>

          {/* Right side */}
          <MDBNavbarNav right>
            {this.LoggedInDetails()}
          </MDBNavbarNav>

        </MDBNavbar>
      </div>
    );
  }
}

export default NavBarMobile;