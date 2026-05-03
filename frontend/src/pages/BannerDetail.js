import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../api';
import { getProductById } from '../data/sampleProducts';
import { getTransportData } from '../utils/transportHelper';
import './pages.css';
import './BagDetail.css';

const BannerDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQty, setSelectedQty] = useState(200);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [deliveryDays, setDeliveryDays] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [availableTransports, setAvailableTransports] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState(null);

  const bannerGallery = useMemo(() => {
    return banner?.images?.length
      ? banner.images.map((img, idx) => ({ id: `prod-${idx}`, image: img, name: banner.name }))
      : banner?.image
        ? [{ id: 'prod-main', image: banner.image, name: banner.name }]
        : [];
  }, [banner]);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/products/${id}`);
        setBanner(data);
      } catch (err) {
        const message = err?.response?.data?.message || err.message || 'Product not found';
        setError(`Unable to load product: ${message}`);
        const fallback = getProductById(id);
        if (fallback) {
          setBanner(fallback);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, [id]);

  useEffect(() => {
    if (bannerGallery.length > 0) {
      setSelectedImage(bannerGallery[0].image);
    }
  }, [banner, bannerGallery]);

  if (loading) {
    return (
      <div className="page-container">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error || !banner) {
    return (
      <div className="page-container">
        <h2>Product not found</h2>
        <Link to="/flex-banners" className="back-link">← Back to collection</Link>
      </div>
    );
  }

  const handleQtyChange = (value) => {
    const numeric = Number(value);
    if (!Number.isNaN(numeric) && numeric > 0) {
      setSelectedQty(numeric);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: banner._id || banner.id,
      name: banner.name,
      price: Number(banner.price) || 0,
      image: banner.image,
      qty: Math.max(1, selectedQty),
      size: banner.size || 'Standard',
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

  const pricingRow = (qty) => ({ qty, price: Number(banner.price) || 0 });

  const pricingOptions = [
    pricingRow(200),
    pricingRow(500),
    pricingRow(1000),
  ];

  const selectedPrice = pricingOptions.find((p) => p.qty === selectedQty)?.price || Number(banner.price) || 0;

  return (
    <div className="bag-detail-container">
      <Link to="/flex-banners" className="back-link">← Back to collection</Link>
      <div className="detail-wrapper">
        <div className="image-section">
          <div className="gallery-thumbnails" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {bannerGallery.map((item) => (
              <img
                key={item.id}
                src={item.image || item.img}
                alt={item.name}
                style={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  border: selectedImage === (item.image || item.img) ? '2px solid #ff6b35' : '1px solid #ccc',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedImage(item.image || item.img)}
              />
            ))}
          </div>
          <img src={selectedImage || banner.image} alt={banner.name} className="details-img" />
        </div>
        <div className="info-section">
          <h1>{banner.name}</h1>
          <p className="size-info">{banner.size}</p>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Quantity</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
                onClick={() => handleQtyChange(selectedQty - 1)}
                disabled={selectedQty <= 1}
              >
                -
              </button>
              <input
                type="number"
                min={1}
                value={selectedQty}
                onChange={(e) => handleQtyChange(e.target.value)}
                style={{ width: 90, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <button
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
                onClick={() => handleQtyChange(selectedQty + 1)}
              >
                +
              </button>
            </div>
          </div>
          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f7f9fb', borderRadius: '5px' }}>
            <strong>Total: ₹{(selectedPrice * selectedQty).toFixed(2)}</strong>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
              onClick={() => window.open(`https://wa.me/919805699966?text=I'm interested in ${banner.name}`, '_blank')}
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
        </div>
      </div>
    </div>
  );
};

export default BannerDetail;
