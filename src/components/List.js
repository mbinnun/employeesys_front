// DOM dependencies
import React, {Component} from 'react';
import { MDBTable, MDBTableBody, MDBTableHead, MDBIcon } from 'mdbreact';
// Routing dependencies
import { Redirect } from 'react-router-dom';
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
    } else {
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
      // Error ==> Treat as auth-token has expired
      this.flgSending = 0;
      console.log(err);

      // Revoke the authorization token
      // Force redirect to login page
    });
  }

  employeeListBuilder = () => {
    if (this.state.arrEmployees.length > 0) {
      return (
        // iterate the error array and add to the error list
        <MDBTableBody className="TableBody">{
          this.state.arrEmployees.map( (employee, index) => 
            <tr key={employee._id}>
              <td>{index+1}</td>
              <td>{employee.strFirstName}</td>
              <td>{employee.strLastName}</td>
              <td>{employee.strEmail}</td>
              <td>{(this.props.strId === employee._id || this.props.flgAdmin) ? <MDBIcon     icon="pencil-alt" className="FwIcon" title="Click to edit this employee"   /> : ''}</td>
              <td>{(this.props.strId === employee._id || this.props.flgAdmin) ? <MDBIcon far icon="trash-alt"  className="FwIcon" title="Click to delete this employee" /> : ''}</td>
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
        <div className="container Container m">
          <h1>Managing Employees</h1>
          <MDBTable className="Table mx-auto">
            {/* Table Head */}
            <MDBTableHead className="TableHead">
              <tr>
                <th>#</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th></th>
                <th></th>
              </tr>
            </MDBTableHead>
            {/* Table Items */}
            {this.employeeListBuilder()}
          </MDBTable>
        </div>
        <div className="RedirectSpinner"><div className="spinner-border" role="status"><span className="sr-only">Loading...</span></div></div>
      </div>
    )
  }
};

export default List;
