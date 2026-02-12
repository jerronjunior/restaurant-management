import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    role: 'user',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.role
    );
    
    if (result.success) {
      navigate(formData.role === 'admin' ? '/admin' : '/');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const styles = `
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), 
                  url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80');
      background-size: cover;
      background-position: center;
      padding: 40px 20px;
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 40px;
      border-radius: 30px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
      animation: slideUp 0.6s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .auth-title {
      color: #fff;
      font-size: 2.2rem;
      font-weight: 900;
      text-align: center;
      margin-bottom: 8px;
      letter-spacing: -1px;
    }

    .auth-subtitle {
      color: #888;
      text-align: center;
      margin-bottom: 35px;
      font-size: 0.9rem;
      letter-spacing: 1px;
    }

    .role-toggle {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
    }

    .role-button {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 12px;
      border-radius: 12px;
      color: #bbb;
      font-weight: 700;
      cursor: pointer;
      transition: 0.3s;
    }

    .role-button.active {
      background: #ffc107;
      color: #000;
      border-color: #ffc107;
      box-shadow: 0 10px 20px rgba(255, 193, 7, 0.25);
    }

    .input-group {
      margin-bottom: 20px;
    }

    .input-group label {
      display: block;
      color: #ffc107;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 8px;
      margin-left: 5px;
    }

    .premium-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 14px 18px;
      border-radius: 12px;
      color: #fff;
      font-size: 1rem;
      transition: all 0.3s;
      outline: none;
    }

    .premium-input:focus {
      border-color: #ffc107;
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 0 20px rgba(255, 193, 7, 0.15);
    }

    .register-btn {
      width: 100%;
      padding: 16px;
      background: #ffc107;
      color: #000;
      border: none;
      border-radius: 12px;
      font-weight: 800;
      font-size: 1rem;
      cursor: pointer;
      transition: 0.3s;
      margin-top: 15px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .register-btn:hover:not(:disabled) {
      background: #fff;
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
    }

    .register-btn:disabled {
      background: #444;
      color: #777;
      cursor: not-allowed;
    }

    .error-box {
      background: rgba(255, 77, 77, 0.15);
      color: #ffb3b3;
      padding: 12px;
      border-radius: 10px;
      border-left: 4px solid #ff4d4d;
      margin-bottom: 25px;
      font-size: 0.85rem;
    }

    .footer-text {
      color: #aaa;
      text-align: center;
      margin-top: 25px;
      font-size: 0.9rem;
    }

    .footer-text a {
      color: #ffc107;
      text-decoration: none;
      font-weight: 700;
      margin-left: 5px;
    }

    .footer-text a:hover {
      color: #fff;
    }
  `;

  return (
    <div className="auth-page">
      <style>{styles}</style>
      
      <div className="glass-card">
        <h1 className="auth-title">Create <span style={{ color: '#ffc107' }}>Account</span></h1>
        <p className="auth-subtitle">JOIN OUR EXCLUSIVE DINING CIRCLE</p>
        
        {error && <div className="error-box">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="role-toggle">
            <button
              type="button"
              className={`role-button ${formData.role === 'user' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'user' })}
            >
              User Register
            </button>
            <button
              type="button"
              className={`role-button ${formData.role === 'admin' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'admin' })}
            >
              Admin Register
            </button>
          </div>

          <div className="input-group">
            <label>{formData.role === 'admin' ? 'Admin Name' : 'Full Name'}</label>
            <input
              type="text"
              name="name"
              className="premium-input"
              placeholder={formData.role === 'admin' ? 'Admin User' : 'John Doe'}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>{formData.role === 'admin' ? 'Admin ID (Email)' : 'Email Address'}</label>
            <input
              type="email"
              name="email"
              className="premium-input"
              placeholder={formData.role === 'admin' ? 'admin@example.com' : 'john@example.com'}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="input-group">
              <label>{formData.role === 'admin' ? 'Security Key' : 'Password'}</label>
              <input
                type="password"
                name="password"
                className="premium-input"
                placeholder="••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>{formData.role === 'admin' ? 'Confirm Key' : 'Confirm'}</label>
              <input
                type="password"
                name="confirmPassword"
                className="premium-input"
                placeholder="••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="register-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : formData.role === 'admin' ? 'Create Admin' : 'Create Account'}
          </button>

          <p className="footer-text">
            Already a member? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;