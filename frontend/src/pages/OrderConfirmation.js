import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import './BagDetail.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    if (!orderId) {
      setError('No order ID provided.');
      setLoading(false);
      return;
    }

    try {
      if (!order) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      const { data } = await api.get(`/api/orders/${orderId}`);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="bag-detail-container">
        <h2>Loading order details...</h2>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bag-detail-container">
        <h2>❌ Order Not Found</h2>
        <p style={{ color: '#666', marginBottom: 24 }}>{error || 'Unable to load order.'}</p>
        <Link to="/" style={{ color: '#0066cc', textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Home
        </Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Not Started':
        return '#ff6b35';
      case 'In Transit':
        return '#0066cc';
      case 'Delivered':
        return '#25D366';
      case 'Cancelled':
        return '#cc0000';
      default:
        return '#666';
    }
  };

  const getStatusEmoji = (status) => {
    switch(status) {
      case 'Not Started':
        return '📦';
      case 'In Transit':
        return '🚚';
      case 'Delivered':
        return '✅';
      case 'Cancelled':
        return '❌';
      default:
        return '📋';
    }
  };

  return (
    <div className="bag-detail-container">
      <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: '#333' }}>✅ Order Confirmed!</h2>

      {/* Order Summary Card */}
      <div style={{
        background: '#fff',
        padding: 24,
        borderRadius: 12,
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: 24,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#333', marginBottom: 16 }}>📋 Order Details</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: '#666' }}>Order ID:</span>
              <strong style={{ color: '#333', fontFamily: 'monospace', fontSize: 14 }}>{order._id}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: '#666' }}>Order Date:</span>
              <strong style={{ color: '#333' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: '#666' }}>Status:</span>
              <strong style={{ color: '#333' }}>{order.status}</strong>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#333', marginBottom: 16 }}>🚚 Delivery Status</h3>
            <div style={{
              padding: 16,
              background: getStatusColor(order.deliveryStatus) + '15',
              borderLeft: `4px solid ${getStatusColor(order.deliveryStatus)}`,
              borderRadius: 8,
              marginBottom: 12,
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>
                {getStatusEmoji(order.deliveryStatus)}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: getStatusColor(order.deliveryStatus) }}>
                {order.deliveryStatus}
              </div>
            </div>
            <button
              onClick={fetchOrder}
              disabled={refreshing}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                background: refreshing ? '#ccc' : '#0066cc',
                color: '#fff',
                fontWeight: 700,
                cursor: refreshing ? 'not-allowed' : 'pointer',
              }}
            >
              {refreshing ? 'Refreshing…' : 'Refresh Status'}
            </button>
          </div>
        </div>

        {/* Items Section */}
        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#333', marginBottom: 16 }}>📦 Items in Order</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #e0e0e0' }}>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#333' }}>Item</th>
                <th style={{ padding: 12, textAlign: 'center', fontWeight: 600, color: '#333' }}>Qty</th>
                <th style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: '#333' }}>Price</th>
                <th style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: '#333' }}>Subtotal</th>
                <th style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: '#333' }}>Delivery</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    {item.image && <img src={item.image} alt={item.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />}
                    <div>
                      <div style={{ fontWeight: 600, color: '#333' }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{item.size || ''}</div>
                    </div>
                  </td>
                  <td style={{ padding: 12, textAlign: 'center', color: '#666' }}>{item.qty}</td>
                  <td style={{ padding: 12, textAlign: 'right', color: '#666' }}>₹{item.price}</td>
                  <td style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: '#ff6b35' }}>₹{(item.price * item.qty).toFixed(2)}</td>
                  <td style={{ padding: 12, textAlign: 'right', color: '#666' }}>₹{item.deliveryCharge || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', maxWidth: 400 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#666' }}>Subtotal:</span>
                <strong style={{ color: '#333' }}>₹{order.total.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#666' }}>Delivery Charges:</span>
                <strong style={{ color: '#ff6b35' }}>₹{order.totalDelivery.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: '#25D366' }}>
                <span>Grand Total:</span>
                <strong>₹{order.grandTotal.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transport Details */}
      {order.items.some(item => item.transport) && (
        <div style={{
          background: '#fff',
          padding: 24,
          borderRadius: 12,
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: 24,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#333', marginBottom: 16 }}>🚚 Transport Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {order.items.filter(item => item.transport).map((item, idx) => (
              <div key={idx} style={{
                padding: 16,
                background: '#f9f9f9',
                borderRadius: 8,
                border: '1px solid #e0e0e0',
              }}>
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ fontSize: 16, color: '#333' }}>{item.name}</strong>
                </div>
                <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>📦 Transporter:</span> {item.transport.name}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>📞 Contact:</span> {item.transport.contact}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>⏱️ Est. Days:</span> {item.transport.deliveryDays || '5-7'}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600 }}>💵 Charge:</span> ₹{item.deliveryCharge}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            flex: 1,
            minWidth: 200,
            padding: 14,
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 0.3s',
          }}
          onMouseOver={(e) => e.target.style.background = '#0052a3'}
          onMouseOut={(e) => e.target.style.background = '#0066cc'}
        >
          🏠 Back to Home
        </button>
        <button
          onClick={() => window.open(`https://wa.me/919805699966?text=Order ID: ${order._id}. Please provide delivery updates.`, '_blank')}
          style={{
            flex: 1,
            minWidth: 200,
            padding: 14,
            background: '#25D366',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 0.3s',
          }}
          onMouseOver={(e) => e.target.style.background = '#1fb854'}
          onMouseOut={(e) => e.target.style.background = '#25D366'}
        >
          💬 Contact via WhatsApp
        </button>
      </div>

      <div style={{
        padding: 16,
        background: '#d4edda',
        color: '#155724',
        borderRadius: 8,
        border: '1px solid #c3e6cb',
        fontSize: 14,
      }}>
        ✓ Your order has been confirmed! You will receive updates via WhatsApp on the registered number. Please save your Order ID for reference:  <strong>{order._id}</strong>
      </div>
    </div>
  );
};

export default OrderConfirmation;
