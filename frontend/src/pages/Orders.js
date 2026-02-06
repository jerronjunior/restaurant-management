import React, { useState, useEffect } from 'react';
import { getOrders } from '../services/orderService';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      setError('Failed to fetch orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page"><div className="container"><div className="loading">Loading orders...</div></div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">My Orders</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="grid">
            {orders.map((order) => (
              <div key={order._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <div>
                    <h3>Order #{order._id.slice(-6)}</h3>
                    <p style={{ color: '#666', marginTop: '5px' }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`status-badge status-${order.orderStatus.toLowerCase()}`}>
                      {order.orderStatus}
                    </span>
                    <br />
                    <span className={`status-badge status-${order.paymentStatus.toLowerCase()}`} style={{ marginTop: '5px', display: 'inline-block' }}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '15px' }}>
                  <h4>Items:</h4>
                  {order.items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                      <span>{item.name} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total:</span>
                    <span>${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
