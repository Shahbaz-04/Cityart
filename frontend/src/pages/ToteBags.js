import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './ToteBags.css';
import { useCart } from '../context/CartContext';
import { api } from '../api';
import { sampleProducts } from '../data/sampleProducts';

const ToteBags = () => {
  const [sortBy, setSortBy] = useState('rating');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCoating, setSelectedCoating] = useState('');
  const [bags, setBags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(null);

  // Helper function to fix image paths on the fly
  const fixImagePath = (path) => {
    if (!path) return '/assets/placeholder.jpg';
    // Agar path mein './public' ya 'public' hai, toh use remove karke root path banata hai
    return path.replace(/^\.\/public\/|^\/public\/|^public\//, '/');
  };

  useEffect(() => {
    const fetchBags = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/products');
        const bagsData = data.filter((p) => p.category?.toLowerCase() === 'bag');
        setBags(bagsData);
        setError(null);
      } catch (err) {
        // Fallback to sample data if API fails
        const fallback = sampleProducts.filter((p) => p.category?.toLowerCase() === 'bag');
        setBags(fallback);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBags();
  }, []);

  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(null), 2000);
    return () => clearTimeout(t);
  }, [justAdded]);

  const sortedBags = useMemo(() => {
    return [...bags].sort((a, b) => {
      const apr = Number(a.price) || 0;
      const bpr = Number(b.price) || 0;
      if (sortBy === 'price-low') return apr - bpr;
      if (sortBy === 'price-high') return bpr - apr;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [bags, sortBy]);

  const filteredBags = useMemo(() => {
    return sortedBags.filter(bag => {
      if (selectedCategory && bag.category !== selectedCategory) return false;
      if (selectedCoating && bag.coating !== selectedCoating) return false;
      return true;
    });
  }, [sortedBags, selectedCategory, selectedCoating]);

  const categories = ['Loop Handle Bags', 'Canvas Bags', 'Eco-friendly Bags'];
  const coatings = ['Laminated', 'Non-Coated', 'Metal'];

  if (loading) {
    return (
      <div className="tote-bags-wrapper">
        <div className="page-container">
          <h2>LOOP HANDLE BAGS</h2>
          <p>Loading…</p>
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

        <button className="clear-btn" onClick={() => { setSortBy('rating'); setSelectedCategory(''); setSelectedCoating(''); }}>
          ✕ Clear All
        </button>

        <div className="filter-group">
          <label className="filter-title">Category</label>
          {categories.map(cat => (
            <label key={cat}>
              <input type="checkbox" checked={selectedCategory === cat} onChange={(e) => setSelectedCategory(e.target.checked ? cat : '')} />
              {cat}
            </label>
          ))}
        </div>

        <div className="filter-group">
          <label className="filter-title">Coating Type</label>
          {coatings.map(coat => (
            <label key={coat}>
              <input type="checkbox" checked={selectedCoating === coat} onChange={(e) => setSelectedCoating(e.target.checked ? coat : '')} />
              {coat}
            </label>
          ))}
        </div>
      </div>

      <div className="products-wrapper">
        <h2 className="products-title">LOOP HANDLE BAG <span className="item-count">({filteredBags.length} Items)</span></h2>
        <div className="product-grid">
          {filteredBags.map(bag => {
            const bagId = bag._id || bag.id;
            // Clean Image Path
            const displayImage = fixImagePath(bag.image || bag.img);

            return (
              <Link to={`/bag/${bagId}`} key={bagId} className="product-card-link">
                <div className="product-card">
                  {bag.isNew && <span className="new-badge">New</span>}
                  <div className="product-image">
                    {/* Yahan fixImagePath function use ho raha hai */}
                    <img src={displayImage} alt={bag.name} />
                    <button className="wishlist-btn" onClick={(e) => e.preventDefault()}>♡</button>
                  </div>
                  <div className="product-details">
                    <h3>{bag.name}</h3>
                    <p className="product-size">{bag.size}</p>
                    <table className="pricing-table">
                      <tbody>
                        <tr>
                          <td>Bags</td>
                          <td>GSM</td>
                          <td className="price">₹{bag.price}</td>
                        </tr>
                        <tr>
                          <td>5000</td>
                          <td>125</td>
                          <td className="price">24.00</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="contact-buttons">
                      <a
                        href={`https://wa.me/919805699966?text=I'm interested in ${bag.name} (${bag.size}) priced at ₹${bag.price}`}
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
                            id: bagId,
                            name: bag.name,
                            price: bag.price,
                            image: displayImage,
                            size: bag.size,
                            qty: 200,
                          });
                          setJustAdded(bagId);
                        }}
                      >
                        Add to Cart
                        {justAdded === bagId && <span className="mini-added">✓</span>}
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

export default ToteBags;