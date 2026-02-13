import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPriceLabel, getNumericPrice } from '../utils/price';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const formatPrice = (amount) => formatPriceLabel(amount);

  const styles = `
    .cart-page { background: #080808; color: white; min-height: 100vh; padding: 60px 20px; }
    .cart-container { max-width: 900px; margin: 0 auto; }
    .cart-card { background: #111; border-radius: 20px; border: 1px solid #222; padding: 30px; }
    .cart-item { 
      display: flex; align-items: center; justify-content: space-between; 
      padding: 20px 0; border-bottom: 1px solid #222; gap: 20px;
    }
    .cart-item:last-child { border-bottom: none; }
    .item-details h4 { margin: 0; font-size: 1.2rem; color: #ffc107; }
    .item-details p { margin: 5px 0 0; color: #666; font-size: 0.9rem; }
    
    .qty-controls { display: flex; align-items: center; gap: 15px; background: #1a1a1a; padding: 5px 15px; border-radius: 50px; border: 1px solid #333; }
    .qty-btn { background: transparent; border: none; color: #ffc107; font-size: 1.2rem; cursor: pointer; font-weight: bold; width: 30px; }
    
    .total-section { margin-top: 30px; padding-top: 20px; border-top: 2px solid #ffc107; display: flex; justify-content: space-between; align-items: center; }
    .btn-checkout { background: #ffc107; color: black; border: none; padding: 15px 40px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s; }
    .btn-checkout:hover { transform: scale(1.05); box-shadow: 0 0 20px rgba(255,193,7,0.4); }
    .empty-cart-ui { text-align: center; padding: 100px 20px; }
  `;

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <style>{styles}</style>
        <div className="empty-cart-ui">
          <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🛒</div>
          <h2 style={{ fontSize: '2.5rem' }}>Your Cart is <span style={{ color: '#ffc107' }}>Empty</span></h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>Looks like you haven't added any Sri Lankan delicacies yet.</p>
          <button onClick={() => navigate('/menu')} className="btn-checkout">Browse Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <style>{styles}</style>
      <div className="cart-container">
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '40px' }}>Your <span style={{ color: '#ffc107' }}>Orders</span></h1>

        <div className="cart-card">
          {cart.map((item) => (
            /* We use item._id OR item.name to ensure the key is unique */
            <div key={item._id || item.name} className="cart-item">
              <div className="item-details" style={{ flex: 2 }}>
                <h4>{item.name}</h4>
                <p>{formatPrice(item.price)} each</p>
              </div>

              <div className="qty-controls">
                <button 
                  className="qty-btn" 
                  onClick={() => updateQuantity(item._id || item.name, item.quantity - 1)}
                >
                  −
                </button>
                <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                <button 
                  className="qty-btn" 
                  onClick={() => updateQuantity(item._id || item.name, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <div style={{ flex: 1, textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>
                {formatPrice(getNumericPrice(item.price) * item.quantity)}
              </div>

              <button 
                onClick={() => removeFromCart(item._id || item.name)}
                style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
              >
                Remove
              </button>
            </div>
          ))}

          <div className="total-section">
            <div>
              <p style={{ margin: 0, color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Grand Total</p>
              <h2 style={{ margin: 0, fontSize: '2rem', color: '#fff' }}>{formatPrice(getTotalPrice())}</h2>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={clearCart} 
                style={{ background: 'transparent', border: '1px solid #333', color: '#888', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }}
              >
                Clear
              </button>
              <button onClick={() => navigate('/booking')} className="btn-checkout">
                Proceed to Booking →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;