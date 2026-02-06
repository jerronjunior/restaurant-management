import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createReservation } from '../services/reservationService';
import { createOrder } from '../services/orderService';
import { createPayment } from '../services/paymentService';

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

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Book a Table</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="grid grid-2">
          <div className="card">
            <h2 style={{ marginBottom: '20px' }}>Reservation Details</h2>
            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
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
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Table Size (Number of Guests)</label>
                <input
                  type="number"
                  name="tableSize"
                  value={formData.tableSize}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-success"
                style={{ width: '100%' }}
                disabled={loading || cart.length === 0}
              >
                {loading ? 'Processing...' : 'Confirm Reservation & Order'}
              </button>
            </form>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '20px' }}>Order Summary</h2>
            {cart.length === 0 ? (
              <p>Your cart is empty. <a href="/menu">Add items</a> to continue.</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #eee', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total:</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
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
