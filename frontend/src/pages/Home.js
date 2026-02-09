import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const animations = `
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
      100% { transform: translateY(0px); }
    }
    @keyframes pan {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes slowZoom {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    .glass-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      transition: all 0.4s ease;
    }
    .glass-card:hover {
      transform: translateY(-10px);
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    .floating-icon {
      animation: float 4s ease-in-out infinite;
    }
  `;

  return (
    <div className="page" style={{ 
      background: '#f0f2f5', 
      minHeight: '100vh', 
      fontFamily: "'Poppins', sans-serif",
      position: 'relative',
      overflow: 'hidden' 
    }}>
      <style>{animations}</style>

      {/* Decorative Moving Blobs for depth */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(255,193,7,0.2) 0%, rgba(255,255,255,0) 70%)',
        zIndex: 0
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '40px 20px' }}>
        
        {/* Hero Section */}
        <div style={{ 
          position: 'relative', 
          borderRadius: '30px', 
          overflow: 'hidden', 
          height: '550px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          {/* Animated Background Image */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            animation: 'slowZoom 15s infinite alternate ease-in-out',
            zIndex: -1
          }}></div>

          <div style={{ textAlign: 'center', color: 'white', padding: '0 20px' }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.9rem', fontWeight: '600', marginBottom: '10px', display: 'block' }}>
              Premium Dining Experience
            </span>
            <h1 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '20px', lineHeight: '1.1' }}>
              Taste the <span style={{ color: '#ffc107' }}>Difference</span>
            </h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px', opacity: 0.9 }}>
              From garden to table, we serve only the freshest ingredients prepared by world-class chefs.
            </p>
            
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <Link to="/menu" style={mainBtnStyle}>View Menu</Link>
              <Link to={isAuthenticated ? "/booking" : "/register"} style={outlineBtnStyle}>
                {isAuthenticated ? "Book Table" : "Join the Club"}
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '30px', 
          marginTop: '-60px', // Pulls cards up over the hero image
          padding: '0 20px'
        }}>
          <FeatureCard 
            icon="🍽️" 
            title="Gourmet Menu" 
            text="Explore seasonal flavors and signature dishes crafted for food lovers." 
          />
          <FeatureCard 
            icon="🥂" 
            title="Private Dining" 
            text="Perfect for intimate gatherings, celebrations, and corporate events." 
          />
          <FeatureCard 
            icon="✨" 
            title="Fast Reservation" 
            text="Real-time booking and pre-ordering for a seamless experience." 
          />
        </div>
      </div>
    </div>
  );
};

// Styling for Feature Cards
const FeatureCard = ({ icon, title, text }) => (
  <div className="glass-card" style={{
    padding: '40px 30px',
    borderRadius: '24px',
    textAlign: 'center'
  }}>
    <div className="floating-icon" style={{ fontSize: '3.5rem', marginBottom: '20px' }}>{icon}</div>
    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '15px', color: '#1a1a1a' }}>{title}</h3>
    <p style={{ color: '#555', lineHeight: '1.7', fontSize: '1rem' }}>{text}</p>
  </div>
);

// Button Styles
const mainBtnStyle = {
  backgroundColor: '#ffc107',
  color: '#000',
  padding: '16px 40px',
  borderRadius: '12px',
  fontWeight: '700',
  textDecoration: 'none',
  fontSize: '1rem',
  boxShadow: '0 10px 20px rgba(255, 193, 7, 0.3)',
  transition: 'all 0.3s'
};

const outlineBtnStyle = {
  backgroundColor: 'rgba(255,255,255,0.1)',
  color: '#fff',
  padding: '16px 40px',
  borderRadius: '12px',
  fontWeight: '700',
  textDecoration: 'none',
  fontSize: '1rem',
  border: '1px solid rgba(255,255,255,0.4)',
  backdropFilter: 'blur(5px)',
  transition: 'all 0.3s'
};

export default Home;