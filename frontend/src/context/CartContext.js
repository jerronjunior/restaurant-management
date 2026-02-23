import React, { createContext, useState, useContext, useEffect } from 'react';
import { getNumericPrice } from '../utils/price';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, quantity = 1) => {
    setCart((prevCart) => {
      // Create a unique identifier for the item (use _id or name as fallback)
      const itemUniqueId = item._id || item.name;
      
      // Find if the exact same item already exists in cart
      const existingItem = prevCart.find((cartItem) => {
        const cartItemUniqueId = cartItem.cartItemId || cartItem._id || cartItem.name;
        return cartItemUniqueId === itemUniqueId;
      });
      
      if (existingItem) {
        // If item exists, increase quantity
        return prevCart.map((cartItem) => {
          const cartItemUniqueId = cartItem.cartItemId || cartItem._id || cartItem.name;
          return cartItemUniqueId === itemUniqueId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem;
        });
      }
      
      // If item doesn't exist, add it with a unique identifier
      return [...prevCart, { ...item, quantity, cartItemId: itemUniqueId }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => {
      const cartItemUniqueId = item.cartItemId || item._id || item.name;
      return cartItemUniqueId !== itemId && item._id !== itemId && item.name !== itemId;
    }));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) => {
        const cartItemUniqueId = item.cartItemId || item._id || item.name;
        return cartItemUniqueId === itemId || item._id === itemId || item.name === itemId
          ? { ...item, quantity }
          : item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + getNumericPrice(item.price) * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
