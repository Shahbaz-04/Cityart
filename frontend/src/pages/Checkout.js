import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../api';
import './BagDetail.css';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  const totalDelivery = cart.reduce((sum, item) => sum + (item.deliveryCharge || 0), 0);
  const grandTotal = total + totalDelivery;



  const handleConfirm = async () => {
    if (cart.length === 0) {
      setMessage('❌ Your cart is empty.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const payload = {
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image || item.img,
          size: item.size,
          deliveryCharge: item.deliveryCharge || 0,
          transport: item.transport || null,
          pincode: item.pincode || '',
        })),
        total,
        totalDelivery,
        grandTotal,
        deliveryStatus: 'Not Started',
      };

      const response = await api.post('/api/orders', payload);
      const createdOrder = response.data;

      const whatsappText = `Order Confirmation\nOrder ID: ${createdOrder._id || createdOrder.id}\n\n📦 Items:\n${cart
        .map(item => `• ${item.name} x${item.qty} @ ₹${item.price}` + (item.deliveryCharge ? ` + ₹${item.deliveryCharge} delivery` : ''))
        .join('\n')}\n\n💰 Pricing:\nSubtotal: ₹${total.toFixed(2)}\nDelivery: ₹${totalDelivery.toFixed(2)}\nGrand Total: ₹${grandTotal.toFixed(2)}\n\n🚚 Delivery Status: Not Started\n\nPlease confirm the order and share the delivery details.`;
      window.open(`https://wa.me/919805699966?text=${encodeURIComponent(whatsappText)}`, '_blank');

      clearCart();
      setTimeout(() => navigate(`/order-confirmation/${createdOrder._id}`), 500);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Order failed, please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bag-detail-container">
        <h2>Checkout</h2>
        <p>Your cart is empty. Please add some items before checking out.</p>
      </div>
    );
  }

  return (
    <div className="bag-detail-container">
      <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: '#333' }}>🛍️ Checkout</h2>
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: '#666', fontSize: 16 }}>Please review your order and click confirm to proceed.</p>
      </div>

      {/* Order Items Section */}
      <div style={{ marginBottom: 30, padding: 24, backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 700, color: '#333' }}>📦 Order Items</h3>
        <table className="pricing-table" style={{ width: '100%', marginBottom: 20 }}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.qty || 1}</td>
                <td>₹ {item.price}</td>
                <td>₹ {((item.price || 0) * (item.qty || 1)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: '#666', borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
            <span>Subtotal:</span>
            <strong style={{ color: '#333' }}>₹ {total.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: '#666', borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
            <span>Delivery Charges:</span>
            <strong style={{ color: '#ff6b35' }}>₹ {totalDelivery.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700, color: '#25D366', paddingTop: 12 }}>
            <span>Grand Total:</span>
            <strong>₹ {grandTotal.toFixed(2)}</strong>
          </div>
        </div>
      </div>
      <button
        onClick={handleConfirm}
        disabled={submitting}
        style={{
          background: submitting ? '#ccc' : '#25D366',
          color: 'white',
          border: 'none',
          padding: 16,
          borderRadius: 8,
          fontSize: 18,
          fontWeight: 700,
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.6 : 1,
          width: '100%',
          transition: 'background 0.3s',
        }}
        onMouseOver={(e) => !submitting && (e.target.style.background = '#1fb854')}
        onMouseOut={(e) => !submitting && (e.target.style.background = '#25D366')}
      >
        {submitting ? '⏳ Placing order...' : '✓ Confirm Order'}
      </button>
      {message && (
        <div style={{ marginTop: 20, padding: 16, borderRadius: 8, color: message.includes('successfully') ? '#155724' : '#721c24', backgroundColor: message.includes('successfully') ? '#d4edda' : '#f8d7da', border: message.includes('successfully') ? '1px solid #c3e6cb' : '1px solid #f5c6cb', fontSize: 15, fontWeight: 500 }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default Checkout;
