// DOM dependencies
import React, {Component} from 'react';
import { MDBTable, MDBTableBody, MDBTableHead, MDBIcon } from 'mdbreact';
// Routing dependencies
import { Link } from 'react-router-dom';
// AJAX helper
import axios from 'axios';
// JQuery
import $ from 'jquery';
// List styles
import '../components_styles/List.css';

// Component injection
class List extends Component {

  state = {};

  // Ajax flag to prevent duplicate requests
  flgSending = 0;

  constructor(props) {
    super(props);
    //console.log("List constructor", this.props); 
    
    // initialize the error array
    this.state.errors = [];

    // initialize the employees array
    this.state.arrEmployees = [];
  }

  componentDidMount()    { 
    //console.log("List componentDidMount"); 

    // redirect not logged-in employees to the login page
    if (!this.handleNotLoggedIn()) {
      this.getEmployeeData();
    }
  }
  //componentDidUpdate()   { console.log("List componentDidUpdate"); }
  //componentWillUnmount() { console.log("List componentWillUnmount"); }

  handleNotLoggedIn = () => {
    // force redirect not logged-in employees to the login page
    if (!this.props.strAuthToken || this.props.strAuthToken === '') {
      $('.Container').hide();
      $('.List .RedirectSpinner').show();
      window.location.href = '/employeesys/login';
      return true;
    }
    // force not verified users to verify their e-mail
    else if (!this.props.flgVerified || this.props.flgVerified === false || this.props.flgVerified === 'false') {
      $('.Container').hide();
      $('.List .RedirectSpinner').show();
      window.location.href = '/employeesys/verify';
      return true;
    }
    else {
      return false;
    }
  }

  getEmployeeData = () => {
    // fetch employee list from the API
    this.flgSending = 1;
    $('.Container').hide();
    $('.List .RedirectSpinner').show();
    axios.get(this.props.apiUrl + '/api/employees/', {
      headers: {
        'Authorization': 'Bearer '+this.props.strAuthToken
      }
    })
    .then(resp => {
      // Success ==> get the employees list
      this.flgSending = 0;
      $('.List .RedirectSpinner').hide();
      $('.Container').show();
      const objResponse  = resp.data;
      const arrEmployees = (objResponse.data && objResponse.data.length > 0) ? objResponse.data : [];
      // update the state
      this.setState({...this.state, arrEmployees: arrEmployees});
    })
    .catch(err => { 
      // Error ==> Check if because of a non-verified email or an expired token
      this.flgSending = 0;
      let errNotVerified = false;
      if (err.response && err.response.data && err.response.data.data && err.response.data.data === 'You should verify your email before performing this action') {
        errNotVerified = true;
      }
      // Decide the action accoding to the error type
      if (errNotVerified) {
        // not verified email ==> send the user to verify
        $('.Container').hide();
        $('.List .RedirectSpinner').show();
        window.location.href = '/employeesys/verify';
        return true;
      } else {
        // Revoke the authorization token
        this.props.removeToken();
        // Force redirect to login page
        window.location.href = '/employeesys/login';
      }
    });
  }

  deleteEmployee = (employeeId) => {
    console.log('deleting employee', employeeId)
  }

  employeeListBuilder = () => {
    if (this.state.arrEmployees.length > 0) {
      return (
        // iterate the error array and add to the error list
        <MDBTableBody className="TableBody">{
          this.state.arrEmployees.map( (employee, index) => 
            <tr key={employee._id}>
              <td className="align-middle">{index+1}</td>
              <td className="align-middle">{employee.strFirstName}</td>
              <td className="align-middle">{employee.strLastName}</td>
              <td className="align-middlle d-none d-md-table-cell">{employee.strEmail}</td>
              <td className="align-middle">{(this.props.strId === employee._id || (this.props.flgAdmin && (this.props.flgAdmin === true || this.props.flgAdmin === 'true'))) ? <Link to={"/employees/update/"+employee._id}><MDBIcon icon="pencil-alt" className="FwIcon" title="Click to edit this employee" /></Link> : ''}</td>
              <td className="align-middle">{(this.props.strId === employee._id || (this.props.flgAdmin && (this.props.flgAdmin === true || this.props.flgAdmin === 'true'))) ? <MDBIcon onClick={() => { this.deleteEmployee(employee._id); }} far icon="trash-alt" className="FwIcon" title="Click to delete this employee" /> : ''}</td>
            </tr>
          ) 
        }</MDBTableBody>
      );
    } else {
      return (
        <MDBTableBody className="TableBody">
          <tr>
            <td colSpan={6}>
              <h2>No employees found!</h2>
            </td>
          </tr>
        </MDBTableBody>
      );
    }
  }

  render() {
    return (
      <div className="List">
        <div className="container Container">
          <h1 className="d-none d-md-block">Managing Employees</h1>
          <h3 className="d-block d-md-none mx-auto text-center p-3">Managing Employees</h3>
          <div className="TableWrapper">
            <MDBTable className="Table mx-auto">
              {/* Table Head */}
              <MDBTableHead className="TableHead">
                <tr>
                  <th className="align-middle">#</th>
                  <th className="align-middle">First Name</th>
                  <th className="align-middle">Last Name</th>
                  <th className="d-none d-md-table-cell">Email</th>
                  <th></th>
                  <th></th>
                </tr>
              </MDBTableHead>
              {/* Table Items */}
              {this.employeeListBuilder()}
            </MDBTable>
          </div>
        </div>
        <div className="RedirectSpinner"><div className="spinner-border" role="status"><span className="sr-only">Loading...</span></div></div>
      </div>
    )
  }
};

export default List;
