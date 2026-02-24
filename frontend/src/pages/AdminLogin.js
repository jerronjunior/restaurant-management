import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
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
    setLoading(true);

    const result = await adminLogin(formData.email, formData.password);

    if (result.success) {
      navigate('/admin');
      // Clear the form after successful login
      setFormData({
        email: '',
        password: ''
      });
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const styles = `
    .admin-login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)),
                  url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80');
      background-size: cover;
      background-position: center;
      padding: 20px;
    }

    .admin-card {
      background: rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 50px 40px;
      border-radius: 28px;
      width: 100%;
      max-width: 460px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.55);
      animation: fadeInUp 0.7s ease-out;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .admin-title {
      color: #fff;
      font-size: 2.3rem;
      font-weight: 800;
      text-align: center;
      margin-bottom: 8px;
      letter-spacing: -1px;
    }

    .admin-subtitle {
      color: #aaa;
      text-align: center;
      margin-bottom: 36px;
      font-size: 0.9rem;
      letter-spacing: 1px;
    }

    .admin-input-group {
      margin-bottom: 24px;
    }

    .admin-input-group label {
      display: block;
      color: #ffb300;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .admin-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 14px 16px;
      border-radius: 12px;
      color: #fff;
      font-size: 1rem;
      transition: 0.3s;
      outline: none;
    }

    .admin-input:focus {
      border-color: #ffb300;
      background: rgba(255, 255, 255, 0.12);
      box-shadow: 0 0 16px rgba(255, 179, 0, 0.2);
    }

    .admin-btn {
      width: 100%;
      padding: 16px;
      background: #ffb300;
      color: #000;
      border: none;
      border-radius: 12px;
      font-weight: 800;
      font-size: 1rem;
      cursor: pointer;
      transition: 0.3s;
      margin-top: 10px;
    }

    .admin-btn:hover:not(:disabled) {
      background: #e69f00;
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(255, 179, 0, 0.3);
    }

    .admin-btn:disabled {
      background: #555;
      cursor: not-allowed;
      color: #888;
    }

    .admin-error {
      background: rgba(255, 77, 77, 0.12);
      color: #ff9b9b;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid rgba(255, 77, 77, 0.2);
      margin-bottom: 20px;
      font-size: 0.9rem;
      text-align: center;
    }

    .admin-link {
      color: #888;
      text-align: center;
      margin-top: 26px;
      font-size: 0.9rem;
    }

    .admin-link a {
      color: #ffb300;
      text-decoration: none;
      font-weight: 700;
    }

    .admin-link a:hover {
      text-decoration: underline;
    }
  `;

  return (
    <div className="admin-login-page">
      <style>{styles}</style>

      <div className="admin-card">
        <h1 className="admin-title">🔐 Admin Portal</h1>
        <p className="admin-subtitle">AUTHORIZED PERSONNEL ONLY</p>
        
        <div style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', color: '#ffc107' }}>
          ⚠️ Only admin credentials are valid here. Regular user accounts cannot access the admin dashboard.
        </div>

        {error && <div className="admin-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <label>Admin Email</label>
            <input
              type="email"
              name="email"
              className="admin-input"
              placeholder="admin@restaurant.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <div className="admin-input-group">
            <label>Admin Password</label>
            <input
              type="password"
              name="password"
              className="admin-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className="admin-btn" disabled={loading}>
            {loading ? 'VERIFYING...' : 'ENTER DASHBOARD'}
          </button>

          <p className="admin-link">
            Not an admin? <Link to="/login">User login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
