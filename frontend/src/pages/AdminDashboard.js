import React, { useState, useEffect } from 'react';
import { getAdminStats, getAllReservations, getAllOrders } from '../services/adminService';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../services/menuService';
import { updateOrderStatus } from '../services/orderService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'Main Course',
    available: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, reservationsRes, ordersRes, menuRes] = await Promise.all([
        getAdminStats(),
        getAllReservations(),
        getAllOrders(),
        getMenuItems()
      ]);
      setStats(statsRes.data);
      setReservations(reservationsRes.data);
      setOrders(ordersRes.data);
      setMenuItems(menuRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateMenuItem(editingItem._id, menuFormData);
      } else {
        await createMenuItem(menuFormData);
      }
      setShowMenuForm(false);
      setEditingItem(null);
      setMenuFormData({
        name: '',
        description: '',
        price: '',
        image: '',
        category: 'Main Course',
        available: true
      });
      fetchData();
    } catch (error) {
      alert('Failed to save menu item');
      console.error(error);
    }
  };

  const handleEditMenu = (item) => {
    setEditingItem(item);
    setMenuFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: item.image,
      category: item.category,
      available: item.available
    });
    setShowMenuForm(true);
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }
    try {
      await deleteMenuItem(id);
      fetchData();
    } catch (error) {
      alert('Failed to delete menu item');
      console.error(error);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      fetchData();
    } catch (error) {
      alert('Failed to update order status');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="page"><div className="container"><div className="loading">Loading dashboard...</div></div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Admin Dashboard</h1>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #eee' }}>
          <button
            onClick={() => setActiveTab('stats')}
            className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`btn ${activeTab === 'reservations' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Reservations
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Menu Management
          </button>
        </div>

        {activeTab === 'stats' && stats && (
          <div className="grid grid-4">
            <div className="card">
              <h3>Total Revenue</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="card">
              <h3>Daily Revenue</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
                ${stats.dailyRevenue.toFixed(2)}
              </p>
            </div>
            <div className="card">
              <h3>Total Orders</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8' }}>
                {stats.totalOrders}
              </p>
            </div>
            <div className="card">
              <h3>Total Reservations</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6c757d' }}>
                {stats.totalReservations}
              </p>
            </div>
            <div className="card">
              <h3>Pending Orders</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
                {stats.pendingOrders}
              </p>
            </div>
            <div className="card">
              <h3>Confirmed Reservations</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
                {stats.confirmedReservations}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Date & Time</th>
                  <th>Table Size</th>
                  <th>Total Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation._id}>
                    <td>{reservation._id.slice(-6)}</td>
                    <td>{reservation.userId?.name || 'N/A'}</td>
                    <td>{new Date(reservation.date).toLocaleDateString()} {reservation.time}</td>
                    <td>{reservation.tableSize}</td>
                    <td>${reservation.totalPrice.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${reservation.status.toLowerCase()}`}>
                        {reservation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Items</th>
                  <th>Total Price</th>
                  <th>Order Status</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-6)}</td>
                    <td>{order.userId?.name || 'N/A'}</td>
                    <td>{order.items.length} item(s)</td>
                    <td>${order.totalPrice.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${order.orderStatus.toLowerCase()}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${order.paymentStatus.toLowerCase()}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className="btn"
                        style={{ padding: '5px' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready">Ready</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'menu' && (
          <div>
            <button
              onClick={() => {
                setShowMenuForm(true);
                setEditingItem(null);
                setMenuFormData({
                  name: '',
                  description: '',
                  price: '',
                  image: '',
                  category: 'Main Course',
                  available: true
                });
              }}
              className="btn btn-success"
              style={{ marginBottom: '20px' }}
            >
              Add New Menu Item
            </button>

            {showMenuForm && (
              <div className="card" style={{ marginBottom: '30px' }}>
                <h2>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
                <form onSubmit={handleMenuSubmit}>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={menuFormData.name}
                      onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={menuFormData.description}
                      onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
                      required
                      rows="3"
                    />
                  </div>
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label>Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={menuFormData.price}
                        onChange={(e) => setMenuFormData({ ...menuFormData, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={menuFormData.category}
                        onChange={(e) => setMenuFormData({ ...menuFormData, category: e.target.value })}
                      >
                        <option value="Appetizer">Appetizer</option>
                        <option value="Main Course">Main Course</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Beverage">Beverage</option>
                        <option value="Salad">Salad</option>
                        <option value="Soup">Soup</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Image URL</label>
                    <input
                      type="url"
                      value={menuFormData.image}
                      onChange={(e) => setMenuFormData({ ...menuFormData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={menuFormData.available}
                        onChange={(e) => setMenuFormData({ ...menuFormData, available: e.target.checked })}
                      />
                      Available
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary">
                      {editingItem ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenuForm(false);
                        setEditingItem(null);
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="menu-grid">
              {menuItems.map((item) => (
                <div key={item._id} className="menu-item-card">
                  <img
                    src={item.image || 'https://via.placeholder.com/300x200?text=Food+Item'}
                    alt={item.name}
                    className="menu-item-image"
                  />
                  <div className="menu-item-content">
                    <h3 className="menu-item-name">{item.name}</h3>
                    <p className="menu-item-description">{item.description}</p>
                    <div className="menu-item-footer">
                      <span className="menu-item-price">${item.price.toFixed(2)}</span>
                      <div>
                        <button
                          onClick={() => handleEditMenu(item)}
                          className="btn btn-primary"
                          style={{ marginRight: '5px', padding: '5px 10px' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(item._id)}
                          className="btn btn-danger"
                          style={{ padding: '5px 10px' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
