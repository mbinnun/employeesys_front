// DOM dependencies
import React, {Component} from 'react';
import { Link } from 'react-router-dom';
// MDB Componenets
import { MDBContainer, MDBRow, MDBCol, MDBInput } from 'mdbreact';
// AJAX helper
import axios from 'axios';
// JQuery
import $ from 'jquery';
// Login styles
import '../components_styles/Login.css';

// Component injection
class Login extends Component {

  state = {};

  // flag to prevent duplicate sendings
  flgSending = 0;

  constructor(props) {
    super(props);
    //console.log("Login constructor", this.props); 
    
    // initialize the error array
    this.state.errors = [];
  }

  // == lifecycle hooks ==
  componentDidMount() { 
    //console.log('componentDidMount');
    
    // redirect an already logged-in employee to the private area
    this.handleLoggedIn();
  }
  //componentDidUpdate()   { console.log("Login componentDidUpdate"); }
  //componentWillUnmount() { console.log("Login componentWillUnmount"); }

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

      const email    = event.target.form[0].value;
      const password = event.target.form[1].value;
      const arrErrors = [];

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
            // no token ==> add an error to the errors array
            arrErrors.push('Wrong email or password');
            this.setState({...this.state, errors: arrErrors});
          }
        })
        .catch(err => { 
          // Error ==> get the error from the response
          this.flgSending = 0;
          $('.Login .Spinner').hide();
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
          console.log(objResponse);
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

  handleLoggedIn = () => {
    // force redirect an already logged-in employee to the personal area
    if (this.props.strAuthToken && this.props.strAuthToken !== '') {
      $('.Container').hide();
      $('.Login .RedirectSpinner').show();
      if (this.props.flgVerified) {
        window.location.href = '/employeesys/list';
      } else {
        window.location.href = '/employeesys/verify';
      }
    }
  }

  render() {
    return (
      <div className="Login">
        <MDBContainer className="Container">
          <MDBRow className="Row align-items-center justify-content-center flex-column">
            <p className="Title h2 text-center mb-4">Sign in</p>
            <MDBCol md="6" className="Col mx-auto bg-white">
              <img src="/boy.png" alt="boy" className="Boy" />

              {/* login form */}
              <form onSubmit={this.handleSubmit}>
                <div className="grey-text">

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
                    Sign In
                    <div className="Ripple"></div>
                  </button>

                </div>
              </form>

            </MDBCol>

            {/* sign up link */}
            <p className="SignUp mt-4 font-weight-bold">
              Don't have an account? <Link to="/employeesys/register" title="Click to sign up">Sign Up</Link>
            </p>

          </MDBRow>
        </MDBContainer>
        {/* Redirect spinner */}
        <div className="RedirectSpinner"><div className="spinner-border" role="status"><span className="sr-only">Loading...</span></div></div>
      </div>
    )
  }
};

export default Login;
