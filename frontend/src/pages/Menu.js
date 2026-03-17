import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenuItems, getMenuCategories } from '../services/menuService';
import { useCart } from '../context/CartContext';
import { formatPriceLabel } from '../utils/price';

const Menu = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [addedItems, setAddedItems] = useState(new Set());
  const [flyingItems, setFlyingItems] = useState([]);
  const [cartPulse, setCartPulse] = useState(false);
  const [quantities, setQuantities] = useState({});
  const { addToCart } = useCart();
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError('');
      const [menuResponse, categoriesResponse] = await Promise.all([
        getMenuItems(),
        getMenuCategories()
      ]);
      setMenuItems(menuResponse.data || []);
      setCategory((current) => (current === 'All' ? current : current));
      setCategoriesSource(categoriesResponse.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load menu items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const [categoriesSource, setCategoriesSource] = useState([]);

  const categories = useMemo(() => {
    if (categoriesSource.length) {
      return ['All', ...categoriesSource.map((item) => item.name).filter(Boolean)];
    }
    const unique = new Set(menuItems.map((item) => item.category).filter(Boolean));
    return ['All', ...Array.from(unique)];
  }, [categoriesSource, menuItems]);

  const filteredMenuItems = useMemo(() => {
    if (category === 'All') {
      return menuItems;
    }
    return menuItems.filter((item) => item.category === category);
  }, [menuItems, category]);

  const getItemId = (item) => item._id || item.name;

  const getItemQuantity = (item) => quantities[getItemId(item)] || 1;

  const updateItemQuantity = (item, delta) => {
    const itemId = getItemId(item);
    setQuantities((prev) => {
      const current = prev[itemId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  const handleAddToCart = (item, event) => {
    const imageUrl = item.image || item.img || '';
    const itemId = getItemId(item);
    const quantity = getItemQuantity(item);
    addToCart({ ...item, img: imageUrl }, quantity);
    
    // Add visual effect
    setAddedItems(prev => new Set(prev).add(itemId));
    
    // Trigger cart pulse
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 1000);
    
    // Create flying animation
    const buttonRect = event.target.getBoundingClientRect();
    const flyingItem = {
      id: Date.now(),
      image: imageUrl,
      startX: buttonRect.left + buttonRect.width / 2,
      startY: buttonRect.top + buttonRect.height / 2,
    };
    
    setFlyingItems(prev => [...prev, flyingItem]);
    
    // Remove flying item after animation
    setTimeout(() => {
      setFlyingItems(prev => prev.filter(i => i.id !== flyingItem.id));
    }, 1000);
    
    // Remove the button effect after animation completes
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 600);
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
    
    @keyframes cartPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    @keyframes checkmark {
      0% { transform: scale(0) rotate(0deg); opacity: 0; }
      70% { transform: scale(1.2) rotate(0deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    
    .qty-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .qty-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 999px;
      background: #111;
      border: 1px solid #222;
    }

    .qty-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: none;
      background: #1a1a1a;
      color: #ffc107;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .qty-btn:hover {
      background: #ffc107;
      color: #000;
      transform: scale(1.05);
    }

    .qty-value {
      min-width: 22px;
      text-align: center;
      font-weight: 800;
      color: #fff;
    }

    .add-btn { 
      flex: 1;
      padding: 12px; 
      background: #ffc107; 
      border: none; 
      border-radius: 10px; 
      font-weight: bold; 
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .add-btn:hover { 
      background: #ffb300;
      transform: scale(1.05);
    }
    
    .add-btn.added {
      animation: cartPulse 0.6s ease-out;
      background: #4caf50;
      color: white;
    }
    
    .checkmark-icon {
      animation: checkmark 0.6s ease-out;
    }
    
    .flying-item {
      position: fixed;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
      pointer-events: none;
      z-index: 9999;
      box-shadow: 0 4px 15px rgba(255, 193, 7, 0.6);
      border: 2px solid #ffc107;
    }
    
    @keyframes flyToCart {
      0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
      }
      50% {
        transform: translate(var(--deltaX), var(--deltaY)) scale(0.8);
        opacity: 0.8;
      }
      100% {
        transform: translate(var(--deltaX), var(--deltaY)) scale(0.2);
        opacity: 0;
      }
    }
    
    @keyframes cartBounce {
      0%, 100% { transform: scale(1); }
      25% { transform: scale(1.2); }
      50% { transform: scale(0.95); }
      75% { transform: scale(1.15); }
    }
  `;


  return (
    <div className="menu-page" style={{ position: 'relative' }}>
      <style>{styles}</style>
      
      {/* Cart Icon - Top Right */}
      <button 
        onClick={() => navigate('/cart')}
        title="Go to Cart"
        className={cartPulse ? 'cart-pulse' : ''}
        style={{
          position: 'fixed',
          top: '80px',
          right: '30px',
          background: '#ffc107',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          zIndex: 1000,
          boxShadow: '0 4px 15px rgba(255, 193, 7, 0.4)',
          transition: 'all 0.3s ease',
          animation: cartPulse ? 'cartBounce 0.6s ease-out' : 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.15)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 193, 7, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 193, 7, 0.4)';
        }}
      >
        🛒
      </button>

      <div className="container" style={{ maxWidth: '1200px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '40px' }}>
          Explore <span style={{ color: '#ffc107' }}>{category}</span>
        </h1>

        {/* Categories Bar */}
        <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`cat-pill ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={fetchMenuItems}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Menu'}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px', color: '#ffc107' }}>Loading your favorites...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', marginTop: '50px', color: '#ffc107' }}>{error}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
            {filteredMenuItems.map((item, index) => (
              <div key={index} className="food-card" style={{ position: 'relative' }}>
                <div className="badge-price">{formatPriceLabel(item.price)}</div>
                <img src={item.image || item.img} alt={item.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    {(item.tags || []).map(tag => (
                      <span key={tag} style={{ fontSize: '0.7rem', background: '#222', padding: '2px 8px', borderRadius: '4px', color: '#ffc107' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 style={{ margin: '0 0 10px 0' }}>{item.name}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.4' }}>{item.description}</p>
                  
                  <div className="qty-row">
                    <div className="qty-pill">
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateItemQuantity(item, -1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="qty-value">{getItemQuantity(item)}</span>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateItemQuantity(item, 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={(e) => handleAddToCart(item, e)}
                      className={`add-btn ${addedItems.has(getItemId(item)) ? 'added' : ''}`}
                    >
                      {addedItems.has(getItemId(item)) ? (
                        <span className="checkmark-icon">✓ Added</span>
                      ) : (
                        `+ Add ${getItemQuantity(item)}`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Flying Items Animation */}
      {flyingItems.map(flyingItem => {
        // Calculate cart icon position (fixed at top right)
        const cartX = window.innerWidth - 60;
        const cartY = 110;
        
        // Calculate delta for animation
        const deltaX = cartX - flyingItem.startX;
        const deltaY = cartY - flyingItem.startY;
        
        return (
          <img
            key={flyingItem.id}
            src={flyingItem.image}
            alt="Flying item"
            className="flying-item"
            style={{
              left: `${flyingItem.startX}px`,
              top: `${flyingItem.startY}px`,
              '--deltaX': `${deltaX}px`,
              '--deltaY': `${deltaY}px`,
              animation: 'flyToCart 1s ease-in-out forwards'
            }}
          />
        );
      })}
    </div>
  );
};

export default Menu;