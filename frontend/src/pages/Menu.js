import React, { useState, useEffect } from 'react';
import { getMenuItems } from '../services/menuService';
import { useCart } from '../context/CartContext';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchMenuItems();
  }, [category]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await getMenuItems(category || null);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item);
  };

  if (loading) {
    return <div className="page"><div className="container"><div className="loading">Loading menu...</div></div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Our Menu</h1>

        <div className="form-group" style={{ maxWidth: '300px', marginBottom: '30px' }}>
          <label>Filter by Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Appetizer">Appetizer</option>
            <option value="Main Course">Main Course</option>
            <option value="Dessert">Dessert</option>
            <option value="Beverage">Beverage</option>
            <option value="Salad">Salad</option>
            <option value="Soup">Soup</option>
          </select>
        </div>

        {menuItems.length === 0 ? (
          <div className="empty-state">
            <h3>No menu items found</h3>
            <p>Please check back later.</p>
          </div>
        ) : (
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
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="btn btn-primary"
                      disabled={!item.available}
                    >
                      {item.available ? 'Add to Cart' : 'Unavailable'}
                    </button>
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

export default Menu;
