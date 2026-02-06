import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page">
      <div className="container">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#2c3e50' }}>
            Welcome to Our Restaurant
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '40px', color: '#666' }}>
            Reserve your table and pre-order your favorite dishes
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/menu" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '15px 30px' }}>
              View Menu
            </Link>
            {isAuthenticated ? (
              <Link to="/booking" className="btn btn-success" style={{ fontSize: '1.1rem', padding: '15px 30px' }}>
                Book a Table
              </Link>
            ) : (
              <Link to="/register" className="btn btn-success" style={{ fontSize: '1.1rem', padding: '15px 30px' }}>
                Get Started
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-3" style={{ marginTop: '60px' }}>
          <div className="card">
            <h3 style={{ marginBottom: '15px' }}>🍽️ Browse Menu</h3>
            <p>Explore our delicious menu items with detailed descriptions and prices.</p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '15px' }}>📅 Book Table</h3>
            <p>Reserve your preferred date and time slot for dining.</p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '15px' }}>🛒 Pre-order Food</h3>
            <p>Select your favorite dishes and add them to your cart before arrival.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
