import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './BagDetail.css';
import { useCart } from '../context/CartContext';
import { api } from '../api';
import { getProductById } from '../data/sampleProducts';

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

const BagDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');

  const [selectedQty, setSelectedQty] = useState(200);
  const [added, setAdded] = useState(false);

  // Gallery logic remains identical
  const productGallery = product?.images?.length
    ? product.images.map((img, index) => ({ id: `${product.id}-img-${index}`, image: img }))
    : [{ id: `${product?.id || 'product'}-main`, image: product?.image || '' }];

  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [deliveryDays, setDeliveryDays] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [availableTransports, setAvailableTransports] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/products/${id}`);
        setProduct(data);
      } catch (err) {
        const message = err?.response?.data?.message || err.message || 'Product not found.';
        setError(`Unable to load product: ${message}`);
        const fallback = getProductById(id);
        if (fallback) {
          setProduct(fallback);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product?.image) {
      setSelectedImage(product.image);
    }
  }, [product]);

  const checkPincode = () => {
    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      setPincodeStatus('Invalid pincode. Please enter a 6-digit number.');
      setDeliveryDays(null);
      setDeliveryCharge(0);
      setAvailableTransports([]);
      setSelectedTransport(null);
      return;
    }

    const first2Digits = parseInt(pincode.substring(0, 2), 10);
    let found = null;

    // Improved logic for Bihar & Jharkhand Pincodes
    if (first2Digits >= 80 && first2Digits <= 85) {
      if (first2Digits >= 81 && first2Digits <= 83) {
        found = transportData.jharkhand; // Specific Jharkhand range
      } else {
        found = transportData.bihar;
      }
    }

    if (found) {
      setPincodeStatus(`✓ Delivery available in ${found.stateName}`);
      setDeliveryDays(found.days);
      setDeliveryCharge(found.charge);
      setAvailableTransports(found.transports);
      setSelectedTransport(found.transports[0]);
    } else {
      setPincodeStatus("✗ We don't deliver to this pincode yet. Contact us for more info.");
      setDeliveryDays(null);
      setDeliveryCharge(0);
      setAvailableTransports([]);
      setSelectedTransport(null);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const payload = {
      id: product._id || product.id,
      name: product.name,
      price: Number(product.price) || 0,
      image: product.image,
      size: product.size,
      qty: Math.max(200, selectedQty),
      pincode,
      deliveryCharge,
      deliveryDays,
      transport: selectedTransport,
    };

    addToCart(payload);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  const handleShareOnWhatsApp = () => {
    if (!product) return;
    const baseUrl = window.location.origin;
    const imageUrl = `${baseUrl}${product.image}`;
    // Properly encoded message for WhatsApp
    const message = `*${product.name}*\n\nSize: ${product.size || ''}\nPrice: ₹${product.price}\n\n📸 Design Image:\n${imageUrl}\n\nPlease share customization options and final quote.`;
    window.open(`https://wa.me/919805699966?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="page-container">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-container">
        <h2>Product not found</h2>
        <Link to="/tote-bags" className="back-link">← Back to Tote Bags</Link>
      </div>
    );
  }

  return (
    <div className="bag-detail-container">
      <Link to="/tote-bags" className="back-link">← Back to Tote Bags</Link>

      <div className="detail-wrapper">
        <div className="image-section">
          <div className="gallery-thumbnails" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {productGallery.map((item) => (
              <img
                key={item.id}
                src={item.image}
                alt={product?.name || 'Product image'}
                style={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  border: selectedImage === item.image ? '2px solid #ff6b35' : '1px solid #ccc',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
                onClick={() => setSelectedImage(item.image)}
              />
            ))}
          </div>
          <div className="main-image">
            <img src={selectedImage || product.image} alt={product.name} style={{ width: '100%', borderRadius: '8px' }} />
          </div>
        </div>

        <div className="details-section">
          <h1>{product.name}</h1>
          <p className="size">Size: {product.size}</p>

          <div className="pricing-section">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>Price</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>₹{product.price}</td>
                  <td>
                    <input
                      type="number"
                      min={200}
                      style={{ width: '80px', padding: '5px' }}
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(Math.max(200, Number(e.target.value) || 200))}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={handleAddToCart}
              style={{
                flex: 1,
                minWidth: '150px',
                padding: '12px 20px',
                backgroundColor: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {added ? '✓ Added to Cart' : '🛒 Add To Cart'}
            </button>
            <button
              onClick={handleShareOnWhatsApp}
              style={{
                flex: 1,
                minWidth: '150px',
                padding: '12px 20px',
                backgroundColor: '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              💬 Get Quote on WhatsApp
            </button>
          </div>

          <div className="delivery-section" style={{ marginTop: '30px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
            <h3>Delivery Estimate</h3>
            <div className="pincode-section" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                className="pincode-input"
                style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value);
                  setPincodeStatus(null);
                  setDeliveryDays(null);
                }}
                placeholder="Enter 6-digit pincode"
                maxLength={6}
              />
              <button 
                className="check-btn" 
                onClick={checkPincode}
                style={{ padding: '10px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Check
              </button>
            </div>
            {pincodeStatus && (
              <div style={{ color: pincodeStatus.startsWith('✓') ? 'green' : 'red', fontWeight: 'bold', marginBottom: '10px' }}>
                {pincodeStatus}
              </div>
            )}
            {deliveryDays && (
              <div className="delivery-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                  <span>Estimated delivery:</span>
                  <strong>{deliveryDays} days</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                  <span>Delivery charge:</span>
                  <strong>₹{deliveryCharge}</strong>
                </div>
              </div>
            )}
            {availableTransports.length > 0 && (
              <div className="transport-section" style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select transporter</label>
                <select
                  className="transport-select"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px' }}
                  value={selectedTransport?.id || ''}
                  onChange={(e) => {
                    const found = availableTransports.find((t) => t.id === e.target.value);
                    setSelectedTransport(found || null);
                  }}
                >
                  {availableTransports.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.contact}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ marginTop: 24 }}>
            <h3>Description</h3>
            <p style={{ lineHeight: '1.6', color: '#555' }}>{product.description || 'No description available.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BagDetail;