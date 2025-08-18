import React from "react";
import { Link } from "react-router-dom";

function Navbar({ isAuthenticated, user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <Link to="/" className="navbar-brand">
            FocusFlow
          </Link>

          <ul className="navbar-nav">
            {isAuthenticated ? (
              <>
                <li>
                  <span>Welcome, {user?.username}!</span>
                </li>
                <li>
                  <button onClick={onLogout} className="btn btn-secondary">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
