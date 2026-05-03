import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './ToteBags.css';
import { useCart } from '../context/CartContext';
import { api } from '../api';
import { sampleProducts } from '../data/sampleProducts';

const assetBannerImages = [
  '/assets/Banner1.jpg',
  '/assets/Banner2.png',
  '/assets/Banner3.png',
  '/assets/Banner4.jpeg',
  '/assets/Banner5.jpeg',
  '/assets/Banner6.jpeg',
  '/assets/Banner7.jpeg',
];

const assetBannerProducts = assetBannerImages.map((image, idx) => ({
  id: `asset-banner-${idx + 1}`,
  name: `Banner ${idx + 1}`,
  description: 'Flex banner from assets',
  price: 500 + idx * 50,
  category: 'banner',
  size: ['3x5 ft', '4x8 ft', '6x10 ft', '5x8 ft', '4x6 ft', '6x8 ft', '8x10 ft'][idx],
  image,
}));

const FlexBanners = () => {
  const [sortBy, setSortBy] = useState('rating');
  const [selectedSize, setSelectedSize] = useState('');
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/products');
        // Filter for banners (case-insensitive)
        const banerData = data.filter((p) => p.category?.toLowerCase() === 'banner');
        const fallback = sampleProducts.filter((p) => p.category?.toLowerCase() === 'banner');
        // अगर बैकएंड में सिर्फ 3 आइटम हैं, तो भी बाकी asset/banners से जोड़ दें
        const merged = [...banerData];

        [...fallback, ...assetBannerProducts].forEach((item) => {
          if (!merged.some((b) =>
            (b.image || b.img) === item.image ||
            b._id === item._id ||
            b.id === item.id ||
            (b.name && item.name && b.name === item.name)
          )) {
            merged.push(item);
          }
        });

        setBanners(merged);
        setError(null);
      } catch (err) {
        const fallback = sampleProducts.filter((p) => p.category === 'banner');
        setBanners(fallback);
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(null), 2000);
    return () => clearTimeout(t);
  }, [justAdded]);

  const sorted = useMemo(() => {
    return [...banners].sort((a, b) => {
      const apr = Number(a.price) || parseInt(String(a.price).replace(/[^0-9]/g, ''), 10) || 0;
      const bpr = Number(b.price) || parseInt(String(b.price).replace(/[^0-9]/g, ''), 10) || 0;
      if (sortBy === 'price-low') return apr - bpr;
      if (sortBy === 'price-high') return bpr - apr;
      return 0;
    });
  }, [banners, sortBy]);

  const filtered = useMemo(() => {
    return sorted.filter(b => {
      if (selectedSize && !(b.size || b.name).includes(selectedSize)) return false;
      return true;
    });
  }, [sorted, selectedSize]);

  if (loading) {
    return (
      <div className="tote-bags-wrapper">
        <div className="page-container">
          <h2>फ्लेक्स बैनर कलेक्शन</h2>
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tote-bags-wrapper">
        <div className="page-container">
          <h2>फ्लेक्स बैनर कलेक्शन</h2>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tote-bags-wrapper">
      <div className="filter-sidebar">
        <h3>Filter & Sort</h3>
        <div className="filter-group">
          <label className="filter-title">Sort by</label>
          <div className="sort-options">
            <label>
              <input type="radio" value="rating" checked={sortBy === 'rating'} onChange={(e) => setSortBy(e.target.value)} />
              Rating
            </label>
            <label>
              <input type="radio" value="price-low" checked={sortBy === 'price-low'} onChange={(e) => setSortBy(e.target.value)} />
              Price (Low to High)
            </label>
            <label>
              <input type="radio" value="price-high" checked={sortBy === 'price-high'} onChange={(e) => setSortBy(e.target.value)} />
              Price (High to Low)
            </label>
          </div>
        </div>
        <div className="filter-group">
          <label className="filter-title">Size</label>
          <label>
            <input type="checkbox" checked={selectedSize === '3x5'} onChange={(e) => setSelectedSize(e.target.checked ? '3x5' : '')} />
            3x5 ft
          </label>
          <label>
            <input type="checkbox" checked={selectedSize === '4x8'} onChange={(e) => setSelectedSize(e.target.checked ? '4x8' : '')} />
            4x8 ft
          </label>
        </div>
        <button className="clear-btn" onClick={() => { setSortBy('rating'); setSelectedSize(''); }}>✕ Clear All</button>
      </div>
      <div className="page-container">
        <h2>फ्लेक्स बैनर कलेक्शन</h2>
        <div className="product-grid">
          {filtered.map(banner => {
            const bannerId = banner._id || banner.id;
            return (
              <Link to={`/banner/${bannerId}`} key={bannerId} className="product-card-link">
                <div className="product-card">
                  <div className="product-image">
                    <img src={banner.image || banner.img} alt={banner.name} />
                    <button className="wishlist-btn" onClick={(e) => e.preventDefault()}>♡</button>
                  </div>
                  <div className="product-details">
                    <h3>{banner.name}</h3>
                    <table className="pricing-table">
                      <tbody>
                        <tr>
                          <td>Price</td>
                          <td className="price">₹{banner.price}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="contact-buttons">
                      <a
                        href={`https://wa.me/919805699966?text=I'm interested in ${banner.name} (${banner.size || ''}) priced at ₹${banner.price}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whatsapp-btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        WhatsApp
                      </a>
                      <a href="tel:+919805699966" className="call-btn" onClick={(e) => e.stopPropagation()}>
                        Call
                      </a>
                      <button
                        className="add-cart-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart({
                            id: bannerId,
                            name: banner.name,
                            price: banner.price,
                            image: banner.image || banner.img,
                            qty: 200,
                          });
                          setJustAdded(bannerId);
                        }}
                      >
                        Add to Cart
                        {justAdded === bannerId && <span className="mini-added">✓</span>}
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FlexBanners;
