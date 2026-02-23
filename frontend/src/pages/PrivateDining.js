import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createReservation } from '../services/reservationService';

const PrivateDining = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: 10,
    occasion: '',
    specialRequests: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    menuPreference: 'custom'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Calculate price based on guests and menu preference
  const calculatePrice = () => {
    const guests = parseInt(formData.guests) || 10;
    let pricePerPerson = 15000; // Custom menu base price
    
    switch(formData.menuPreference) {
      case 'traditional':
        pricePerPerson = 12000;
        break;
      case 'fusion':
        pricePerPerson = 13500;
        break;
      case 'custom':
      default:
        pricePerPerson = 15000;
        break;
    }
    
    return pricePerPerson * guests;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/private-dining' } });
      return;
    }

    setError('');
    setLoading(true);

    try {
      const reservationData = {
        date: formData.date,
        time: formData.time,
        tableSize: parseInt(formData.guests),
        specialRequests: `Private Dining - Occasion: ${formData.occasion}\nMenu: ${formData.menuPreference}\nPhone: ${formData.phone}\nRequests: ${formData.specialRequests}`,
        orderItems: []
      };

      await createReservation(reservationData);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/reservations');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const styles = `
    .private-dining-page {
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1508 100%);
      min-height: 100vh;
      padding: 80px 20px 50px;
      color: white;
    }

    .pd-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .pd-hero {
      text-align: center;
      margin-bottom: 60px;
      position: relative;
    }

    .pd-hero::before {
      content: '';
      position: absolute;
      top: -50px;
      left: 50%;
      transform: translateX(-50%);
      width: 150px;
      height: 150px;
      background: radial-gradient(circle, rgba(255,193,7,0.2) 0%, transparent 70%);
      border-radius: 50%;
      filter: blur(40px);
      z-index: 0;
    }

    .pd-badge {
      display: inline-block;
      background: rgba(255,193,7,0.15);
      color: #ffc107;
      padding: 8px 24px;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      border: 1px solid rgba(255,193,7,0.3);
      margin-bottom: 20px;
    }

    .pd-title {
      font-size: 3.5rem;
      font-weight: 900;
      margin: 0 0 20px;
      letter-spacing: -2px;
      background: linear-gradient(135deg, #fff 0%, #ffc107 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .pd-subtitle {
      font-size: 1.2rem;
      color: #999;
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.8;
    }

    .pd-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 60px;
    }

    @media (max-width: 968px) {
      .pd-grid { grid-template-columns: 1fr; }
      .pd-title { font-size: 2.5rem; }
    }

    .pd-card {
      background: rgba(255,255,255,0.03);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      padding: 40px;
      transition: all 0.3s ease;
    }

    .pd-card:hover {
      border-color: rgba(255,193,7,0.3);
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    }

    .pd-card h3 {
      font-size: 1.8rem;
      font-weight: 800;
      color: #ffc107;
      margin: 0 0 25px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .step-indicator {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 35px;
      height: 35px;
      background: rgba(255,193,7,0.2);
      border-radius: 50%;
      font-size: 0.9rem;
      font-weight: 700;
    }

    .form-group {
      margin-bottom: 25px;
    }

    .form-group label {
      display: block;
      color: #ffc107;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }

    .form-input {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 14px 18px;
      border-radius: 12px;
      color: white;
      font-size: 1rem;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .form-input:focus {
      outline: none;
      border-color: #ffc107;
      background: rgba(255,255,255,0.08);
      box-shadow: 0 0 20px rgba(255,193,7,0.15);
    }

    textarea.form-input {
      resize: vertical;
      min-height: 100px;
    }

    select.form-input {
      cursor: pointer;
    }

    .form-input option {
      background: #1a1a1a;
      color: white;
      padding: 10px;
    }

    .radio-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .radio-option {
      position: relative;
    }

    .radio-option input[type="radio"] {
      position: absolute;
      opacity: 0;
    }

    .radio-label {
      display: block;
      padding: 14px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 600;
    }

    .radio-option input[type="radio"]:checked + .radio-label {
      background: rgba(255,193,7,0.2);
      border-color: #ffc107;
      color: #ffc107;
    }

    .radio-label:hover {
      border-color: rgba(255,193,7,0.5);
    }

    .btn-primary {
      width: 100%;
      padding: 16px;
      background: #ffc107;
      color: #000;
      border: none;
      border-radius: 12px;
      font-weight: 800;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .btn-primary:hover:not(:disabled) {
      background: #ffb300;
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(255,193,7,0.4);
    }

    .btn-primary:disabled {
      background: #444;
      color: #888;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      width: 100%;
      padding: 14px;
      background: transparent;
      color: #999;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 12px;
    }

    .btn-secondary:hover {
      border-color: #ffc107;
      color: #ffc107;
    }

    .error-box {
      background: rgba(255,77,77,0.15);
      color: #ffb3b3;
      padding: 14px 18px;
      border-radius: 12px;
      border-left: 4px solid #ff4d4d;
      margin-bottom: 25px;
      font-size: 0.9rem;
    }

    .success-box {
      background: rgba(76,175,80,0.15);
      color: #b3ffb3;
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #4caf50;
      text-align: center;
      font-size: 1.1rem;
    }

    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .feature-list li {
      padding: 15px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      display: flex;
      align-items: center;
      gap: 12px;
      color: #ccc;
    }

    .feature-list li:last-child {
      border-bottom: none;
    }

    .feature-icon {
      color: #ffc107;
      font-size: 1.2rem;
    }

    .price-tag {
      display: inline-block;
      background: rgba(255,193,7,0.15);
      color: #ffc107;
      padding: 6px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.9rem;
      margin-top: 10px;
    }
  `;

  if (success) {
    return (
      <div className="private-dining-page">
        <style>{styles}</style>
        <div className="pd-container">
          <div className="pd-hero">
            <div style={{ fontSize: '5rem', marginBottom: '20px' }}>✨</div>
            <div className="success-box">
              <h2 style={{ margin: '0 0 15px', fontSize: '2rem' }}>Reservation Confirmed!</h2>
              <p style={{ margin: 0, color: '#b3ffb3' }}>
                Your private dining experience has been reserved. We'll contact you shortly to finalize the details.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="private-dining-page">
      <style>{styles}</style>
      
      <div className="pd-container">
        <div className="pd-hero">
          <span className="pd-badge">Exclusive Experience</span>
          <h1 className="pd-title">Private Dining</h1>
          <p className="pd-subtitle">
            Indulge in an intimate culinary journey crafted exclusively for you and your guests. 
            Our private dining spaces offer the perfect setting for celebrations, business gatherings, and special occasions.
          </p>
        </div>

        <div className="pd-grid">
          {/* Left Column - Features */}
          <div className="pd-card">
            <h3>
              <span className="step-indicator">✦</span>
              What's Included
            </h3>
            
            <ul className="feature-list">
              <li>
                <span className="feature-icon">👨‍🍳</span>
                <span>Dedicated chef and personalized menu</span>
              </li>
              <li>
                <span className="feature-icon">🍷</span>
                <span>Premium wine pairing selection</span>
              </li>
              <li>
                <span className="feature-icon">🎭</span>
                <span>Private dining room with ambient lighting</span>
              </li>
              <li>
                <span className="feature-icon">🎵</span>
                <span>Custom music and entertainment options</span>
              </li>
              <li>
                <span className="feature-icon">💐</span>
                <span>Bespoke table arrangements and decor</span>
              </li>
              <li>
                <span className="feature-icon">👔</span>
                <span>Professional sommelier and wait staff</span>
              </li>
            </ul>

            <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255,193,7,0.05)', borderRadius: '12px', border: '1px solid rgba(255,193,7,0.2)' }}>
              <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '8px' }}>Estimated Total</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffc107' }}>Rs. {calculatePrice().toLocaleString()}</div>
              <div style={{ fontSize: '0.85rem', color: '#777' }}>
                {formData.guests} guests × Rs. {(calculatePrice() / (parseInt(formData.guests) || 10)).toLocaleString()} per person
              </div>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '8px' }}>
                Menu: {formData.menuPreference === 'custom' ? 'Custom' : formData.menuPreference === 'traditional' ? 'Traditional' : 'Fusion'}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="pd-card">
            <h3>
              <span className="step-indicator">1</span>
              Reserve Your Experience
            </h3>

            {error && <div className="error-box">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Preferred Date</label>
                  <input
                    type="date"
                    name="date"
                    className="form-input"
                    value={formData.date}
                    onChange={handleChange}
                    min={today}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    name="time"
                    className="form-input"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Guests & Occasion */}
              <div className="form-group">
                <label>Number of Guests</label>
                <input
                  type="number"
                  name="guests"
                  className="form-input"
                  value={formData.guests}
                  onChange={handleChange}
                  min="10"
                  max="50"
                  required
                />
              </div>

              <div className="form-group">
                <label>Occasion</label>
                <select
                  name="occasion"
                  className="form-input"
                  value={formData.occasion}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an occasion</option>
                  <option value="birthday">Birthday Celebration</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="business">Business Dinner</option>
                  <option value="wedding">Wedding/Engagement</option>
                  <option value="reunion">Family Reunion</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Menu Preference */}
              <div className="form-group">
                <label>Menu Preference</label>
                <div className="radio-group">
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="custom"
                      name="menuPreference"
                      value="custom"
                      checked={formData.menuPreference === 'custom'}
                      onChange={handleChange}
                    />
                    <label htmlFor="custom" className="radio-label">
                      Custom Menu <span style={{ color: '#ffc107', fontSize: '0.85rem', marginLeft: '8px' }}>(Rs. 15,000/person)</span>
                    </label>
                  </div>
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="traditional"
                      name="menuPreference"
                      value="traditional"
                      checked={formData.menuPreference === 'traditional'}
                      onChange={handleChange}
                    />
                    <label htmlFor="traditional" className="radio-label">
                      Traditional <span style={{ color: '#ffc107', fontSize: '0.85rem', marginLeft: '8px' }}>(Rs. 12,000/person)</span>
                    </label>
                  </div>
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="fusion"
                      name="menuPreference"
                      value="fusion"
                      checked={formData.menuPreference === 'fusion'}
                      onChange={handleChange}
                    />
                    <label htmlFor="fusion" className="radio-label">
                      Fusion <span style={{ color: '#ffc107', fontSize: '0.85rem', marginLeft: '8px' }}>(Rs. 13,500/person)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="+94 71 234 5678"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Special Requests */}
              <div className="form-group">
                <label>Special Requests (Optional)</label>
                <textarea
                  name="specialRequests"
                  className="form-input"
                  placeholder="Dietary restrictions, allergies, decor preferences..."
                  value={formData.specialRequests}
                  onChange={handleChange}
                />
              </div>

              {/* Price Summary */}
              <div style={{ 
                marginTop: '20px', 
                padding: '20px', 
                background: 'linear-gradient(135deg, rgba(255,193,7,0.1) 0%, rgba(255,193,7,0.05) 100%)', 
                borderRadius: '12px', 
                border: '2px solid rgba(255,193,7,0.3)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#999', marginBottom: '5px' }}>Total Amount</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffc107' }}>Rs. {calculatePrice().toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#aaa' }}>
                    <div>{formData.guests} guests</div>
                    <div style={{ textTransform: 'capitalize' }}>{formData.menuPreference} menu</div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Processing...' : '✓ Reserve Now'}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate(-1)}
              >
                ← Back
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateDining;
