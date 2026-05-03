import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem('cart');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const MIN_QTY = 200;

  const addToCart = (item) => {
    setCart(prev => {
      const qtyToAdd = Math.max(item.qty || 1, MIN_QTY);
      const idx = prev.findIndex(i => i.id === item.id);
      if (idx > -1) {
        const copy = [...prev];
        const updatedQty = Math.max((copy[idx].qty || 1) + qtyToAdd, MIN_QTY);
        copy[idx] = { ...copy[idx], ...item, qty: updatedQty };
        return copy;
      }
      return [...prev, { ...item, qty: qtyToAdd }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQty = (id, qty) => {
    const enforcedQty = Math.max(qty, MIN_QTY);
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: enforcedQty } : i));
  };

  const updateDeliveryForAll = useCallback((deliveryCharge, transport, pincode) => {
    setCart(prev => prev.map(item => ({
      ...item,
      deliveryCharge: deliveryCharge || 0,
      transport: transport || null,
      pincode: pincode || item.pincode || '',
    })));
  }, []);

  const clearCart = () => setCart([]);

  const itemCount = cart.reduce((s, i) => s + (i.qty || 0), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, updateDeliveryForAll, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
