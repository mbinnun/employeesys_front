import React from 'react';
import { Link } from 'react-router-dom';
import { MDBNavbar, MDBNavbarNav } from 'mdbreact';

class NavBar extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          collapse: false,
      };
      this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.setState({
        collapse: !this.state.collapse,
      });
  }

  render() {
    return(
      <div className="NavBar">
        <MDBNavbar dark expand="md" scrolling fixed="top" className="d-none d-md-block bg-white">

          {/* Left side */}
          <MDBNavbarNav left>
            <Link to="/employeesys/list" title="EmployeeSys Home Page">
              <img src="/ls_logo.png" alt="ls_logo" />
            </Link>
          </MDBNavbarNav>

          {/* Right side */}
          <MDBNavbarNav right>
          </MDBNavbarNav>

        </MDBNavbar>
      </div>
    );
  }
}

export default NavBar;