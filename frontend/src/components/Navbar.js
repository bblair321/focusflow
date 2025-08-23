import React from "react";
import { Link } from "react-router-dom";

function Navbar({ isAuthenticated, user, onLogout }) {
  // Helper function to capitalize first letter of username
  const capitalizeUsername = (username) => {
    if (!username) return "";
    return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          FocusFlow
        </Link>

        <ul className="navbar-nav">
          {isAuthenticated ? (
            <>
              <li className="welcome-message">
                <span>Welcome, {capitalizeUsername(user?.username)}!</span>
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
                <Link to="/login" className="nav-link">Login</Link>
              </li>
              <li>
                <Link to="/register" className="nav-link">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
