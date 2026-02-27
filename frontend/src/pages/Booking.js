import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createReservation } from '../services/reservationService';
import { createOrder } from '../services/orderService';
import { createPayment } from '../services/paymentService';
import { formatPriceLabel, getNumericPrice } from '../utils/price';

const Booking = () => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    tableSize: 2
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');

    if (cart.length === 0) {
      setError('Please add items to your cart first');
      return;
    }

    setLoading(true);

    try {
      // Prepare order items for reservation
      const orderItems = cart.map((item) => ({
        menuItemId: item._id,
        quantity: item.quantity
      }));

      // Create reservation
      const reservationResponse = await createReservation({
        date: formData.date,
        time: formData.time,
        tableSize: parseInt(formData.tableSize),
        orderItems
      });

      // Create order
      const orderResponse = await createOrder({
        items: orderItems,
        reservationId: reservationResponse.data._id
      });

      // Process payment (simulated)
      await createPayment({
        orderId: orderResponse.data._id,
        method: 'Online Payment'
      });

      setSuccess('Reservation and order created successfully!');
      clearCart();
      
      setTimeout(() => {
        navigate('/reservations');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  const styles = `
    .booking-page {
      min-height: 100vh;
      padding: 100px 20px 60px;
      background: linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), 
                  url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
    }

    .booking-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .booking-title {
      color: #fff;
      font-size: 3rem;
      font-weight: 800;
      text-align: center;
      margin-bottom: 15px;
      letter-spacing: -1px;
      text-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    }

    .booking-subtitle {
      color: #ffc107;
      text-align: center;
      margin-bottom: 50px;
      font-size: 1.1rem;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .booking-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 30px;
    }

    @media (max-width: 968px) {
      .booking-grid {
        grid-template-columns: 1fr;
      }
    }

    .glass-booking-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
      animation: fadeIn 0.8s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .card-heading {
      color: #fff;
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid rgba(255, 193, 7, 0.3);
    }

    .booking-form-group {
      margin-bottom: 25px;
    }

    .booking-form-group label {
      display: block;
      color: #ffc107;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }

    .booking-input {
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

    .booking-input:focus {
      border-color: #ffc107;
      background: rgba(255, 255, 255, 0.12);
      box-shadow: 0 0 15px rgba(255, 193, 7, 0.2);
    }

    .booking-btn {
      width: 100%;
      padding: 18px;
      background: #ffc107;
      color: #000;
      border: none;
      border-radius: 12px;
      font-weight: 800;
      font-size: 1rem;
      cursor: pointer;
      transition: 0.3s;
      margin-top: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .booking-btn:hover:not(:disabled) {
      background: #e6ae00;
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(255, 193, 7, 0.3);
    }

    .booking-btn:disabled {
      background: #555;
      cursor: not-allowed;
      color: #888;
    }

    .booking-alert-error {
      background: rgba(255, 77, 77, 0.15);
      color: #ffb3b3;
      padding: 15px;
      border-radius: 12px;
      border-left: 4px solid #ff4d4d;
      margin-bottom: 30px;
      font-size: 0.95rem;
    }

    .booking-alert-success {
      background: rgba(76, 175, 80, 0.15);
      color: #a5d6a7;
      padding: 15px;
      border-radius: 12px;
      border-left: 4px solid #4caf50;
      margin-bottom: 30px;
      font-size: 0.95rem;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .order-total {
      display: flex;
      justify-content: space-between;
      margin-top: 25px;
      padding-top: 25px;
      border-top: 2px solid rgba(255, 193, 7, 0.3);
      font-size: 1.5rem;
      font-weight: bold;
      color: #ffc107;
    }

    .empty-cart {
      color: #aaa;
      text-align: center;
      padding: 20px;
    }

    .empty-cart a {
      color: #ffc107;
      text-decoration: none;
      font-weight: 700;
    }

    .empty-cart a:hover {
      text-decoration: underline;
    }
  `;

  return (
    <div className="booking-page">
      <style>{styles}</style>
      <div className="booking-container">
        <h1 className="booking-title">Book Your <span style={{ color: '#ffc107' }}>Table</span></h1>
        <p className="booking-subtitle">Reserve & Dine in Style</p>

        {error && <div className="booking-alert-error">⚠️ {error}</div>}
        {success && <div className="booking-alert-success">✓ {success}</div>}

        <div className="booking-grid">
          <div className="glass-booking-card">
            <h2 className="card-heading">Reservation Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="booking-form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  className="booking-input"
                  value={formData.date}
                  onChange={handleChange}
                  min={today}
                  required
                />
              </div>

              <div className="booking-form-group">
                <label>Time</label>
                <input
                  type="time"
                  name="time"
                  className="booking-input"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="booking-form-group">
                <label>Table Size (Number of Guests)</label>
                <input
                  type="number"
                  name="tableSize"
                  className="booking-input"
                  value={formData.tableSize}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  required
                />
              </div>

              <button
                type="submit"
                className="booking-btn"
                disabled={loading || cart.length === 0}
              >
                {loading ? 'Processing...' : 'Confirm Reservation & Order'}
              </button>
            </form>
          </div>

          <div className="glass-booking-card">
            <h2 className="card-heading">Order Summary</h2>
            {cart.length === 0 ? (
              <p className="empty-cart">Your cart is empty. <a href="/menu">Add items</a> to continue.</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item._id} className="order-item">
                    <span>{item.name} x {item.quantity}</span>
                    <span>{formatPriceLabel(getNumericPrice(item.price) * item.quantity)}</span>
                  </div>
                ))}
                <div className="order-total">
                  <span>Total:</span>
                  <span>{formatPriceLabel(getTotalPrice())}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
