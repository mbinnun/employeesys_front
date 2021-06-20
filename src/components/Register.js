// DOM dependencies
import React, {Component} from 'react';
import { Link } from 'react-router-dom';
// MDB Componenets
import { MDBContainer, MDBRow, MDBCol, MDBInput } from 'mdbreact';
// AJAX helper
import axios from 'axios';
// JQuery
import $ from 'jquery';
// Register styles
import '../components_styles/Register.css';

// Component injection
class Register extends Component {

  state = {};

  // flag to prevent duplicate sendings
  flgSending = 0;

  constructor(props) {
    super(props);
    
    // initialize the error array
    this.state.errors = [];
  }

  // == lifecycle hooks ==
  componentDidMount() { 
    // redirect an already logged-in employee to the private area
    this.handleLoggedIn();
  }

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
      const email    = event.target.form[2].value;
      const password = event.target.form[3].value;
      const arrErrors = [];

      // check first name
      if (fname === "") {
        // fname error ==> add to the errors array
        arrErrors.push('First name is required');
      }
      // check last name
      if (fname === "") {
        // lname error ==> add to the errors array
        arrErrors.push('Last name is required');
      }
      // check email
      if (email === "") {
        // email error ==> add to the errors array
        arrErrors.push('Email is required');
      }
      else {
        var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
        if (!pattern.test(email)) {
          // email error ==> add to the errors array
          arrErrors.push('Please enter a valid email');
        }
      }
      // check password
      if (password === "") {
        // password error ==> add to the errors array
        arrErrors.push('Password is required');
      }

      this.setState({...this.state, errors: arrErrors});

      // if no errors - submit to the API
      if (arrErrors.length === 0) {
        this.flgSending = 1;
        $('.Register .Spinner').show();

        // send a log-in request to the API
        axios.post(this.props.apiUrl + '/api/employees/', {
          fname:    fname,
          lname:    lname,
          email:    email,
          password: password
        })
        .then(resp => {
          // Success ==> get the token
          this.flgSending = 0;
          $('.Register .Spinner').hide();
          const objResponse = resp.data;
          if (objResponse.data && objResponse.data._id && objResponse.data._id !== '') {
            // registered succesfully ==> perform login
            this.loginAfterRegister (email, password);
          } else {
            // registration error ==> add an error to the errors array
            arrErrors.push('Error during registrtaion.');
            this.setState({...this.state, errors: arrErrors});
          }
        })
        .catch(err => { 
          // Error ==> get the error from the response
          this.flgSending = 0;
          $('.Register .Spinner').hide();
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

  loginAfterRegister = (email, password) => {
    if (this.flgSending === 0) {
      this.flgSending = 1;
      $('.Login .Spinner').show();

      // send a log-in request to the API
      axios.post(this.props.apiUrl + '/api/employees/login/', {
        email:    email,
        password: password
      })
      .then(resp => {
        // Success ==> get the token
        this.flgSending = 0;
        $('.Login .Spinner').hide();
        const objResponse = resp.data;
        if (objResponse.data && objResponse.data.token && objResponse.data.token.length > 0) {

          // token generated ==> save the token
          this.props.saveToken(
            objResponse.data.token, 
            objResponse.data.strFirstName, 
            objResponse.data.flgEmailVerified, 
            objResponse.data.flgAdmin, 
            objResponse.data._id
          );

          // force moving the logged-in user to personal area
          if (objResponse.data.flgEmailVerified) {
            window.location.href = '/employeesys/list';
          } else {
            window.location.href = '/employeesys/verify';
          }

        } else {
          // no token ==> return to login screen
          window.location.href = '/employeesys/login';
        }
      })
      .catch(err => { 
        // Error ==> return to the login screen
        this.flgSending = 0;
        $('.Login .Spinner').hide();
        window.location.href = '/employeesys/login';
      });
    }
  }

  handleLoggedIn = () => {
    // force redirect an already logged-in employee to the personal area
    if (this.props.strAuthToken && this.props.strAuthToken !== '') {
      $('.Container').hide();
      $('.Register .RedirectSpinner').show();
      if (this.props.flgVerified && (this.props.flgVerified === true || this.props.flgVerified === 'true')) {
        window.location.href = '/employeesys/list';
      } else {
        window.location.href = '/employeesys/verify';
      }
    }
  }

  render() {
    return (
      <div className="Register">
        <MDBContainer className="Container">
          <MDBRow className="Row align-items-center justify-content-center flex-column">
            <p className="Title h2 text-center mb-4">Register</p>
            <MDBCol md="6" className="Col mx-auto bg-white">
              <img src="/boy.png" alt="boy" className="Boy" />

              {/* login form */}
              <form onSubmit={this.handleSubmit}>
                <div className="grey-text">

                  {/* first name input */}
                  <MDBInput label="First name" icon="user" group type="text" name="fname" validate success="right" />

                  {/* last name input */}
                  <MDBInput label="Last name" icon="user" group type="text" name="lname" validate success="right" />

                  {/* email input */}
                  <MDBInput label="Email" icon="envelope" group type="email" name="email" validate error="wrong" success="right" />

                  {/* password input */}
                  <MDBInput label="Password" icon="lock" group type="password" name="password" validate />

                </div>
                <div className="text-center">

                  {/* loader */}
                  <div className="Spinner"><div className="spinner-border" role="status"><span className="sr-only">Loading...</span></div></div>

                  {/* show form validation errors */}
                  {this.ErrorList()}
                  
                  {/* submit button */}
                  <button type="submit" className="btn btn-primary Ripple-parent Btn" onClick={(event) => this.handleSubmit(event)}>
                    Register
                    <div className="Ripple"></div>
                  </button>
                  <Link to="/employeesys/login" className="ml-3">Cancel</Link>

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

export default Register;
