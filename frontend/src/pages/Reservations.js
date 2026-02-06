import React, { useState, useEffect } from 'react';
import { getReservations, cancelReservation } from '../services/reservationService';

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
    return <div className="page"><div className="container"><div className="loading">Loading reservations...</div></div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">My Reservations</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {reservations.length === 0 ? (
          <div className="empty-state">
            <h3>No reservations found</h3>
            <p>You haven't made any reservations yet.</p>
          </div>
        ) : (
          <div className="grid">
            {reservations.map((reservation) => (
              <div key={reservation._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <div>
                    <h3>Reservation #{reservation._id.slice(-6)}</h3>
                    <p style={{ color: '#666', marginTop: '5px' }}>
                      {new Date(reservation.date).toLocaleDateString()} at {reservation.time}
                    </p>
                    <p style={{ color: '#666' }}>Table for {reservation.tableSize}</p>
                  </div>
                  <span className={`status-badge status-${reservation.status.toLowerCase()}`}>
                    {reservation.status}
                  </span>
                </div>

                <div style={{ marginTop: '15px' }}>
                  <h4>Order Items:</h4>
                  {reservation.orderItems.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                      <span>{item.menuItemId?.name || 'Item'} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total:</span>
                    <span>${reservation.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {reservation.status === 'Pending' && (
                  <button
                    onClick={() => handleCancel(reservation._id)}
                    className="btn btn-danger"
                    style={{ marginTop: '15px', width: '100%' }}
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
