import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const Menu = () => {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState('Starters');

  // Your full menu data organized by your categories
  const menuData = {
    "Starters": [
      { name: "Vegetable Spring Rolls", price: 650, tag: "🥬 Veg", img: "https://images.unsplash.com/photo-1544333346-646706988bb1?w=400" },
      { name: "Chicken Cutlets (3 pcs)", price: 550, tag: "🍗 Non-Veg", img: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400" },
      { name: "Fish Fingers", price: 750, tag: "🐟 Seafood", img: "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=400" },
      { name: "Chicken Wings (Spicy/BBQ)", price: 1100, tag: "🌶️ Spicy", img: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400" },
      { name: "Garlic Bread", price: 600, tag: "🥬 Veg", img: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400" },
    ],
    "Main Courses": [
      { name: "Chicken Curry", price: 1250, tag: "🍗 Non-Veg", img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400" },
      { name: "Fish Ambul Thiyal", price: 1450, tag: "⭐ Best Seller", img: "https://images.unsplash.com/photo-1512132411229-c30391241dd8?w=400" },
      { name: "Vegetable Curry Mix", price: 950, tag: "🥬 Veg", img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400" },
      { name: "Beef Curry", price: 1650, tag: "🥩 Meat", img: "https://images.unsplash.com/photo-1589187151003-0dd30df2ecf1?w=400" },
      { name: "Grilled Chicken", price: 1850, tag: "👨‍🍳 Chef's Special", img: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400" },
    ],
    "Rice & Noodles": [
      { name: "Chicken Fried Rice", price: 1250, tag: "🍗 Non-Veg", img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400" },
      { name: "Vegetable Fried Rice", price: 950, tag: "🥬 Veg", img: "https://images.unsplash.com/photo-1512058560366-cd2427ff56f3?w=400" },
      { name: "Seafood Fried Rice", price: 1550, tag: "🐟 Seafood", img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400" },
      { name: "Chicken Kottu", price: 1200, tag: "🔥 Popular", img: "https://images.unsplash.com/photo-1630409351241-e90e7f5e434d?w=400" },
      { name: "Vegetable Noodles", price: 1000, tag: "🥬 Veg", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400" },
    ],
    "Burgers": [
      { name: "Classic Chicken Burger", price: 1100, tag: "🍔 Best", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
      { name: "Beef Burger", price: 1350, tag: "🥩 Meat", img: "https://images.unsplash.com/photo-1547584385-8cd817456c95?w=400" },
      { name: "Chicken Submarine", price: 1400, tag: "🥖 Large", img: "https://images.unsplash.com/photo-1553909489-cd47e090796a?w=400" },
    ],
    "Pizza": [
      { name: "Margherita Pizza", price: 1600, tag: "🥬 Veg", img: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad50?w=400" },
      { name: "Chicken Pepperoni", price: 2100, tag: "🍕 Best", img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400" },
      { name: "Seafood Pizza", price: 2500, tag: "🐟 Seafood", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400" },
    ],
    "Desserts": [
      { name: "Chocolate Brownie", price: 750, tag: "🍫 Sweet", img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400" },
      { name: "Watalappan", price: 600, tag: "⭐ Local", img: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=400" },
      { name: "Cheesecake", price: 950, tag: "🍰 Creamy", img: "https://images.unsplash.com/photo-1524351199679-46cddf3027c0?w=400" },
    ],
    "Beverages": [
      { name: "Fresh Lime Juice", price: 400, tag: "🍋 Fresh", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400" },
      { name: "Iced Coffee", price: 550, tag: "☕ Cold", img: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400" },
      { name: "Milkshakes", price: 750, tag: "🥤 Creamy", img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400" },
    ],
    "Chef's Specials": [
      { name: "Seafood Platter", price: 3200, tag: "👨‍🍳 Premium", img: "https://images.unsplash.com/photo-1551248429-42435c47466f?w=400" },
      { name: "Mixed Grill", price: 3500, tag: "🥩 Massive", img: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400" },
      { name: "Family Rice & Curry", price: 4500, tag: "👨‍👩‍👧‍👦 4 Pax", img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400" },
    ]
  };

  const categories = Object.keys(menuData);

  const styles = `
    .menu-page { background: #080808; color: white; min-height: 100vh; padding-bottom: 50px; }
    .hero-mini { background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200'); height: 300px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; margin-bottom: 40px; }
    .cat-nav { display: flex; gap: 10px; overflow-x: auto; padding: 20px; sticky; top: 0; background: #080808; z-index: 100; justify-content: center; scrollbar-width: none; }
    .cat-btn { background: #1a1a1a; border: 1px solid #333; color: #888; padding: 10px 20px; border-radius: 50px; cursor: pointer; transition: 0.3s; white-space: nowrap; }
    .cat-btn.active { background: #ffc107; color: black; font-weight: bold; border-color: #ffc107; box-shadow: 0 0 15px rgba(255,193,7,0.4); }
    .food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; padding: 20px; max-width: 1200px; margin: 0 auto; }
    .food-card { background: #111; border-radius: 15px; overflow: hidden; border: 1px solid #222; position: relative; transition: 0.3s; }
    .food-card:hover { border-color: #ffc107; transform: translateY(-5px); }
    .price-tag { position: absolute; top: 10px; right: 10px; background: #ffc107; color: black; padding: 4px 12px; border-radius: 5px; font-weight: 900; z-index: 2; font-size: 0.9rem; }
  `;

  return (
    <div className="menu-page">
      <style>{styles}</style>
      
      <div className="hero-mini">
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', textShadow: '2px 2px 10px black' }}>OUR MENU</h1>
      </div>

      <div className="cat-nav">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="food-grid">
        {menuData[activeCategory].map((item, index) => (
          <div key={index} className="food-card">
            <div className="price-tag">LKR {item.price.toLocaleString()}</div>
            <img src={item.img} alt={item.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            <div style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.7rem', color: '#ffc107', fontWeight: 'bold' }}>{item.tag}</span>
              <h3 style={{ margin: '5px 0 15px 0', fontSize: '1.2rem' }}>{item.name}</h3>
              <button 
                onClick={() => addToCart(item)}
                style={{ width: '100%', padding: '10px', background: '#ffc107', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ADD TO CART
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;