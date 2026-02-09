import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  // Animation CSS injected via a style tag
  const animationStyles = `
    @keyframes slowZoom {
      0% { transform: scale(1); }
      50% { transform: scale(1.1) translateX(-10px); }
      100% { transform: scale(1); }
    }
    .hero-bg-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      overflow: hidden;
      border-radius: 20px;
    }
    .moving-bg {
      width: 100%;
      height: 100%;
      background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), 
                  url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80");
      background-size: cover;
      background-position: center;
      animation: slowZoom 20s infinite ease-in-out;
    }
  `;

  return (
    <div className="page" style={{ padding: '20px', backgroundColor: '#fcfcfc' }}>
      <style>{animationStyles}</style>
      
      <div className="container">
        {/* Hero Section with Moving Background */}
        <div style={{ 
          position: 'relative', 
          overflow: 'hidden', 
          borderRadius: '20px', 
          padding: '120px 20px', 
          textAlign: 'center',
          marginBottom: '60px',
          color: 'white'
        }}>
          <div className="hero-bg-container">
            <div className="moving-bg"></div>
          </div>

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px', textShadow: '2px 2px 10px rgba(0,0,0,0.3)' }}>
              A Taste of Perfection
            </h1>
            <p style={{ fontSize: '1.3rem', marginBottom: '40px', opacity: '0.9' }}>
              Experience flavors that dance on your palate. Join us for an unforgettable meal.
            </p>
            
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <Link to="/menu" className="btn btn-primary" style={btnStyle('#ffc107', '#000')}>
                View Menu
              </Link>
              <Link to={isAuthenticated ? "/booking" : "/register"} className="btn" style={btnStyle('transparent', '#fff', '2px solid #fff')}>
                {isAuthenticated ? "Book Table" : "Get Started"}
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          <FeatureCard icon="🍷" title="Exquisite Menu" text="Carefully curated dishes from world-class chefs." />
          <FeatureCard icon="⭐" title="Top Rated" text="Voted the city's favorite dining destination 3 years in a row." />
          <FeatureCard icon="🕒" title="Fast Service" text="Pre-order your meal and have it ready exactly when you arrive." />
        </div>
      </div>
    </div>
  );
};

// Helper Components for cleaner code
const FeatureCard = ({ icon, title, text }) => (
  <div style={{
    background: '#fff',
    padding: '40px 30px',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    textAlign: 'center',
    border: '1px solid #f0f0f0'
  }}>
    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{icon}</div>
    <h3 style={{ marginBottom: '15px', color: '#333' }}>{title}</h3>
    <p style={{ color: '#777', lineHeight: '1.6' }}>{text}</p>
  </div>
);

const btnStyle = (bg, color, border = 'none') => ({
  padding: '14px 35px',
  borderRadius: '50px',
  backgroundColor: bg,
  color: color,
  fontWeight: 'bold',
  textDecoration: 'none',
  border: border,
  transition: 'all 0.3s ease'
});

export default Home;