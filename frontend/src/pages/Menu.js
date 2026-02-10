import React, { useState, useEffect } from 'react';
import { getMenuItems } from '../services/menuService';
import { useCart } from '../context/CartContext';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const { addToCart } = useCart();

  // Your specific food data
  const localMenu = [
    { name: "Vegetable Spring Rolls", price: 650, category: "Starters", tags: ["🥬 Veg"], img: "https://images.unsplash.com/photo-1544333346-646706988bb1?auto=format&fit=crop&w=400" },
    { name: "Chicken Cutlets (3 pcs)", price: 550, category: "Starters", tags: ["🍗 Non-Veg"], img: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400" },
    { name: "Chicken Wings (Spicy)", price: 1100, category: "Starters", tags: ["🌶️ Spicy", "⭐ Best Seller"], img: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=400" },
    { name: "Chicken Curry", price: 1250, category: "Main Courses", tags: ["🍗 Non-Veg"], img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400" },
    { name: "Fish Ambul Thiyal", price: 1450, category: "Main Courses", tags: ["⭐ Chef’s Special"], img: "https://images.unsplash.com/photo-1512132411229-c30391241dd8?auto=format&fit=crop&w=400" },
    { name: "Chicken Kottu", price: 1200, category: "Rice & Noodles", tags: ["🍗 Non-Veg", "🔥 Hot"], img: "https://images.unsplash.com/photo-1630409351241-e90e7f5e434d?auto=format&fit=crop&w=400" },
    { name: "Signature Chicken Kottu", price: 1450, category: "Chef’s Specials", tags: ["👨‍🍳 Chef’s Special", "⭐ Best Seller"], img: "https://images.unsplash.com/photo-1630409351241-e90e7f5e434d?auto=format&fit=crop&w=400" },
    { name: "Chocolate Brownie", price: 750, category: "Desserts", tags: ["🍰 Sweet"], img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400" },
    { name: "Fresh Lime Juice", price: 400, category: "Beverages", tags: ["🥤 Fresh"], img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400" },
    // Add more items here following the same pattern
  ];

  const categories = ["All", "Starters", "Main Courses", "Rice & Noodles", "Burgers", "Pizza", "Desserts", "Beverages", "Chef’s Specials"];

  useEffect(() => {
    fetchMenuItems();
  }, [category]);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      // Trying to fetch from API, but filtering local data as a fallback
      const filtered = category === 'All' 
        ? localMenu 
        : localMenu.filter(item => item.category === category);
      setMenuItems(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    .menu-container { background: #080808; color: #fff; min-height: 100vh; padding: 60px 20px; font-family: 'Inter', sans-serif; }
    .cat-bar { display: flex; gap: 12px; overflow-x: auto; padding: 20px 0; scrollbar-width: none; justify-content: center; }
    .cat-pill { 
      padding: 10px 22px; border-radius: 50px; background: #1a1a1a; border: 1px solid #333; 
      color: #888; cursor: pointer; transition: 0.3s; white-space: nowrap;
    }
    .cat-pill.active { background: #ffc107; color: #000; font-weight: 700; border-color: #ffc107; box-shadow: 0 0 20px rgba(255,193,7,0.4); }
    .food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; margin-top: 40px; }
    .food-card { 
      background: #121212; border-radius: 20px; overflow: hidden; border: 1px solid #222; 
      transition: transform 0.4s ease; position: relative;
    }
    .food-card:hover { transform: translateY(-10px); border-color: #444; }
    .food-img { width: 100%; height: 220px; object-fit: cover; opacity: 0.8; transition: 0.4s; }
    .food-card:hover .food-img { opacity: 1; transform: scale(1.05); }
    .price-tag { 
      position: absolute; top: 15px; right: 15px; background: #ffc107; color: #000; 
      padding: 6px 14px; border-radius: 50px; font-weight: 900; font-size: 0.9rem; z-index: 10;
    }
    .tag-container { display: flex; gap: 5px; margin-bottom: 10px; flex-wrap: wrap; }
    .food-tag { font-size: 0.7rem; background: #222; padding: 3px 8px; border-radius: 4px; color: #ffc107; text-transform: uppercase; font-weight: 700; }
  `;

  return (
    <div className="menu-container">
      <style>{styles}</style>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '10px' }}>
            Our <span style={{ color: '#ffc107' }}>Menu</span>
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Savor the finest Sri Lankan & International Delicacies</p>
        </header>

        {/* Category Filter */}
        <div className="cat-bar">
          {categories.map(cat => (
            <div 
              key={cat} 
              className={`cat-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="food-grid">
          {menuItems.map((item, idx) => (
            <div key={idx} className="food-card">
              <div className="price-tag">LKR {item.price}</div>
              <div style={{ overflow: 'hidden' }}>
                <img src={item.img} alt={item.name} className="food-img" />
              </div>
              <div style={{ padding: '25px' }}>
                <div className="tag-container">
                  {item.tags?.map(tag => <span key={tag} className="food-tag">{tag}</span>)}
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>{item.name}</h3>
                <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Authentic preparation with fresh local ingredients.
                </p>
                <button 
                  onClick={() => addToCart(item)}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(90deg, #ffc107, #e6ae00)', color: '#000',
                    fontWeight: '800', cursor: 'pointer', transition: '0.3s'
                  }}
                >
                  ADD TO ORDER
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;