import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../api';
import { getProductById } from '../data/sampleProducts';
import { getTransportData } from '../utils/transportHelper';
import '../pages/pages.css';
import './BagDetail.css';

const CardDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);
  const [selectedQty, setSelectedQty] = useState(200);
  const [selectedImage, setSelectedImage] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [deliveryDays, setDeliveryDays] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [availableTransports, setAvailableTransports] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState(null);

  const cardGallery = card?.images?.length
    ? card.images.map((img, index) => ({ id: `${card.id}-img-${index}`, image: img }))
    : [{ id: `${card?.id || 'card'}-main`, image: card?.image || '' }];

  useEffect(() => {
    const fetchCard = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/products/${id}`);
        setCard(data);
      } catch (err) {
        const message = err?.response?.data?.message || err.message || 'Product not found';
        setError(`Unable to load product: ${message}`);
        const fallback = getProductById(id);
        if (fallback) {
          setCard(fallback);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [id]);

  useEffect(() => {
    if (card?.image) {
      setSelectedImage(card.image);
    }
  }, [card]);

  const handleAddToCart = () => {
    if (!card) return;
    addToCart({
      id: card._id || card.id,
      name: card.name,
      price: Number(card.price) || 0,
      image: card.image,
      qty: Math.max(1, Number(selectedQty)),
      size: card.size || 'Standard',
      pincode,
      deliveryCharge,
      deliveryDays,
      availableTransports,
      transport: selectedTransport,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  const checkPincode = () => {
    const transportInfo = getTransportData(pincode);
    if (!transportInfo) {
      setPincodeStatus('Invalid or unsupported pincode. Please enter a valid 6-digit pincode.');
      setDeliveryDays(null);
      setDeliveryCharge(0);
      setAvailableTransports([]);
      setSelectedTransport(null);
      return;
    }

    setPincodeStatus(`✓ Delivery available in ${transportInfo.stateName}`);
    setDeliveryDays(transportInfo.days);
    setDeliveryCharge(transportInfo.charge);
    setAvailableTransports(transportInfo.transports);
    setSelectedTransport(transportInfo.transports[0]);
  };

  const handleQtyChange = (value) => {
    const numeric = Number(value);
    if (!Number.isNaN(numeric) && numeric > 0) {
      setSelectedQty(numeric);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="page-container">
        <h2>Product not found</h2>
        <Link to="/visiting-cards" className="back-link">← Back to collection</Link>
      </div>
    );
  }

  return (
    <div className="bag-detail-container">
      <Link to="/visiting-cards" className="back-link">← Back to collection</Link>
      <div className="detail-wrapper">
        <div className="image-section">
          <div className="gallery-thumbnails" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {cardGallery.map((item) => (
              <img
                key={item.id}
                src={item.image}
                alt={card?.name || 'Card image'}
                style={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  border: selectedImage === item.image ? '2px solid #ff6b35' : '1px solid #ccc',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedImage(item.image)}
              />
            ))}
          </div>
          <div className="main-image">
            <img src={selectedImage || card.image || card.img} alt={card.name} />
          </div>
        </div>
        <div className="details-section">
          <h1>{card.name}</h1>
          <p className="size">{card.size || 'Standard'}</p>
          <table className="pricing-table">
            <thead>
              <tr>
                <th>Price</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>₹{card.price}</td>
                <td>
                  <input
                    type="number"
                    min={1}
                    value={selectedQty}
                    onChange={(e) => handleQtyChange(e.target.value)}
                    style={{ width: 100, padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={handleAddToCart}
              style={{
                flex: 1,
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
              onClick={() => window.open(`https://wa.me/919805699966?text=${encodeURIComponent(`I'm interested in ${card.name}. Qty ${selectedQty}`)}`, '_blank')}
              style={{
                flex: 1,
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
              💬 Share Design & Get Quote
            </button>
          </div>

          <div className="delivery-section">
            <h3>Delivery Estimate</h3>
            <div className="pincode-section">
              <input
                className="pincode-input"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value);
                  setPincodeStatus(null);
                  setDeliveryDays(null);
                  setDeliveryCharge(0);
                  setAvailableTransports([]);
                  setSelectedTransport(null);
                }}
                placeholder="Enter 6-digit pincode"
                maxLength={6}
              />
              <button className="check-btn" onClick={checkPincode}>
                Check
              </button>
            </div>
            {pincodeStatus && (
              <div className={`pincode-result ${pincodeStatus.startsWith('✓') ? 'success' : 'error'}`}>
                {pincodeStatus}
              </div>
            )}
            {deliveryDays && (
              <div className="delivery-info">
                <div className="info-item">
                  <span className="label">Estimated delivery</span>
                  <span className="value">{deliveryDays} days</span>
                </div>
                <div className="info-item">
                  <span className="label">Delivery charge</span>
                  <span className="value">₹{deliveryCharge}</span>
                </div>
                <div className="info-item">
                  <span className="label">Delivery available</span>
                  <span className="value">Yes</span>
                </div>
              </div>
            )}
            {availableTransports.length > 0 && (
              <div className="transport-section">
                <label className="transport-label" htmlFor="transportSelect">
                  Select transporter
                </label>
                <select
                  id="transportSelect"
                  className="transport-select"
                  value={selectedTransport?.id || ''}
                  onChange={(e) => {
                    const found = availableTransports.find((t) => t.id === e.target.value);
                    setSelectedTransport(found || null);
                  }}
                >
                  <option value="">Choose transporter</option>
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
            <p>{card.description || card.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetails;

