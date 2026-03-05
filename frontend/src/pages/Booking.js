import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReservation } from '../services/reservationService';
import { createOrder } from '../services/orderService';
import { createPayment } from '../services/paymentService';
import { getMenuItems } from '../services/menuService';
import { formatPriceLabel, getNumericPrice } from '../utils/price';

const Booking = () => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    tableSize: 2
  });
  const [menuItems, setMenuItems] = useState([]);
  const [reservationOrders, setReservationOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await getMenuItems();
      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addItemToReservation = (menuItem) => {
    const existingItem = reservationOrders.find(item => item._id === menuItem._id);
    
    if (existingItem) {
      setReservationOrders(reservationOrders.map(item =>
        item._id === menuItem._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setReservationOrders([...reservationOrders, { ...menuItem, quantity: 1 }]);
    }
  };

  const removeItemFromReservation = (itemId) => {
    setReservationOrders(reservationOrders.filter(item => item._id !== itemId));
  };

  const updateItemQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromReservation(itemId);
    } else {
      setReservationOrders(reservationOrders.map(item =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getReservationTotal = () => {
    return reservationOrders.reduce((total, item) => {
      return total + (getNumericPrice(item.price) * item.quantity);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (reservationOrders.length === 0) {
      setError('bb');
      return;
    }

    setLoading(true);

    try {
      // Prepare order items for reservation
      const orderItems = reservationOrders.map((item) => ({
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
      setReservationOrders([]);
      
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

    .menu-items-list {
      max-height: 300px;
      overflow-y: auto;
      margin-bottom: 20px;
      padding-right: 10px;
    }

    .menu-items-list::-webkit-scrollbar {
      width: 8px;
    }

    .menu-items-list::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
    }

    .menu-items-list::-webkit-scrollbar-thumb {
      background: rgba(255, 193, 7, 0.5);
      border-radius: 10px;
    }

    .menu-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      margin-bottom: 10px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: 0.3s;
    }

    .menu-item-row:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: #ffc107;
    }

    .menu-item-info {
      flex: 1;
    }

    .menu-item-name {
      color: #fff;
      font-weight: 600;
      margin-bottom: 3px;
    }

    .menu-item-price {
      color: #ffc107;
      font-size: 0.9rem;
    }

    .add-item-btn {
      padding: 8px 16px;
      background: rgba(255, 193, 7, 0.2);
      color: #ffc107;
      border: 1px solid #ffc107;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      transition: 0.3s;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .add-item-btn:hover {
      background: #ffc107;
      color: #000;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .order-item-details {
      flex: 1;
    }

    .order-item-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .quantity-btn {
      width: 30px;
      height: 30px;
      background: rgba(255, 193, 7, 0.2);
      color: #ffc107;
      border: 1px solid rgba(255, 193, 7, 0.5);
      border-radius: 6px;
      cursor: pointer;
      transition: 0.3s;
      font-weight: bold;
    }

    .quantity-btn:hover {
      background: #ffc107;
      color: #000;
    }

    .quantity-display {
      color: #fff;
      font-weight: 600;
      min-width: 30px;
      text-align: center;
    }

    .remove-item-btn {
      padding: 6px 12px;
      background: rgba(244, 67, 54, 0.2);
      color: #f44336;
      border: 1px solid rgba(244, 67, 54, 0.5);
      border-radius: 6px;
      cursor: pointer;
      transition: 0.3s;
      font-size: 0.8rem;
    }

    .remove-item-btn:hover {
      background: #f44336;
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

    .empty-order {
      color: #aaa;
      text-align: center;
      padding: 40px 20px;
      font-size: 0.95rem;
    }

    .section-divider {
      margin: 25px 0;
      padding: 15px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .section-title {
      color: #ffc107;
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
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
                disabled={loading || reservationOrders.length === 0}
              >
                {loading ? 'Processing...' : 'Confirm Reservation & Order'}
              </button>
            </form>
          </div>

          <div className="glass-booking-card">
            <h2 className="card-heading">Order for Reservation</h2>
            
            <div className="section-divider">
              <h3 className="section-title">Add Items</h3>
              <div className="menu-items-list">
                {menuItems.length === 0 ? (
                  <p style={{ color: '#aaa', textAlign: 'center' }}>Loading menu items...</p>
                ) : (
                  menuItems.slice(0, 10).map((item) => (
                    <div key={item._id} className="menu-item-row">
                      <div className="menu-item-info">
                        <div className="menu-item-name">{item.name}</div>
                        <div className="menu-item-price">{formatPriceLabel(item.price)}</div>
                      </div>
                      <button
                        type="button"
                        className="add-item-btn"
                        onClick={() => addItemToReservation(item)}
                      >
                        Add
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="section-divider">
              <h3 className="section-title">Your Order</h3>
              {reservationOrders.length === 0 ? (
                <div className="empty-order">
                  No items added yet. Add items from above to create your reservation order.
                </div>
              ) : (
                <>
                  {reservationOrders.map((item) => (
                    <div key={item._id} className="order-item">
                      <div className="order-item-details">
                        <div style={{ fontWeight: '600' }}>{item.name}</div>
                        <div style={{ color: '#ffc107', fontSize: '0.9rem' }}>
                          {formatPriceLabel(getNumericPrice(item.price))} each
                        </div>
                      </div>
                      <div className="order-item-controls">
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={() => updateItemQuantity(item._id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={() => updateItemQuantity(item._id, item.quantity + 1)}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => removeItemFromReservation(item._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="order-total">
                    <span>Total:</span>
                    <span>{formatPriceLabel(getReservationTotal())}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
