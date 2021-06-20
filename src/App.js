// DOM dependencies
import React, {Component} from 'react';
// Routing dependencies
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
// App styles
import './App.css';

// Route components
import PageNotFound from './error_pages/PageNotFound';
import NavBar from './components/NavBar';
import NavBarMobile from './components/NavBarMobile';
import List from './components/List';
import Update from './components/Update';
import Login from './components/Login';
import Verify from './components/Verify';
import Register from './components/Register';

// Component injection
class App extends Component {

  constructor(props) {
    super(props); 

    this.state = {
      apiUrl      : process.env.API_URL || 'https://api.employeesys.mbionos.maremakom.com',
      strAuthToken: (localStorage.getItem('strAuthToken')) ? localStorage.getItem('strAuthToken') : '',
      strFirstName: (localStorage.getItem('strFirstName')) ? localStorage.getItem('strFirstName') : '',
      flgAdmin    : (localStorage.getItem('flgAdmin'))     ? localStorage.getItem('flgAdmin')     : false,
      flgVerified : (localStorage.getItem('flgVerified'))  ? localStorage.getItem('flgVerified')  : false,
      strId       : (localStorage.getItem('strId'))        ? localStorage.getItem('strId')        : '',
    };
  }

  // ==================================================================

  // == save a newly generate log-in token ==
  saveToken = (token, fname, isVerified, isAdmin, _id) => {
    // save the token to the state
    this.setState({...this.state, 
      strAuthToken: token, 
      strFirstName: fname, 
      flgVerified : isVerified, 
      flgAdmin    : isAdmin,
      strId       : _id
    });
    // save the token to the storage
    localStorage.setItem('strAuthToken', token);
    localStorage.setItem('strFirstName', fname);
    localStorage.setItem('flgVerified' , isVerified);
    localStorage.setItem('flgAdmin'    , isAdmin);
    localStorage.setItem('strId'       , _id);
  };

  // == remove token on logout ==
  removeToken = () => {
    // save the token to the state
    this.setState({...this.state, 
      strAuthToken: '', 
      strFirstName: '', 
      flgVerified : '', 
      flgAdmin    : '',
      strId       : ''
    });
    // save the token to the storage
    localStorage.setItem('strAuthToken', '');
    localStorage.setItem('strFirstName', '');
    localStorage.setItem('flgAdmin'    , '');
    localStorage.setItem('flgVerified' , '');
    localStorage.setItem('strId'       , '');
  };

  saveVerifiedState = () => {
    // save the verify flag to the state
    this.setState({...this.state, 
      flgVerified : true, 
    });
    // save the verify flag to the storage
    localStorage.setItem('flgVerified' , true);
  }

  // ==================================================================

  NavBarMobile = () => {
    if (this.state.strAuthToken && this.state.strAuthToken !== '') {
      return (<NavBarMobile {...this.state} removeToken={this.removeToken} />);
    } else {
      return ('');
    }
  };

  NavPadClassName = () => {
    if (this.state.strAuthToken && this.state.strAuthToken !== '') {
      return "NavPad d-block";
    } else {
      return "NavPad d-block NavPadHideMobile";
    }
  }

  render() {
    return (
      <div className="App">

        <Router>

          <NavBar {...this.state} removeToken={this.removeToken} />
          {this.NavBarMobile()}
          <div className={this.NavPadClassName()}></div>
          
          <Switch>

            {/* Standardize home page */}
            <Route exact path="/"             render={()=> <Redirect to='/employeesys/list' />} />
            <Route exact path="/employeesys/" render={()=> <Redirect to='/employeesys/list' />} />

            {/* App pages */}
            <Route exact path="/employeesys/list"     render={(props) => <List     {...this.state} removeToken={this.removeToken}             />} />
            <Route exact path="/employeesys/login"    render={(props) => <Login    {...this.state} saveToken={this.saveToken}                 />} />
            <Route exact path="/employeesys/verify"   render={(props) => <Verify   {...this.state} saveVerifiedState={this.saveVerifiedState} />} />
            <Route exact path="/employeesys/register" render={(props) => <Register {...this.state} saveToken={this.saveToken}                 />} />

            <Route path="/employeesys/update/:employeeid" render={(props) => <Update {...this.state} removeToken={this.removeToken} updatedid={props.match.params.employeeid} />} />

            {/* Catch all the other to 404 */}
            <Route component={PageNotFound} />

          </Switch>
        </Router>

      </div>
    )
  }
};

export default App;
