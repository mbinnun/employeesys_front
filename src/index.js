// DOM dependencies
import React from 'react';
import { render } from 'react-dom';

// MDB-React Styles
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
// Global styles
import './index.css';

// App component
import App from './App';

// Component injection
const Root = () => { 
  return (
    <React.Fragment>
      <App />
    </React.Fragment>
  )
};

// Render in the DOM
render(<Root />, document.getElementById('root'));
