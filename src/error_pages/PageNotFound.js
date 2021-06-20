// DOM dependencies
import React from 'react';
import { Link } from 'react-router-dom';

// 404 Styles
import './PageNotFound.css';

const PageNotFound = () => {
  return (
    <div className="PageNotFound">
      <div className="row">
        <div className="col-md-12">
          <div className="template">

            {/* 404 Message */}
            <h1>
              Oops!
            </h1>
            <h2>
              404 Not Found
            </h2>
            <div className="details">
                The page was not found.
            </div>

            {/* Back button */}
            <div className="actions">
              <Link to="/employeesys/list" title="Click to go back to home page" className="btn btn-primary btn-lg">
                <span className="glyphicon glyphicon-home"></span>Go back 
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default PageNotFound;
