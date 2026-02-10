import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const styles = `
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes floatLight {
      0% { transform: translate(0, 0); opacity: 0.3; }
      50% { transform: translate(100px, 50px); opacity: 0.6; }
      100% { transform: translate(0, 0); opacity: 0.3; }
    }
    .animated-bg {
      background: linear-gradient(-45deg, #0f0f0f, #1a1a1a, #2c1e05, #0a0a0a);
      background-size: 400% 400%;
      animation: gradientShift 15s ease infinite;
      position: relative;
      overflow: hidden;
    }
    .light-blob {
      position: absolute;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(255,193,7,0.1) 0%, rgba(0,0,0,0) 70%);
      border-radius: 50%;
      filter: blur(80px);
      animation: floatLight 20s infinite alternate;
      pointer-events: none;
    }
    .action-card {
      position: relative;
      height: 450px;
      border-radius: 24px;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
      text-decoration: none;
      transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
      border: 1px solid rgba(255,255,255,0.1);
      z-index: 2;
    }
    .action-card:hover {
      transform: translateY(-15px);
      border-color: rgba(255,193,7,0.5);
      box-shadow: 0 40px 80px rgba(0,0,0,0.6);
    }
    .action-card img {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 1.2s ease;
      z-index: 1;
      filter: grayscale(20%) brightness(80%);
    }
    .action-card:hover img {
      transform: scale(1.1);
      filter: grayscale(0%) brightness(100%);
    }
    .overlay-content {
      position: relative;
      z-index: 3;
      padding: 40px;
      width: 100%;
      background: linear-gradient(to top, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 100%);
      transition: all 0.4s ease;
    }
    .btn-action {
      margin-top: 20px;
      display: inline-flex;
      align-items: center;
      padding: 12px 24px;
      background: #ffc107;
      color: #000;
      border-radius: 50px;
      font-weight: 800;
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.4s ease;
    }
    .action-card:hover .btn-action {
      transform: translateY(0);
      opacity: 1;
    }
  `;

  return (
    <div className="animated-bg" style={{ minHeight: '100vh', padding: '80px 20px', color: 'white' }}>
      <style>{styles}</style>
      
      {/* Floating Light Blobs */}
      <div className="light-blob" style={{ top: '10%', left: '-10%' }}></div>
      <div className="light-blob" style={{ bottom: '10%', right: '-10%', animationDelay: '-10s' }}></div>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        <header style={{ textAlign: 'center', marginBottom: '80px' }}>
          <span style={{ color: '#ffc107', letterSpacing: '5px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.9rem' }}>
            The Gold Standard
          </span>
          <h2 style={{ fontSize: '3.8rem', fontWeight: '900', margin: '15px 0', letterSpacing: '-2px' }}>
            Choose Your <span style={{ color: '#ffc107' }}>Experience</span>
          </h2>
          <p style={{ color: '#aaa', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Elevate your dining with our exclusive services tailored for the refined palate.
          </p>
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
          gap: '40px' 
        }}>
          
          <ExperienceCard 
            to="/menu"
            img="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800"
            tag="Cuisine"
            title="Gourmet Menu"
            desc="A symphony of seasonal flavors curated by world-class chefs."
          />

          <ExperienceCard 
            to="/private-dining"
            img="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800"
            tag="Exclusivity"
            title="Private Dining"
            desc="Venture into a world of intimacy and bespoke celebrations."
          />

          <ExperienceCard 
            to={isAuthenticated ? "/booking" : "/register"}
            img="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800"
            tag="Convenience"
            title="Fast Reservation"
            desc="Your preferred table is just a few clicks away. Skip the wait."
          />

        </div>
      </div>
    </div>
  );
};

const ExperienceCard = ({ to, img, tag, title, desc }) => (
  <Link to={to} className="action-card">
    <img src={img} alt={title} />
    <div className="overlay-content">
      <span style={{ color: '#ffc107', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>{tag}</span>
      <h3 style={{ fontSize: '2rem', margin: '10px 0', fontWeight: '800' }}>{title}</h3>
      <p style={{ opacity: 0.6, fontSize: '0.95rem', lineHeight: '1.5' }}>{desc}</p>
      <div className="btn-action">
        Discover More <span style={{ marginLeft: '10px' }}>→</span>
      </div>
    </div>
  </Link>
);

export default Home;