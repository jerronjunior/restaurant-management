import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          🍽️ Restaurant Reservation
        </Link>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          {isAuthenticated ? (
            <>
              <Link to="/cart">Cart</Link>
              <Link to="/booking">Book Table</Link>
              <Link to="/reservations">My Reservations</Link>
              <Link to="/orders">My Orders</Link>
              {user?.role === 'admin' && (
                <Link to="/admin">Admin Dashboard</Link>
              )}
              <span style={{ margin: '0 10px' }}>Hello, {user?.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '5px 15px' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
