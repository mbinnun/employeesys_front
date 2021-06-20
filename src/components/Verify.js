// DOM dependencies
import React, {Component} from 'react';
import { Link } from 'react-router-dom';
// MDB Componenets
import { MDBContainer, MDBRow, MDBCol, MDBInput } from 'mdbreact';
// AJAX helper
import axios from 'axios';
// JQuery
import $ from 'jquery';
// Verify styles
import '../components_styles/Verify.css';

// Component injection
class Verify extends Component {

  state = {};

  // flag to prevent duplicate sendings
  flgSending = 0;

  constructor(props) {
    super(props);
    //console.log("Verify constructor", this.props); 
    
    // initialize the error array
    this.state.errors = [];
  }

  // == lifecycle hooks ==
  componentDidMount() { 
    //console.log('componentDidMount');
    
    // redirect an already logged-in employee to the private area
    this.handleLoggedIn();
  }
  //componentDidUpdate()   { console.log("Verify componentDidUpdate"); }
  //componentWillUnmount() { console.log("Verify componentWillUnmount"); }

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

      const code = event.target.form[0].value;
      const arrErrors = [];

      // check password
      if (code === "") {
        // code error ==> add to the errors array
        arrErrors.push('Verification code is required');
      }
      else if (code.length != 4) {
        // code error ==> add to the errors array
        arrErrors.push('Invalid verification code');
      }

      this.setState({...this.state, errors: arrErrors});

      // if no errors - submit to the API
      if (arrErrors.length === 0) {
        this.flgSending = 1;
        $('.Verify .Spinner').show();

        // send a log-in request to the API
        axios.put(this.props.apiUrl + '/api/employees/verify/'+code, {}, {
          headers: {
            'Authorization': 'Bearer '+this.props.strAuthToken
          }
        })
        .then(resp => {
          // Success ==> save the verified flag to the state
          this.flgSending = 0;
          $('.Verify .Spinner').hide();
          const objResponse = resp.data;
          console.log(objResponse);
          if (objResponse.data && objResponse.data.flgEmailVerified && (objResponse.data.flgEmailVerified === true || objResponse.data.flgEmailVerified === 'true')) {

            // token generated ==> save the token
            this.props.saveVerifiedState();

            // force moving the verified user to personal area
            window.location.href = '/employeesys/list';
            
          } else {
            // no token ==> add an error to the errors array
            arrErrors.push('Wrong verification code');
            this.setState({...this.state, errors: arrErrors});
          }
        })
        .catch(err => { 
          // Error ==> get the error from the response
          this.flgSending = 0;
          $('.Verify .Spinner').hide();
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
            arrErrors.push(objResponse.data);
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
      if (this.props.flgVerified && (this.props.flgVerified === true || this.props.flgVerified === 'true')) {
        // Already verified ==> Go to the list
        $('.Container').hide();
        $('.Verify .RedirectSpinner').show();
        window.location.href = '/employeesys/list';
      }
    } else {
      // Not logged in ==> Go to login
      $('.Container').hide();
      $('.Verify .RedirectSpinner').show();
      window.location.href = '/employeesys/login';
    }
  }

  render() {
    return (
      <div className="Verify">
        <MDBContainer className="Container">
          <MDBRow className="Row align-items-center justify-content-center flex-column">
            <p className="h2 text-center">Verify Email</p>
            <p className="Title h6 text-center mb-4">Check your mailbox for the code.</p>
            <MDBCol md="6" className="Col mx-auto bg-white">
              <img src="/question.png" alt="question" className="Question" />

              {/* verify form */}
              <form onSubmit={this.handleSubmit}>
                <div className="grey-text">

                  {/* Verification code */}
                  <MDBInput label="Verification Code" icon="lock" group type="password" name="code" validate />

                </div>
                <div className="text-center">

                  {/* loader */}
                  <div className="Spinner"><div className="spinner-border" role="status"><span className="sr-only">Loading...</span></div></div>

                  {/* show form validation errors */}
                  {this.ErrorList()}
                  
                  {/* submit button */}
                  <button type="submit" className="btn btn-primary Ripple-parent Btn" onClick={(event) => this.handleSubmit(event)}>
                    Verify
                    <div className="Ripple"></div>
                  </button>

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

export default Verify;
