import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  // Styles defined as objects for easy implementation
  const heroStyle = {
    background: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    padding: '100px 20px',
    borderRadius: '15px',
    marginBottom: '50px'
  };

  const cardStyle = {
    padding: '30px',
    borderRadius: '12px',
    background: '#fff',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease',
    border: '1px solid #eee'
  };

  return (
    <div className="page" style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', paddingBottom: '50px' }}>
      <div className="container">
        
        {/* Hero Section */}
        <div style={heroStyle}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px', letterSpacing: '-1px' }}>
              Flavor Meets Elegance
            </h1>
            <p style={{ fontSize: '1.4rem', marginBottom: '40px', opacity: '0.9', fontWeight: '300' }}>
              Experience culinary excellence. Reserve your table and pre-order your favorite dishes today.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/menu" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '15px 40px', borderRadius: '50px', textTransform: 'uppercase', fontWeight: '600' }}>
                Explore Menu
              </Link>
              {isAuthenticated ? (
                <Link to="/booking" className="btn btn-success" style={{ fontSize: '1.1rem', padding: '15px 40px', borderRadius: '50px', textTransform: 'uppercase', fontWeight: '600' }}>
                  Book a Table
                </Link>
              ) : (
                <Link to="/register" className="btn btn-outline-light" style={{ fontSize: '1.1rem', padding: '15px 40px', borderRadius: '50px', border: '2px solid white', color: 'white', textDecoration: 'none', fontWeight: '600' }}>
                  Join Us
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          
          <div style={cardStyle}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🍽️</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Browse Menu</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>Explore our delicious menu items with detailed descriptions and prices.</p>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📅</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Easy Booking</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>Reserve your preferred date and time slot for an unforgettable dining experience.</p>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🛒</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Pre-order Food</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>Save time by selecting your favorite dishes and adding them to your cart before you arrive.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;