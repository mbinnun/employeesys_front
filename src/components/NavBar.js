// DOM dependencies
import React from 'react';
import { Link } from 'react-router-dom';
import { MDBNavbar, MDBNavbarNav, MDBIcon } from 'mdbreact';
// NavBar styles
import '../components_styles/NavBar.css';

class NavBar extends React.Component {
  /*constructor(props) {
      super(props);
  }*/

  LoggedInDetails = () => {
    // force redirect not logged-in employees to the login page
    if (this.props.strAuthToken && this.props.strAuthToken !== '') {
      return (
        <div className="d-flex align-items-center PersonalDetails">
          <div className="FirstName">{this.props.strFirstName}</div>
          <div><MDBIcon icon="sign-out-alt" className="SignOut" title="Click to sign out" onClick={this.SignOut} /></div>
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

  render() {
    return(
      <div className="NavBar">
        <MDBNavbar dark expand="md" scrolling fixed="top" className="d-none d-md-flex bg-white NavWrapper">

          {/* Left side */}
          <MDBNavbarNav left>
            <Link to="/employeesys/list" title="EmployeeSys Home Page">
              <img src="/ls_logo.png" alt="ls_logo" />
            </Link>
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

export default NavBar;