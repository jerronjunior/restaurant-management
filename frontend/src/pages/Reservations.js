import React, { useState, useEffect } from 'react';
import { getReservations, cancelReservation } from '../services/reservationService';
import { formatPriceLabel, getNumericPrice } from '../utils/price';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await getReservations();
      setReservations(response.data);
    } catch (error) {
      setError('Failed to fetch reservations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      await cancelReservation(id);
      fetchReservations();
    } catch (error) {
      alert('Failed to cancel reservation');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80")', backgroundSize: 'cover' }}>
        <div style={{ color: '#fff', fontSize: '1.2rem' }}>Loading reservations...</div>
      </div>
    );
  }

  const styles = `
    .reservations-page {
      min-height: 100vh;
      padding: 100px 20px 60px;
      background: linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), 
                  url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
    }

    .reservations-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .reservations-title {
      color: #fff;
      font-size: 3rem;
      font-weight: 800;
      text-align: center;
      margin-bottom: 15px;
      letter-spacing: -1px;
      text-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    }

    .reservations-subtitle {
      color: #ffc107;
      text-align: center;
      margin-bottom: 50px;
      font-size: 1.1rem;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .reservations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 30px;
      margin-top: 30px;
    }

    @media (max-width: 768px) {
      .reservations-grid {
        grid-template-columns: 1fr;
      }
    }

    .glass-reservation-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 30px;
      border-radius: 20px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
      animation: fadeIn 0.8s ease-out;
      transition: transform 0.3s;
    }

    .glass-reservation-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .reservation-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid rgba(255, 193, 7, 0.3);
    }

    .reservation-info h3 {
      color: #ffc107;
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .reservation-info p {
      color: #ccc;
      margin: 5px 0;
      font-size: 0.9rem;
    }

    .reservation-status {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .status-pending {
      background: rgba(255, 193, 7, 0.2);
      color: #ffc107;
      border: 1px solid #ffc107;
    }

    .status-confirmed {
      background: rgba(76, 175, 80, 0.2);
      color: #4caf50;
      border: 1px solid #4caf50;
    }

    .status-cancelled {
      background: rgba(244, 67, 54, 0.2);
      color: #f44336;
      border: 1px solid #f44336;
    }

    .status-completed {
      background: rgba(33, 150, 243, 0.2);
      color: #2196f3;
      border: 1px solid #2196f3;
    }

    .order-items-section {
      margin-top: 20px;
    }

    .order-items-section h4 {
      color: #fff;
      font-size: 1.1rem;
      margin-bottom: 15px;
      font-weight: 600;
    }

    .order-item-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: #ddd;
    }

    .order-total-row {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 2px solid rgba(255, 193, 7, 0.3);
      font-weight: bold;
      font-size: 1.2rem;
      color: #ffc107;
    }

    .cancel-btn {
      width: 100%;
      padding: 14px;
      background: rgba(244, 67, 54, 0.8);
      color: #fff;
      border: 1px solid #f44336;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: 0.3s;
      margin-top: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .cancel-btn:hover {
      background: #f44336;
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(244, 67, 54, 0.3);
    }

    .empty-state-box {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 60px 40px;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    }

    .empty-state-box h3 {
      color: #fff;
      font-size: 1.8rem;
      margin-bottom: 15px;
    }

    .empty-state-box p {
      color: #aaa;
      font-size: 1rem;
    }

    .reservations-alert-error {
      background: rgba(255, 77, 77, 0.15);
      color: #ffb3b3;
      padding: 15px;
      border-radius: 12px;
      border-left: 4px solid #ff4d4d;
      margin-bottom: 30px;
      font-size: 0.95rem;
    }
  `;

  return (
    <div className="reservations-page">
      <style>{styles}</style>
      <div className="reservations-container">
        <h1 className="reservations-title">My <span style={{ color: '#ffc107' }}>Reservations</span></h1>
        <p className="reservations-subtitle">Track Your Bookings</p>

        {error && <div className="reservations-alert-error">⚠️ {error}</div>}

        {reservations.length === 0 ? (
          <div className="empty-state-box">
            <h3>No reservations found</h3>
            <p>You haven't made any reservations yet.</p>
          </div>
        ) : (
          <div className="reservations-grid">
            {reservations.map((reservation) => (
              <div key={reservation._id} className="glass-reservation-card">
                <div className="reservation-header">
                  <div className="reservation-info">
                    <h3>Reservation #{reservation._id.slice(-6)}</h3>
                    <p>
                      {new Date(reservation.date).toLocaleDateString()} at {reservation.time}
                    </p>
                    <p>Table for {reservation.tableSize}</p>
                  </div>
                  <span className={`reservation-status status-${reservation.status.toLowerCase()}`}>
                    {reservation.status}
                  </span>
                </div>

                <div className="order-items-section">
                  <h4>Order Items:</h4>
                  {reservation.orderItems.map((item, index) => (
                    <div key={index} className="order-item-row">
                      <span>{item.menuItemId?.name || 'Item'} x {item.quantity}</span>
                      <span>{formatPriceLabel(getNumericPrice(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="order-total-row">
                    <span>Total:</span>
                    <span>{formatPriceLabel(reservation.totalPrice)}</span>
                  </div>
                </div>

                {reservation.status === 'Pending' && (
                  <button
                    onClick={() => handleCancel(reservation._id)}
                    className="cancel-btn"
                  >
                    Cancel Reservation
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;
