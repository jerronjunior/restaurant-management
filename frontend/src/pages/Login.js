import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    role: 'user',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, adminLogin } = useAuth();
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

    const result = formData.role === 'admin'
      ? await adminLogin(formData.email, formData.password)
      : await login(formData.email, formData.password);
    
    if (result.success) {
      navigate(formData.role === 'admin' ? '/admin' : '/');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const styles = `
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
                  url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80');
      background-size: cover;
      background-position: center;
      padding: 20px;
    }

    .glass-form-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 50px 40px;
      border-radius: 30px;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
      animation: fadeIn 0.8s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .login-title {
      color: #fff;
      font-size: 2.5rem;
      font-weight: 800;
      text-align: center;
      margin-bottom: 10px;
      letter-spacing: -1px;
    }

    .login-subtitle {
      color: #aaa;
      text-align: center;
      margin-bottom: 40px;
      font-size: 0.95rem;
    }

    .role-toggle {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 25px;
    }

    .role-button {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
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

    .custom-input-group {
      margin-bottom: 25px;
    }

    .custom-input-group label {
      display: block;
      color: #ffc107;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .custom-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 12px;
      color: #fff;
      font-size: 1rem;
      transition: 0.3s;
      outline: none;
    }

    .custom-input:focus {
      border-color: #ffc107;
      background: rgba(255, 255, 255, 0.12);
      box-shadow: 0 0 15px rgba(255, 193, 7, 0.2);
    }

    .login-btn {
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
      margin-top: 10px;
    }

    .login-btn:hover:not(:disabled) {
      background: #e6ae00;
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(255, 193, 7, 0.3);
    }

    .login-btn:disabled {
      background: #555;
      cursor: not-allowed;
      color: #888;
    }

    .error-msg {
      background: rgba(255, 77, 77, 0.1);
      color: #ff4d4d;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid rgba(255, 77, 77, 0.2);
      margin-bottom: 20px;
      font-size: 0.9rem;
      text-align: center;
    }

    .register-link {
      color: #888;
      text-align: center;
      margin-top: 30px;
      font-size: 0.9rem;
    }

    .register-link a {
      color: #ffc107;
      text-decoration: none;
      font-weight: 700;
    }

    .register-link a:hover {
      text-decoration: underline;
    }
  `;

  return (
    <div className="login-page">
      <style>{styles}</style>
      
      <div className="glass-form-card">
        <h1 className="login-title">Welcome <span style={{ color: '#ffc107' }}>Back</span></h1>
        <p className="login-subtitle">Please enter your details to continue</p>
        
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="role-toggle">
            <button
              type="button"
              className={`role-button ${formData.role === 'user' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'user' })}
            >
              User Login
            </button>
            <button
              type="button"
              className={`role-button ${formData.role === 'admin' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'admin' })}
            >
              Admin Login
            </button>
          </div>

          <div className="custom-input-group">
            <label>{formData.role === 'admin' ? 'Admin ID (Email)' : 'Email Address'}</label>
            <input
              type="email"
              name="email"
              className="custom-input"
              placeholder={formData.role === 'admin' ? 'admin@example.com' : 'name@example.com'}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="custom-input-group">
            <label>{formData.role === 'admin' ? 'Security Key' : 'Password'}</label>
            <input
              type="password"
              name="password"
              className="custom-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'AUTHENTICATING...' : formData.role === 'admin' ? 'ENTER DASHBOARD' : 'SIGN IN'}
          </button>

          {formData.role === 'user' && (
            <p className="register-link">
              Don't have an account? <Link to="/register">Create an account</Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;