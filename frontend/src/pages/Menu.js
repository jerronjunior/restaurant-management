import React, { useState, useEffect } from 'react';
import { getMenuItems } from '../services/menuService';
import { useCart } from '../context/CartContext';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const { addToCart } = useCart();

  // Categories based on your list
  const categories = [
    { id: '', name: 'All', icon: '🍽️' },
    { id: 'Starters', name: 'Starters', icon: '🥗' },
    { id: 'Main Courses', name: 'Main Courses', icon: '🍛' },
    { id: 'Rice & Noodles', name: 'Rice & Noodles', icon: '🍚' },
    { id: 'Burgers', name: 'Burgers', icon: '🍔' },
    { id: 'Pizza', name: 'Pizza', icon: '🍕' },
    { id: 'Desserts', name: 'Desserts', icon: '🍰' },
    { id: 'Beverages', name: 'Beverages', icon: '🥤' },
    { id: 'Specials', name: "Chef's Specials", icon: '⭐' },
  ];

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

  const styles = `
    .menu-page {
      background: #0a0a0a;
      color: white;
      min-height: 100vh;
      padding: 40px 0;
    }
    .category-scroll {
      display: flex;
      gap: 15px;
      overflow-x: auto;
      padding: 20px 0;
      scrollbar-width: none;
    }
    .category-scroll::-webkit-scrollbar { display: none; }
    
    .cat-btn {
      padding: 12px 25px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 50px;
      color: #aaa;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cat-btn.active {
      background: #ffc107;
      color: black;
      font-weight: bold;
      border-color: #ffc107;
      box-shadow: 0 5px 15px rgba(255,193,7,0.3);
    }
    .premium-card {
      background: #161616;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid #222;
      transition: 0.3s;
    }
    .premium-card:hover {
      transform: translateY(-10px);
      border-color: #ffc107;
    }
    .item-img-container {
      height: 200px;
      overflow: hidden;
      position: relative;
    }
    .price-badge {
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(0,0,0,0.8);
      padding: 5px 12px;
      border-radius: 50px;
      color: #ffc107;
      font-weight: bold;
      border: 1px solid #ffc107;
    }
    .tag-spicy { color: #ff4d4d; font-size: 0.8rem; }
    .tag-veg { color: #4caf50; font-size: 0.8rem; }
  `;

  return (
    <div className="menu-page">
      <style>{styles}</style>
      <div className="container">
        <h1 style={{ textAlign: 'center', fontSize: '3rem', fontWeight: '800', marginBottom: '10px' }}>
          Our <span style={{ color: '#ffc107' }}>Menu</span>
        </h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '40px' }}>Authentic Sri Lankan Flavors & International Classics</p>

        {/* Category Navigation */}
        <div className="category-scroll">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`cat-btn ${category === cat.id ? 'active' : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <div className="loading">Preparing delicious food...</div>
          </div>
        ) : (
          <div className="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', marginTop: '40px' }}>
            {menuItems.map((item) => (
              <div key={item._id} className="premium-card">
                <div className="item-img-container">
                  <img 
                    src={item.image || 'https://via.placeholder.com/400x300?text=Delicious+Food'} 
                    alt={item.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div className="price-badge">LKR {item.price.toLocaleString()}</div>
                </div>
                
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{item.name}</h3>
                    {/* Tag Logic */}
                    {item.isSpicy && <span className="tag-spicy">🌶️</span>}
                    {item.isVeg && <span className="tag-veg">🥬</span>}
                  </div>
                  
                  <p style={{ color: '#777', fontSize: '0.9rem', height: '40px', overflow: 'hidden', lineHeight: '1.4' }}>
                    {item.description}
                  </p>

                  <button
                    onClick={() => addToCart(item)}
                    disabled={!item.available}
                    style={{
                      width: '100%',
                      padding: '12px',
                      marginTop: '15px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: item.available ? '#ffc107' : '#333',
                      color: item.available ? 'black' : '#777',
                      fontWeight: 'bold',
                      cursor: item.available ? 'pointer' : 'not-allowed',
                      transition: '0.3s'
                    }}
                  >
                    {item.available ? 'Add to Order' : 'Sold Out'}
                  </button>
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