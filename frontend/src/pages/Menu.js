import React, { useMemo, useState, useEffect } from 'react';
import { getMenuItems, getMenuCategories } from '../services/menuService';
import { useCart } from '../context/CartContext';
import { formatPriceLabel } from '../utils/price';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
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

  const handleAddToCart = (item) => {
    const imageUrl = item.image || item.img || '';
    addToCart({ ...item, img: imageUrl });
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
            className="cat-pill"
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