import React, { useState, useEffect } from 'react';
import { getMenuItems } from '../services/menuService';
import { useCart } from '../context/CartContext';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const { addToCart } = useCart();

  // Your Specific Menu Data structured for the UI
  const localMenu = [
    // --- STARTERS / APPETIZERS ---
    { 
      name: "Vegetable Spring Rolls", 
      price: 650, 
      category: "Starters", 
      tags: ["🥬 Veg", "Crispy"], 
      img: "https://images.unsplash.com/photo-1544333346-646706988bb1?auto=format&fit=crop&w=500",
      description: "Crispy pastry filled with seasoned garden vegetables served with sweet chili sauce."
    },
    { 
      name: "Chicken Cutlets (3 pcs)", 
      price: 550, 
      category: "Starters", 
      tags: ["🍗 Non-Veg", "Local Favorite"], 
      img: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=500",
      description: "Traditional Sri Lankan style breaded chicken nuggets with a hint of spice."
    },
    { 
      name: "Fish Fingers", 
      price: 750, 
      category: "Starters", 
      tags: ["🐟 Seafood"], 
      img: "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?auto=format&fit=crop&w=500",
      description: "Golden fried fish strips served with creamy tartar sauce."
    },
    { 
      name: "Chicken Wings (Spicy / BBQ)", 
      price: 1100, 
      category: "Starters", 
      tags: ["🌶️ Spicy", "⭐ Best Seller"], 
      img: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=500",
      description: "Juicy wings tossed in your choice of fiery hot sauce or smoky BBQ."
    },
    { 
      name: "Garlic Bread", 
      price: 600, 
      category: "Starters", 
      tags: ["🥬 Veg", "Classic"], 
      img: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=500",
      description: "Toasted baguette slices smothered in garlic herb butter."
    },
    // You can add your Main Courses, Rice & Noodles etc. here using the same format
  ];

  const categories = ["All", "Starters", "Main Courses", "Rice & Noodles", "Burgers", "Pizza", "Desserts"];

  useEffect(() => {
    fetchMenuItems();
  }, [category]);

  const fetchMenuItems = async () => {
    setLoading(true);
    // Simulating API fetch but using our detailed local list
    setTimeout(() => {
      const filtered = category === 'All' 
        ? localMenu 
        : localMenu.filter(item => item.category === category);
      setMenuItems(filtered);
      setLoading(false);
    }, 500); 
  };

  const styles = `
    .menu-page { background: #050505; color: white; min-height: 100vh; padding: 50px 20px; }
    .cat-pill { 
      padding: 12px 28px; border-radius: 50px; background: #111; border: 1px solid #222;
      color: #777; cursor: pointer; transition: 0.3s; font-weight: 600;
    }
    .cat-pill.active { background: #ffc107; color: #000; border-color: #ffc107; box-shadow: 0 0 15px rgba(255,193,7,0.3); }
    .food-card { 
      background: #0f0f0f; border-radius: 20px; overflow: hidden; border: 1px solid #1a1a1a;
      transition: all 0.4s ease;
    }
    .food-card:hover { transform: translateY(-8px); border-color: #ffc107; }
    .badge-price { 
      position: absolute; top: 15px; right: 15px; background: #ffc107; color: #000;
      padding: 5px 12px; border-radius: 8px; font-weight: 800; z-index: 5;
    }
  `;

  return (
    <div className="menu-page">
      <style>{styles}</style>
      <div className="container" style={{ maxWidth: '1200px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '40px' }}>
          Explore <span style={{ color: '#ffc107' }}>Starters</span>
        </h1>

        {/* Categories Bar */}
        <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '30px', justifyContent: 'center' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`cat-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px', color: '#ffc107' }}>Loading your favorites...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
            {menuItems.map((item, index) => (
              <div key={index} className="food-card" style={{ position: 'relative' }}>
                <div className="badge-price">LKR {item.price}</div>
                <img src={item.img} alt={item.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    {item.tags.map(tag => (
                      <span key={tag} style={{ fontSize: '0.7rem', background: '#222', padding: '2px 8px', borderRadius: '4px', color: '#ffc107' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 style={{ margin: '0 0 10px 0' }}>{item.name}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.4' }}>{item.description}</p>
                  
                  <button 
                    onClick={() => addToCart(item)}
                    style={{ 
                      width: '100%', padding: '12px', background: '#ffc107', border: 'none', 
                      borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' 
                    }}
                  >
                    Add to Cart
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