import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <h1 className="page-title">Shopping Cart</h1>
          <div className="empty-state">
            <h3>Your cart is empty</h3>
            <p>Add some items from the menu to get started!</p>
            <button onClick={() => navigate('/menu')} className="btn btn-primary" style={{ marginTop: '20px' }}>
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Shopping Cart</h1>

        <div className="card">
          {cart.map((item) => (
            <div key={item._id} className="cart-item">
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">${item.price.toFixed(2)} each</div>
              </div>
              <div className="cart-item-quantity">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="quantity-btn"
                >
                  -
                </button>
                <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>
              <div style={{ minWidth: '100px', textAlign: 'right' }}>
                ${(item.price * item.quantity).toFixed(2)}
              </div>
              <button
                onClick={() => removeFromCart(item._id)}
                className="btn btn-danger"
                style={{ marginLeft: '10px', padding: '5px 10px' }}
              >
                Remove
              </button>
            </div>
          ))}

          <div className="cart-total">
            <span>Total:</span>
            <span>${getTotalPrice().toFixed(2)}</span>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button onClick={clearCart} className="btn btn-secondary">
              Clear Cart
            </button>
            <button
              onClick={() => navigate('/booking')}
              className="btn btn-success"
              style={{ flex: 1 }}
            >
              Proceed to Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
