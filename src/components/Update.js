// DOM dependencies
import React, {Component} from 'react';
import { Link } from 'react-router-dom';
// MDB Componenets
import { MDBContainer, MDBRow, MDBCol, MDBInput } from 'mdbreact';
// AJAX helper
import axios from 'axios';
// JQuery
import $ from 'jquery';
// Update styles
import '../components_styles/Update.css';

// Component injection
class Update extends Component {

  state = {};

  // flag to prevent duplicate sendings
  flgSending = 0;

  constructor(props) {
    super(props);
    
    // initialize the error array
    this.state.errors = [];

    // initialize details before getting from ajax
    this.state.strFirstName = '';
    this.state.strLastName  = '';
  }

  // == lifecycle hooks ==
  componentDidMount() { 
    // redirect not logged-in employees to the login page
    if (!this.handleNotLoggedIn()) {
      this.getEmployeeData();
    }
  }

  handleNotLoggedIn = () => {
    // force redirect not logged-in employees to the login page
    if (!this.props.strAuthToken || this.props.strAuthToken === '') {
      $('.Container').hide();
      $('.Update .RedirectSpinner').show();
      window.location.href = '/employeesys/login';
      return true;
    }
    // force not verified users to verify their e-mail
    else if (!this.props.flgVerified || this.props.flgVerified === false || this.props.flgVerified === 'false') {
      $('.Container').hide();
      $('.Update .RedirectSpinner').show();
      window.location.href = '/employeesys/verify';
      return true;
    }
    // must have the updated user id
    else if (!this.props.updatedid || this.props.updatedid === '') {
      $('.Container').hide();
      $('.Update .RedirectSpinner').show();
      window.location.href = '/employeesys/list';
      return true;
    }
    // must be admin or myself
    else if (this.props.updatedid != this.props.strId && !(this.props.flgAdmin && (this.props.flgAdmin === true || this.props.flgAdmin === 'true'))) {
      $('.Container').hide();
      $('.Update .RedirectSpinner').show();
      window.location.href = '/employeesys/list';
      return true;
    }
    else {
      return false;
    }
  };

  getEmployeeData = () => {
    if (this.flgSending === 0) {
      // fetch employee list from the API
      this.flgSending = 1;
      axios.get(this.props.apiUrl + '/api/employees/'+this.props.updatedid, {
        headers: {
          'Authorization': 'Bearer '+this.props.strAuthToken
        }
      })
      .then(resp => {
        // Success ==> get the employees list
        this.flgSending = 0;
        const objResponse  = resp.data;
        if (objResponse.data) {
          // extract the employee name
          const strFirstName = objResponse.data.strFirstName;
          const strLastName  = objResponse.data.strLastName;
          // update the state
          this.setState({...this.state, strFirstName: strFirstName, strLastName: strLastName});
        }
      })
      .catch(err => { 
        // Error ==> Token is invalid or already expired
        this.flgSending = 0;
        $('.List .RedirectSpinner').hide();
        $('.Container').show();
        // Revoke the authorization token
        this.props.removeToken();
        // Force redirect to login page
        window.location.href = '/employeesys/login';
      });
    }
  };

  // Error list builder
  ErrorList = () => {
    if (this.state.errors.length > 0) {
      return (
        // iterate the error array and add to the error list
        <ul className="ErrorList">{ 
          this.state.errors.map( errText => 
            <li key={errText}>{errText}</li> 
          ) 
        }</ul>
      );
    } else {
      return '';
    }
  };

  // Form submit event
  handleSubmit = (event) => {
    event.preventDefault();

    if (this.flgSending === 0) {

      const fname    = event.target.form[0].value;
      const lname    = event.target.form[1].value;
      const arrErrors = [];

      // check first name
      if (fname === "") {
        // fname error ==> add to the errors array
        arrErrors.push('First name is required');
      }
      // check last name
      if (lname === "") {
        // lname error ==> add to the errors array
        arrErrors.push('Last name is required');
      }
      
      this.setState({...this.state, errors: arrErrors});

      // if no errors - submit to the API
      if (arrErrors.length === 0) {
        this.flgSending = 1;
        $('.Update .Spinner').show();

        // send a log-in request to the API
        axios.put(this.props.apiUrl + '/api/employees/'+this.props.updatedid, {
          fname:    fname,
          lname:    lname,
        },
        {
          headers: {
            'Authorization': 'Bearer '+this.props.strAuthToken
          }
        })
        .then(resp => {
          // Success ==> get the token
          this.flgSending = 0;
          $('.Update .Spinner').hide();
          const objResponse = resp.data;
          if (objResponse.data && objResponse.data.strFirstName && objResponse.data.strFirstName !== '') {
            // registered succesfully ==> perform login
            window.location.href = '/employeesys/list';
          } else {
            // registration error ==> add an error to the errors array
            arrErrors.push('Error during update.');
            this.setState({...this.state, errors: arrErrors});
          }
        })
        .catch(err => { 
          // Error ==> get the error from the response
          this.flgSending = 0;
          $('.Update .Spinner').hide();
          let objResponse = {};
          // parse error types
          if (err.response) {
            if (err.response.data) {
              objResponse = err.response.data;
            }
            else {
              objResponse = err.response;
            }
          }
          else if (err.data) {
            objResponse = err.data;
          }
          else {
            objResponse = err;
          }
          // Validation error ==> iterate and add to the errors array
          if (objResponse.message && objResponse.message === 'Validation Error' && objResponse.data && objResponse.data.length > 0) {
            for (let i in objResponse.data) {
              arrErrors.push(objResponse.data[i].msg);
            }
            this.setState({...this.state, errors: arrErrors});
          }
          // Email or password error ==> add to the errors array
          else if (objResponse.message && !objResponse.data) {
            arrErrors.push(objResponse.message);
            this.setState({...this.state, errors: arrErrors});
          }
        });
      }

    }
  }

  handleChangeFname(e) {
    this.setState({strFirstName: e.target.value})
  }
  handleChangeLname(e) {
    this.setState({strLastName: e.target.value})
  }

  render() {
    return (
      <div className="Update">
        <MDBContainer className="Container">
          <MDBRow className="Row align-items-center flex-column">
            <p className="Title h2 text-center mb-4">Update Employee</p>
            <MDBCol md="6" className="Col mx-auto bg-white">

              {/* update form */}
              <form onSubmit={this.handleSubmit}>
                <div className="grey-text">

                  {/* first name input */}
                  <MDBInput label="First name" icon="user" group type="text" name="fname" value={this.state.strFirstName} onChange={this.handleChangeFname.bind(this)} validate success="right" />

                  {/* last name input */}
                  <MDBInput label="Last name" icon="user" group type="text" name="lname" value={this.state.strLastName} onChange={this.handleChangeLname.bind(this)} validate success="right" />

                </div>
                <div className="text-center">

                  {/* loader */}
                  <div className="Spinner"><div className="spinner-border" role="status"><span className="sr-only">Loading...</span></div></div>

                  {/* show form validation errors */}
                  {this.ErrorList()}
                  
                  {/* submit button */}
                  <button type="submit" className="btn btn-primary Ripple-parent Btn" onClick={(event) => this.handleSubmit(event)}>
                    Update
                    <div className="Ripple"></div>
                  </button>
                  <Link to="/employeesys/list" className="ml-3">Cancel</Link>

                </div>
              </form>

            </MDBCol>
            
          </MDBRow>
        </MDBContainer>
        {/* Redirect spinner */}
        <div className="RedirectSpinner"><div className="spinner-border" role="status"><span className="sr-only">Loading...</span></div></div>
      </div>
    )
  }
};

export default Update;
