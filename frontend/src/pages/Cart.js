import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './BagDetail.css';

const transportData = {
  bihar: {
    stateName: 'Bihar',
    days: '5-7',
    charge: 50,
    transports: [
      { id: 'delhivery-bih', name: 'Delhivery', icon: '📦', contact: '+91-7070777770' },
      { id: 'bluedart-bih', name: 'Blue Dart', icon: '🚚', contact: '+91-9711222333' },
      { id: 'fedex-bih', name: 'FedEx India', icon: '🚁', contact: '+91-8527771111' },
      { id: 'shiprocket-bih', name: 'ShipRocket', icon: '📮', contact: '+91-8448444422' },
    ],
  },
  jharkhand: {
    stateName: 'Jharkhand',
    days: '5-7',
    charge: 60,
    transports: [
      { id: 'delhivery-jk', name: 'Delhivery', icon: '📦', contact: '+91-7070777770' },
      { id: 'allcargo-jk', name: 'Allcargo Gati', icon: '🚚', contact: '+91-9555444222' },
      { id: 'ecom-jk', name: 'Ecom Express', icon: '📮', contact: '+91-9611222444' },
      { id: 'xpressbees-jk', name: 'XpressBees', icon: '🚁', contact: '+91-7022999222' },
    ],
  },
};

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQty, updateDeliveryForAll, clearCart } = useCart();
  
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [availableTransports, setAvailableTransports] = useState([]);
  const [selectedTransportForAll, setSelectedTransportForAll] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  useEffect(() => {
    updateDeliveryForAll(deliveryCharge, selectedTransportForAll, pincode);
  }, [selectedTransportForAll, deliveryCharge, pincode, updateDeliveryForAll]);

  const checkPincode = () => {
    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      setPincodeStatus('❌ Invalid pincode. Please enter a 6-digit number.');
      setAvailableTransports([]);
      setSelectedTransportForAll(null);
      return;
    }

    const first2Digits = parseInt(pincode.substring(0, 2), 10);
    let found = null;

    if (first2Digits >= 80 && first2Digits <= 85) {
      found = transportData.bihar;
    } else if (first2Digits >= 81 && first2Digits <= 83) {
      found = transportData.jharkhand;
    }

    if (found) {
      setPincodeStatus(`✓ Delivery available in ${found.stateName}`);
      setDeliveryCharge(found.charge);
      setAvailableTransports(found.transports);
      setSelectedTransportForAll(found.transports[0]);
    } else {
      setPincodeStatus("❌ We don't deliver to this pincode yet. Contact us for more info.");
      setAvailableTransports([]);
      setSelectedTransportForAll(null);
    }
  };

  const total = cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
  const totalDelivery = cart.reduce((s, i) => s + (i.deliveryCharge || 0), 0);
  const grandTotal = total + totalDelivery;

  return (
    <div className="bag-detail-container">
      <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: '#333' }}>🛒 Shopping Cart</h2>
      {cart.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', marginTop: 40, fontSize: 18 }}>Your cart is empty. 🛒</p>
      ) : (
        <div>
          {/* Delivery Estimate Section */}
          <div style={{ marginBottom: 30, padding: 20, backgroundColor: '#f0f8ff', borderRadius: 8, border: '2px solid #b3d9ff' }}>
            <h3 style={{ marginBottom: 15 }}>📍 Delivery Estimate</h3>
            <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.slice(0, 6))}
                placeholder="Enter 6-digit pincode"
                maxLength="6"
                style={{
                  flex: 1,
                  padding: 12,
                  border: '2px solid #b3d9ff',
                  borderRadius: 4,
                  fontSize: 16,
                }}
              />
              <button
                onClick={checkPincode}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Check
              </button>
            </div>

            {pincodeStatus && (
              <div style={{ marginBottom: 15, padding: 12, backgroundColor: pincodeStatus.includes('✓') ? '#d4edda' : '#f8d7da', color: pincodeStatus.includes('✓') ? '#155724' : '#721c24', borderRadius: 4, fontWeight: 500 }}>
                {pincodeStatus}
              </div>
            )}

            {availableTransports.length > 0 && (
              <div>
                <label style={{ display: 'block', marginBottom: 10, fontWeight: 600, fontSize: 14 }}>
                  Select Transporter:
                </label>
                <select
                  value={selectedTransportForAll?.id || ''}
                  onChange={(e) => {
                    const selected = availableTransports.find(t => t.id === e.target.value);
                    setSelectedTransportForAll(selected || null);
                  }}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 4,
                    border: '2px solid #b3d9ff',
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                >
                  <option value="">-- Select a Transporter --</option>
                  {availableTransports.map(transport => (
                    <option key={transport.id} value={transport.id}>
                      {transport.icon} {transport.name} ({transport.contact})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Cart Items Table */}
          <table className="pricing-table" style={{ marginBottom: 30, width: '100%' }}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th>Transport</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.id}>
                  <td style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={item.image || item.img} alt={item.name} style={{ width: 60, marginRight: 10, borderRadius: 4 }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{item.size || ''}</div>
                      {item.pincode && <div style={{ fontSize: 11, color: '#999' }}>📍 {item.pincode}</div>}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹ {item.price}</td>
                  <td>
                    <input type="number" min="200" value={Math.max(item.qty, 200)} onChange={(e) => updateQty(item.id, Number(e.target.value) || 200)} style={{ width: 60, padding: 6, border: '1px solid #ddd', borderRadius: 4 }} />
                  </td>
                  <td style={{ fontWeight: 600, color: '#ff6b35' }}>₹ {((item.price || 0) * (item.qty || 1)).toFixed(2)}</td>
                  <td>
                    {item.transport ? (
                      <div style={{ fontSize: 13 }}>
                        <div style={{ fontWeight: 600 }}>{item.transport.icon} {item.transport.name}</div>
                        <div style={{ fontSize: 11, color: '#666' }}>₹ {item.deliveryCharge}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#999' }}>-</span>
                    )}
                  </td>
                  <td>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: '#ff6b35', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ background: '#fff', padding: 24, borderRadius: 12, marginBottom: 24, border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
              <div>
                <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 700, color: '#333' }}>💰 Order Summary</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 15, borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
                  <span style={{ color: '#666' }}>Subtotal:</span>
                  <strong style={{ color: '#333' }}>₹ {total.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 15, borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
                  <span style={{ color: '#666' }}>Delivery Charges:</span>
                  <strong style={{ color: '#ff6b35' }}>₹ {totalDelivery.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: '#25D366', paddingTop: 12 }}>
                  <span>Grand Total:</span>
                  <strong>₹ {grandTotal.toFixed(2)}</strong>
                </div>
                <div style={{ marginTop: 20, fontSize: 13, color: '#999', lineHeight: 1.6 }}>
                  <p>✓ GST @18% extra (will be added at checkout)</p>
                  <p>✓ Minimum order quantity: 200 units</p>
                </div>
              </div>
              <div style={{ paddingLeft: 40, borderLeft: '2px solid #e0e0e0' }}>
                <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 700, color: '#333' }}>🚚 Delivery Info</h3>
                {selectedTransportForAll ? (
                  <div style={{ padding: 16, background: '#f9f9f9', borderRadius: 8, border: '2px solid #25D366' }}>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>
                        {selectedTransportForAll.icon} {selectedTransportForAll.name}
                      </div>
                      <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                        📞 {selectedTransportForAll.contact}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
                      <div>📍 Pincode: <strong>{pincode}</strong></div>
                      <div style={{ marginTop: 8 }}>⏱️ Estimated: <strong>5-7 days</strong></div>
                      <div style={{ marginTop: 8 }}>💵 Charge: <strong>₹{totalDelivery}</strong></div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: 16, background: '#fff3cd', borderRadius: 8, border: '1px solid #ffc107', color: '#856404' }}>
                    ⚠️ Please enter a pincode and select a transporter to see delivery details.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <button 
              onClick={clearCart} 
              style={{ 
                flex: 1, 
                background: '#ff6b35', 
                color: 'white', 
                border: 'none', 
                padding: 14, 
                borderRadius: 6, 
                cursor: 'pointer', 
                fontSize: 16, 
                fontWeight: 700,
                transition: 'background 0.3s',
              }}
              onMouseOver={(e) => e.target.style.background = '#e55a25'}
              onMouseOut={(e) => e.target.style.background = '#ff6b35'}
            >
              🗑️ Clear Cart
            </button>
            <button 
              onClick={() => navigate('/checkout')} 
              style={{ 
                flex: 1, 
                background: '#25D366', 
                color: 'white', 
                border: 'none', 
                padding: 14, 
                borderRadius: 6, 
                cursor: 'pointer', 
                fontSize: 16, 
                fontWeight: 700,
                transition: 'background 0.3s',
              }}
              onMouseOver={(e) => e.target.style.background = '#1fb854'}
              onMouseOut={(e) => e.target.style.background = '#25D366'}
            >
              ✓ Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
