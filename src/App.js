// DOM dependencies
import React, {Component} from 'react';
// Routing dependencies
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
// App styles
import './App.css';

// Route components
import PageNotFound from './error_pages/PageNotFound';
import NavBar from './components/NavBar';
import List from './components/List';
import Login from './components/Login';

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

    //console.log("App constructor", this.state); 
  }

  ///componentDidMount()    { console.log("App componentDidMount"); }
  //componentDidUpdate()    { console.log("App componentDidUpdate"); }
  //componentWillUnmount()  { console.log("App componentWillUnmount"); }

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
    localStorage.setItem('flgAdmin'    , isVerified);
    localStorage.setItem('flgVerified' , isAdmin);
    localStorage.setItem('strId'       , _id);
  }

  render() {
    return (
      <div className="App">

        <Router>

          <NavBar />
          <div className="NavPad d-none d-md-block"></div>
          
          <Switch>

            {/* Standardize home page */}
            <Route exact path="/"             render={()=> <Redirect to='/employeesys/list' />} />
            <Route exact path="/employeesys/" render={()=> <Redirect to='/employeesys/list' />} />

            {/* App pages */}
            <Route exact path="/employeesys/list"  render={(props) => <List  {...this.state} />} />
            <Route exact path="/employeesys/login" render={(props) => <Login {...this.state} saveToken={this.saveToken} />} />

            {/* Catch all the other to 404 */}
            <Route component={PageNotFound} />

          </Switch>
        </Router>

      </div>
    )
  }
};

export default App;
