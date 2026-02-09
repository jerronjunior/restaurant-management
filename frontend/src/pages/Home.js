import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const styles = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .action-card {
      position: relative;
      height: 400px;
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
      text-decoration: none;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255,255,255,0.1);
      animation: fadeIn 0.8s ease-out forwards;
    }
    .action-card:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 30px 60px rgba(0,0,0,0.4);
    }
    .action-card img {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 0.7s ease;
      z-index: 1;
    }
    .action-card:hover img {
      transform: scale(1.1);
    }
    .overlay {
      position: relative;
      z-index: 2;
      width: 100%;
      padding: 30px;
      background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%);
      color: white;
    }
    .btn-circle {
      width: 50px;
      height: 50px;
      background: #ffc107;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 15px;
      color: black;
      font-weight: bold;
      transition: width 0.3s ease;
      overflow: hidden;
      white-space: nowrap;
    }
    .action-card:hover .btn-circle {
      width: 140px;
      border-radius: 25px;
    }
  `;

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '60px 20px', color: 'white' }}>
      <style>{styles}</style>
      
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-1px' }}>
            Choose Your <span style={{ color: '#ffc107' }}>Experience</span>
          </h2>
          <p style={{ color: '#888', fontSize: '1.1rem' }}>Elevate your dining with our exclusive services</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '30px' 
        }}>
          
          {/* Gourmet Menu Card */}
          <Link to="/menu" className="action-card">
            <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80" alt="Menu" />
            <div className="overlay">
              <span style={{ color: '#ffc107', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Cuisine</span>
              <h3 style={{ fontSize: '1.8rem', margin: '5px 0' }}>Gourmet Menu</h3>
              <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Chef-curated seasonal dishes with rare ingredients.</p>
              <div className="btn-circle">→ <span style={{ marginLeft: '10px' }}>Explore</span></div>
            </div>
          </Link>

          {/* Private Dining Card */}
          <Link to="/private-dining" className="action-card">
            <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80" alt="Private" />
            <div className="overlay">
              <span style={{ color: '#ffc107', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Exclusive</span>
              <h3 style={{ fontSize: '1.8rem', margin: '5px 0' }}>Private Dining</h3>
              <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Intimate spaces for your most important celebrations.</p>
              <div className="btn-circle">→ <span style={{ marginLeft: '10px' }}>Reserve</span></div>
            </div>
          </Link>

          {/* Fast Reservation Card */}
          <Link to={isAuthenticated ? "/booking" : "/register"} className="action-card">
            <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80" alt="Reservation" />
            <div className="overlay">
              <span style={{ color: '#ffc107', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Instant</span>
              <h3 style={{ fontSize: '1.8rem', margin: '5px 0' }}>Fast Reservation</h3>
              <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Skip the wait. Secure your favorite table in seconds.</p>
              <div className="btn-circle">→ <span style={{ marginLeft: '10px' }}>Book Now</span></div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default Home;