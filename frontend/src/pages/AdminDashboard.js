import React, { useEffect, useMemo, useState } from 'react';
import {
  getAdminStats,
  getAllOrders,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCustomers,
  updateCustomerBlock,
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getDeliveries,
  createDelivery,
  updateDelivery,
  deleteDelivery,
  getSettings,
  updateSettings,
  getReports
} from '../services/adminService';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../services/menuService';
import { updateOrderStatus } from '../services/orderService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import './AdminDashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

const tabs = [
  'Overview',
  'Orders',
  'Menu',
  'Categories',
  'Customers',
  'Reports',
  'Offers',
  'Delivery',
  'Settings'
];

const formatCurrency = (value) => {
  const safe = Number(value || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0
  }).format(safe);
};

const formatDate = (value) => {
  if (!value) {
    return 'N/A';
  }
  const date = value.seconds ? new Date(value.seconds * 1000) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }
  return date.toLocaleString();
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reports, setReports] = useState(null);
  const [offers, setOffers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [settings, setSettings] = useState({});

  const [orderFilter, setOrderFilter] = useState('All');
  const [menuForm, setMenuForm] = useState({
    name: '',
    price: '',
    category: '',
    dietType: 'Veg',
    spicyLevel: 'Mild',
    image: '',
    available: true
  });
  const [menuEditingId, setMenuEditingId] = useState(null);

  const [categoryForm, setCategoryForm] = useState({ name: '', order: '' });
  const [offerForm, setOfferForm] = useState({ code: '', discountPercent: '', expiryDate: '', active: true });
  const [deliveryForm, setDeliveryForm] = useState({ orderId: '', assignedTo: '', status: 'Pending' });
  const [settingsForm, setSettingsForm] = useState({
    restaurantName: '',
    contactEmail: '',
    contactPhone: '',
    openingHours: '',
    logoUrl: '',
    paymentNotes: ''
  });
  const [realtimeStatus, setRealtimeStatus] = useState('connecting');
  const [realtimeMenuStatus, setRealtimeMenuStatus] = useState('connecting');
  const [realtimeDeliveryStatus, setRealtimeDeliveryStatus] = useState('connecting');
  const [realtimeCategoryStatus, setRealtimeCategoryStatus] = useState('connecting');
  const [realtimeOfferStatus, setRealtimeOfferStatus] = useState('connecting');

  const loadAll = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        statsRes,
        ordersRes,
        menuRes,
        categoriesRes,
        customersRes,
        reportsRes,
        offersRes,
        deliveriesRes,
        settingsRes
      ] = await Promise.all([
        getAdminStats(),
        getAllOrders(),
        getMenuItems(),
        getCategories(),
        getCustomers(),
        getReports(),
        getOffers(),
        getDeliveries(),
        getSettings()
      ]);

      setStats(statsRes.data);
      setOrders(ordersRes.data || []);
      setMenuItems(menuRes.data || []);
      setCategories(categoriesRes.data || []);
      setCustomers(customersRes.data || []);
      setReports(reportsRes.data);
      setOffers(offersRes.data || []);
      setDeliveries(deliveriesRes.data || []);
      setSettings(settingsRes.data || {});
      setSettingsForm((prev) => ({
        ...prev,
        ...settingsRes.data
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setRealtimeStatus('disabled');
      setRealtimeMenuStatus('disabled');
      setRealtimeDeliveryStatus('disabled');
      setRealtimeCategoryStatus('disabled');
      setRealtimeOfferStatus('disabled');
      return undefined;
    }

    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const source = new EventSource(`${baseUrl}/admin/orders/stream?token=${token}`);
    const menuSource = new EventSource(`${baseUrl}/admin/menu/stream?token=${token}`);
    const deliverySource = new EventSource(`${baseUrl}/admin/deliveries/stream?token=${token}`);
    const categorySource = new EventSource(`${baseUrl}/admin/categories/stream?token=${token}`);
    const offerSource = new EventSource(`${baseUrl}/admin/offers/stream?token=${token}`);

    const getOrderTime = (order) => {
      const createdAt = order?.createdAt;
      if (!createdAt) {
        return 0;
      }
      if (createdAt.seconds) {
        return createdAt.seconds * 1000;
      }
      return new Date(createdAt).getTime();
    };

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'init') {
          setOrders(payload.orders || []);
        }
        if (payload.type === 'changes') {
          setOrders((prev) => {
            let next = [...prev];
            payload.changes.forEach((change) => {
              if (change.type === 'removed') {
                next = next.filter((order) => order.id !== change.order.id);
              } else {
                const existingIndex = next.findIndex((order) => order.id === change.order.id);
                if (existingIndex >= 0) {
                  next[existingIndex] = change.order;
                } else {
                  next.unshift(change.order);
                }
              }
            });
            return next.sort((a, b) => getOrderTime(b) - getOrderTime(a));
          });
        }
        if (payload.type === 'error') {
          setRealtimeStatus('error');
        } else {
          setRealtimeStatus('connected');
        }
      } catch (err) {
        setRealtimeStatus('error');
      }
    };

    source.onerror = () => {
      setRealtimeStatus('error');
      source.close();
    };

    menuSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'init') {
          setMenuItems(payload.menuItems || []);
        }
        if (payload.type === 'changes') {
          setMenuItems((prev) => {
            let next = [...prev];
            payload.changes.forEach((change) => {
              if (change.type === 'removed') {
                next = next.filter((item) => item.id !== change.item.id);
              } else {
                const existingIndex = next.findIndex((item) => item.id === change.item.id);
                if (existingIndex >= 0) {
                  next[existingIndex] = change.item;
                } else {
                  next.unshift(change.item);
                }
              }
            });
            return next;
          });
        }
        if (payload.type === 'error') {
          setRealtimeMenuStatus('error');
        } else {
          setRealtimeMenuStatus('connected');
        }
      } catch (err) {
        setRealtimeMenuStatus('error');
      }
    };

    menuSource.onerror = () => {
      setRealtimeMenuStatus('error');
      menuSource.close();
    };

    deliverySource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'init') {
          setDeliveries(payload.deliveries || []);
        }
        if (payload.type === 'changes') {
          setDeliveries((prev) => {
            let next = [...prev];
            payload.changes.forEach((change) => {
              if (change.type === 'removed') {
                next = next.filter((item) => item.id !== change.delivery.id);
              } else {
                const existingIndex = next.findIndex((item) => item.id === change.delivery.id);
                if (existingIndex >= 0) {
                  next[existingIndex] = change.delivery;
                } else {
                  next.unshift(change.delivery);
                }
              }
            });
            return next;
          });
        }
        if (payload.type === 'error') {
          setRealtimeDeliveryStatus('error');
        } else {
          setRealtimeDeliveryStatus('connected');
        }
      } catch (err) {
        setRealtimeDeliveryStatus('error');
      }
    };

    deliverySource.onerror = () => {
      setRealtimeDeliveryStatus('error');
      deliverySource.close();
    };

    categorySource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'init') {
          setCategories(payload.categories || []);
        }
        if (payload.type === 'changes') {
          setCategories((prev) => {
            let next = [...prev];
            payload.changes.forEach((change) => {
              if (change.type === 'removed') {
                next = next.filter((item) => item.id !== change.category.id);
              } else {
                const existingIndex = next.findIndex((item) => item.id === change.category.id);
                if (existingIndex >= 0) {
                  next[existingIndex] = change.category;
                } else {
                  next.unshift(change.category);
                }
              }
            });
            return next;
          });
        }
        if (payload.type === 'error') {
          setRealtimeCategoryStatus('error');
        } else {
          setRealtimeCategoryStatus('connected');
        }
      } catch (err) {
        setRealtimeCategoryStatus('error');
      }
    };

    categorySource.onerror = () => {
      setRealtimeCategoryStatus('error');
      categorySource.close();
    };

    offerSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'init') {
          setOffers(payload.offers || []);
        }
        if (payload.type === 'changes') {
          setOffers((prev) => {
            let next = [...prev];
            payload.changes.forEach((change) => {
              if (change.type === 'removed') {
                next = next.filter((item) => item.id !== change.offer.id);
              } else {
                const existingIndex = next.findIndex((item) => item.id === change.offer.id);
                if (existingIndex >= 0) {
                  next[existingIndex] = change.offer;
                } else {
                  next.unshift(change.offer);
                }
              }
            });
            return next;
          });
        }
        if (payload.type === 'error') {
          setRealtimeOfferStatus('error');
        } else {
          setRealtimeOfferStatus('connected');
        }
      } catch (err) {
        setRealtimeOfferStatus('error');
      }
    };

    offerSource.onerror = () => {
      setRealtimeOfferStatus('error');
      offerSource.close();
    };

    return () => {
      source.close();
      menuSource.close();
      deliverySource.close();
      categorySource.close();
      offerSource.close();
    };
  }, []);

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'All') {
      return orders;
    }
    return orders.filter((order) => order.orderStatus === orderFilter);
  }, [orders, orderFilter]);

  const chartData = useMemo(() => {
    const dailySales = reports?.dailySales || [];
    const dailyLabels = dailySales.map((item) => item.date);
    const dailyTotals = dailySales.map((item) => item.total || 0);

    const weeklyLabels = dailyLabels.slice(-7);
    const weeklyTotals = dailyTotals.slice(-7);

    return {
      daily: {
        labels: dailyLabels,
        datasets: [
          {
            label: 'Daily Sales',
            data: dailyTotals,
            backgroundColor: 'rgba(255, 179, 71, 0.6)'
          }
        ]
      },
      weekly: {
        labels: weeklyLabels,
        datasets: [
          {
            label: 'Weekly Revenue',
            data: weeklyTotals,
            borderColor: 'rgba(245, 109, 91, 0.9)',
            backgroundColor: 'rgba(245, 109, 91, 0.2)',
            tension: 0.4
          }
        ]
      }
    };
  }, [reports]);

  const handleMenuSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...menuForm,
        price: Number(menuForm.price),
        available: !!menuForm.available
      };

      if (menuEditingId) {
        await updateMenuItem(menuEditingId, payload);
      } else {
        await createMenuItem(payload);
      }

      setMenuForm({ name: '', price: '', category: '', dietType: 'Veg', spicyLevel: 'Mild', image: '', available: true });
      setMenuEditingId(null);
      const menuRes = await getMenuItems();
      setMenuItems(menuRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save menu item.');
    }
  };

  const handleMenuEdit = (item) => {
    setMenuEditingId(item.id);
    setMenuForm({
      name: item.name || '',
      price: item.price || '',
      category: item.category || '',
      dietType: item.dietType || 'Veg',
      spicyLevel: item.spicyLevel || 'Mild',
      image: item.image || '',
      available: item.available !== false
    });
  };

  const handleMenuDelete = async (id) => {
    await deleteMenuItem(id);
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    try {
      await createCategory({
        name: categoryForm.name,
        order: Number(categoryForm.order || categories.length + 1)
      });
      setCategoryForm({ name: '', order: '' });
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category.');
    }
  };

  const handleCategoryUpdate = async (id, payload) => {
    await updateCategory(id, payload);
    const res = await getCategories();
    setCategories(res.data || []);
  };

  const handleOfferSubmit = async (event) => {
    event.preventDefault();
    try {
      await createOffer({
        ...offerForm,
        discountPercent: Number(offerForm.discountPercent)
      });
      setOfferForm({ code: '', discountPercent: '', expiryDate: '', active: true });
      const res = await getOffers();
      setOffers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create offer.');
    }
  };

  const handleDeliverySubmit = async (event) => {
    event.preventDefault();
    try {
      await createDelivery(deliveryForm);
      setDeliveryForm({ orderId: '', assignedTo: '', status: 'Pending' });
      const res = await getDeliveries();
      setDeliveries(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create delivery assignment.');
    }
  };

  const handleSettingsSave = async (event) => {
    event.preventDefault();
    try {
      const res = await updateSettings(settingsForm);
      setSettings(res.data || {});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings.');
    }
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    await updateOrderStatus(orderId, status);
    const res = await getAllOrders();
    setOrders(res.data || []);
  };

  const handleCustomerBlock = async (customerId, blocked) => {
    await updateCustomerBlock(customerId, blocked);
    const res = await getCustomers();
    setCustomers(res.data || []);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Full control of orders, menu, and business insights.</p>
          </div>
          <button className="admin-btn secondary" onClick={loadAll} disabled={loading}>
            Refresh Data
          </button>
        </header>

        <nav className="admin-tabbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {error && <div className="admin-alert">{error}</div>}

        {loading ? (
          <div className="admin-panel">Loading dashboard data...</div>
        ) : (
          <>
            {activeTab === 'Overview' && (
              <section>
                <div className="admin-grid">
                  <div className="admin-card">
                    <h3>Total Orders Today</h3>
                    <div className="admin-metric">{stats?.todayOrders || 0}</div>
                  </div>
                  <div className="admin-card">
                    <h3>Today Revenue</h3>
                    <div className="admin-metric">{formatCurrency(stats?.dailyRevenue || 0)}</div>
                  </div>
                  <div className="admin-card">
                    <h3>Pending Orders</h3>
                    <div className="admin-metric">{stats?.pendingOrders || 0}</div>
                  </div>
                  <div className="admin-card">
                    <h3>Total Customers</h3>
                    <div className="admin-metric">{stats?.totalCustomers || 0}</div>
                  </div>
                  <div className="admin-card">
                    <h3>Best Selling Item</h3>
                    <div className="admin-metric">
                      {stats?.bestSellingItem?.name || 'Not enough data'}
                    </div>
                  </div>
                </div>

                <div className="admin-split">
                  <div className="admin-chart">
                    <h2>Daily Sales</h2>
                    <Bar data={chartData.daily} />
                  </div>
                  <div className="admin-chart">
                    <h2>Weekly Revenue</h2>
                    <Line data={chartData.weekly} />
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'Orders' && (
              <section className="admin-panel">
                <h2>Order Management</h2>
                <div className="admin-muted" style={{ marginBottom: '12px' }}>
                  Realtime updates: {realtimeStatus}
                </div>
                <div className="admin-row">
                  <label className="admin-muted">Filter:</label>
                  <select
                    className="admin-select"
                    value={orderFilter}
                    onChange={(event) => setOrderFilter(event.target.value)}
                  >
                    {['All', 'Pending', 'Preparing', 'Completed', 'Cancelled'].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          {order.userName}
                          <div className="admin-muted">{order.userEmail}</div>
                        </td>
                        <td>
                          {(order.items || []).map((item) => item.name).join(', ')}
                        </td>
                        <td>{formatCurrency(order.totalPrice)}</td>
                        <td><span className="admin-tag">{order.orderStatus}</span></td>
                        <td>
                          <select
                            className="admin-select"
                            defaultValue={order.orderStatus}
                            onChange={(event) => handleOrderStatusUpdate(order.id, event.target.value)}
                          >
                            {['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {activeTab === 'Menu' && (
              <section className="admin-panel">
                <h2>Menu Management</h2>
                <div className="admin-muted" style={{ marginBottom: '12px' }}>
                  Realtime updates: {realtimeMenuStatus}
                </div>
                <form className="admin-row" onSubmit={handleMenuSubmit}>
                  <input
                    className="admin-input"
                    placeholder="Item name"
                    value={menuForm.name}
                    onChange={(event) => setMenuForm({ ...menuForm, name: event.target.value })}
                    required
                  />
                  <input
                    className="admin-input"
                    type="number"
                    placeholder="Price"
                    value={menuForm.price}
                    onChange={(event) => setMenuForm({ ...menuForm, price: event.target.value })}
                    required
                  />
                  <input
                    className="admin-input"
                    placeholder="Category"
                    value={menuForm.category}
                    onChange={(event) => setMenuForm({ ...menuForm, category: event.target.value })}
                  />
                  <select
                    className="admin-select"
                    value={menuForm.dietType}
                    onChange={(event) => setMenuForm({ ...menuForm, dietType: event.target.value })}
                  >
                    {['Veg', 'Non-Veg'].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <select
                    className="admin-select"
                    value={menuForm.spicyLevel}
                    onChange={(event) => setMenuForm({ ...menuForm, spicyLevel: event.target.value })}
                  >
                    {['Mild', 'Medium', 'Hot'].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <input
                    className="admin-input"
                    placeholder="Image URL"
                    value={menuForm.image}
                    onChange={(event) => setMenuForm({ ...menuForm, image: event.target.value })}
                  />
                  <select
                    className="admin-select"
                    value={menuForm.available ? 'Available' : 'Out of Stock'}
                    onChange={(event) => setMenuForm({ ...menuForm, available: event.target.value === 'Available' })}
                  >
                    <option value="Available">Available</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                  <button className="admin-btn" type="submit">
                    {menuEditingId ? 'Update Item' : 'Add Item'}
                  </button>
                </form>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.category || 'Uncategorized'}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td><span className="admin-tag">{item.available ? 'Available' : 'Out of Stock'}</span></td>
                        <td className="admin-flex">
                          <button className="admin-btn secondary" onClick={() => handleMenuEdit(item)}>Edit</button>
                          <button className="admin-btn secondary" onClick={() => handleMenuDelete(item.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {activeTab === 'Categories' && (
              <section className="admin-panel">
                <h2>Category Management</h2>
                <div className="admin-muted" style={{ marginBottom: '12px' }}>
                  Realtime updates: {realtimeCategoryStatus}
                </div>
                <form className="admin-row" onSubmit={handleCategorySubmit}>
                  <input
                    className="admin-input"
                    placeholder="Category name"
                    value={categoryForm.name}
                    onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })}
                    required
                  />
                  <input
                    className="admin-input"
                    type="number"
                    placeholder="Order"
                    value={categoryForm.order}
                    onChange={(event) => setCategoryForm({ ...categoryForm, order: event.target.value })}
                  />
                  <button className="admin-btn" type="submit">Add Category</button>
                </form>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Order</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>{category.name}</td>
                        <td>{category.order}</td>
                        <td className="admin-flex">
                          <button
                            className="admin-btn secondary"
                            onClick={() => handleCategoryUpdate(category.id, { order: category.order - 1 })}
                          >
                            Move Up
                          </button>
                          <button
                            className="admin-btn secondary"
                            onClick={() => handleCategoryUpdate(category.id, { order: category.order + 1 })}
                          >
                            Move Down
                          </button>
                          <button
                            className="admin-btn secondary"
                            onClick={() => deleteCategory(category.id).then(() => getCategories().then((res) => setCategories(res.data || [])))}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {activeTab === 'Customers' && (
              <section className="admin-panel">
                <h2>Customer Management</h2>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Total Orders</th>
                      <th>Total Spending</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id}>
                        <td>{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>{customer.totalOrders}</td>
                        <td>{formatCurrency(customer.totalSpending)}</td>
                        <td>
                          <button
                            className="admin-btn secondary"
                            onClick={() => handleCustomerBlock(customer.id, !customer.blocked)}
                          >
                            {customer.blocked ? 'Unblock' : 'Block'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {activeTab === 'Reports' && (
              <section className="admin-panel">
                <h2>Sales & Reports</h2>
                <div className="admin-split">
                  <div className="admin-chart">
                    <h3>Daily Sales Report</h3>
                    <Bar data={chartData.daily} />
                  </div>
                  <div className="admin-chart">
                    <h3>Monthly Sales Report</h3>
                    <Line
                      data={{
                        labels: (reports?.monthlySales || []).map((item) => item.month),
                        datasets: [
                          {
                            label: 'Monthly Sales',
                            data: (reports?.monthlySales || []).map((item) => item.total),
                            borderColor: 'rgba(255, 179, 71, 0.9)',
                            backgroundColor: 'rgba(255, 179, 71, 0.2)',
                            tension: 0.35
                          }
                        ]
                      }}
                    />
                  </div>
                </div>
                <div className="admin-split" style={{ marginTop: '20px' }}>
                  <div className="admin-card">
                    <h3>Most Ordered Items</h3>
                    <ul>
                      {(reports?.mostOrderedItems || []).map((item) => (
                        <li key={item.name}>{item.name} - {item.quantity}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="admin-card">
                    <h3>Revenue by Category</h3>
                    <ul>
                      {(reports?.revenueByCategory || []).map((item) => (
                        <li key={item.category}>{item.category} - {formatCurrency(item.total)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'Offers' && (
              <section className="admin-panel">
                <h2>Offers & Discounts</h2>
                <div className="admin-muted" style={{ marginBottom: '12px' }}>
                  Realtime updates: {realtimeOfferStatus}
                </div>
                <form className="admin-row" onSubmit={handleOfferSubmit}>
                  <input
                    className="admin-input"
                    placeholder="Promo code"
                    value={offerForm.code}
                    onChange={(event) => setOfferForm({ ...offerForm, code: event.target.value })}
                    required
                  />
                  <input
                    className="admin-input"
                    type="number"
                    placeholder="Discount %"
                    value={offerForm.discountPercent}
                    onChange={(event) => setOfferForm({ ...offerForm, discountPercent: event.target.value })}
                    required
                  />
                  <input
                    className="admin-input"
                    type="date"
                    value={offerForm.expiryDate}
                    onChange={(event) => setOfferForm({ ...offerForm, expiryDate: event.target.value })}
                  />
                  <select
                    className="admin-select"
                    value={offerForm.active ? 'Active' : 'Inactive'}
                    onChange={(event) => setOfferForm({ ...offerForm, active: event.target.value === 'Active' })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <button className="admin-btn" type="submit">Create Offer</button>
                </form>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Discount</th>
                      <th>Expiry</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((offer) => (
                      <tr key={offer.id}>
                        <td>{offer.code}</td>
                        <td>{offer.discountPercent}%</td>
                        <td>{formatDate(offer.expiryDate)}</td>
                        <td><span className="admin-tag">{offer.active ? 'Active' : 'Inactive'}</span></td>
                        <td className="admin-flex">
                          <button
                            className="admin-btn secondary"
                            onClick={() => updateOffer(offer.id, { active: !offer.active }).then(() => getOffers().then((res) => setOffers(res.data || [])))}
                          >
                            Toggle
                          </button>
                          <button
                            className="admin-btn secondary"
                            onClick={() => deleteOffer(offer.id).then(() => getOffers().then((res) => setOffers(res.data || [])))}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {activeTab === 'Delivery' && (
              <section className="admin-panel">
                <h2>Delivery Management</h2>
                <div className="admin-muted" style={{ marginBottom: '12px' }}>
                  Realtime updates: {realtimeDeliveryStatus}
                </div>
                <form className="admin-row" onSubmit={handleDeliverySubmit}>
                  <input
                    className="admin-input"
                    placeholder="Order ID"
                    value={deliveryForm.orderId}
                    onChange={(event) => setDeliveryForm({ ...deliveryForm, orderId: event.target.value })}
                    required
                  />
                  <input
                    className="admin-input"
                    placeholder="Assigned To"
                    value={deliveryForm.assignedTo}
                    onChange={(event) => setDeliveryForm({ ...deliveryForm, assignedTo: event.target.value })}
                  />
                  <select
                    className="admin-select"
                    value={deliveryForm.status}
                    onChange={(event) => setDeliveryForm({ ...deliveryForm, status: event.target.value })}
                  >
                    {['Pending', 'Picked Up', 'On Route', 'Delivered'].map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button className="admin-btn" type="submit">Assign Delivery</button>
                </form>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Assigned To</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((delivery) => (
                      <tr key={delivery.id}>
                        <td>{delivery.orderId}</td>
                        <td>{delivery.assignedTo || 'Unassigned'}</td>
                        <td><span className="admin-tag">{delivery.status}</span></td>
                        <td className="admin-flex">
                          <button
                            className="admin-btn secondary"
                            onClick={() => updateDelivery(delivery.id, { status: 'Delivered' }).then(() => getDeliveries().then((res) => setDeliveries(res.data || [])))}
                          >
                            Mark Delivered
                          </button>
                          <button
                            className="admin-btn secondary"
                            onClick={() => deleteDelivery(delivery.id).then(() => getDeliveries().then((res) => setDeliveries(res.data || [])))}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {activeTab === 'Settings' && (
              <section className="admin-panel">
                <h2>Settings Panel</h2>
                <form className="admin-row" onSubmit={handleSettingsSave}>
                  <input
                    className="admin-input"
                    placeholder="Restaurant name"
                    value={settingsForm.restaurantName || ''}
                    onChange={(event) => setSettingsForm({ ...settingsForm, restaurantName: event.target.value })}
                  />
                  <input
                    className="admin-input"
                    placeholder="Contact email"
                    value={settingsForm.contactEmail || ''}
                    onChange={(event) => setSettingsForm({ ...settingsForm, contactEmail: event.target.value })}
                  />
                  <input
                    className="admin-input"
                    placeholder="Contact phone"
                    value={settingsForm.contactPhone || ''}
                    onChange={(event) => setSettingsForm({ ...settingsForm, contactPhone: event.target.value })}
                  />
                  <input
                    className="admin-input"
                    placeholder="Opening hours"
                    value={settingsForm.openingHours || ''}
                    onChange={(event) => setSettingsForm({ ...settingsForm, openingHours: event.target.value })}
                  />
                  <input
                    className="admin-input"
                    placeholder="Logo URL"
                    value={settingsForm.logoUrl || ''}
                    onChange={(event) => setSettingsForm({ ...settingsForm, logoUrl: event.target.value })}
                  />
                  <input
                    className="admin-input"
                    placeholder="Payment settings"
                    value={settingsForm.paymentNotes || ''}
                    onChange={(event) => setSettingsForm({ ...settingsForm, paymentNotes: event.target.value })}
                  />
                  <button className="admin-btn" type="submit">Save Settings</button>
                </form>
                <div className="admin-muted">Last updated: {formatDate(settings.updatedAt)}</div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;