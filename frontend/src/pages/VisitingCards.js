// src/pages/VisitingCards.js का पूरा सही कोड

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './pages.css';
import './ToteBags.css'; // reuse filter/sidebar styles
import { useCart } from '../context/CartContext';
import { api } from '../api';
import { sampleProducts } from '../data/sampleProducts';

const getCardMeta = (card) => {
  const lower = card.name.toLowerCase();
  let coating = 'Standard';
  if (lower.includes('matte')) coating = 'Matte';
  else if (lower.includes('glossy')) coating = 'Glossy';
  else if (lower.includes('silk')) coating = 'Silk';
  else if (lower.includes('spot uv')) coating = 'Spot UV';
  else if (lower.includes('embossed')) coating = 'Embossed';
  else if (lower.includes('die')) coating = 'Die-cut';
  else if (lower.includes('eco')) coating = 'Eco-friendly';

  let cardType = 'Standard';
  if (lower.includes('premium') || lower.includes('luxury')) cardType = 'Premium';
  if (lower.includes('eco')) cardType = 'Eco-friendly';
  if (lower.includes('silk') || lower.includes('embossed') || lower.includes('spot uv') || lower.includes('die')) cardType = 'Premium';

  return {
    ...card,
    coating,
    cardType,
    rating: card.rating || 4.2,
  };
};

const isCardProduct = (product) => {
  const category = String(product.category || '').toLowerCase();
  const name = String(product.name || '').toLowerCase();
  const image = String(product.image || product.img || '').toLowerCase();
  return category === 'card' || name.includes('card') || image.includes('card');
};

const VisitingCards = () => {
  const [sortBy, setSortBy] = useState('rating');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCoating, setSelectedCoating] = useState('');
  const categories = ['Standard', 'Premium', 'Eco-friendly', 'Luxury'];
  const coatings = ['Matte', 'Glossy', 'Silk', 'Spot UV', 'Embossed', 'Die-cut', 'Eco-friendly'];
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/products');
        // Include all products that are card-category or have "card" in their name/image path.
        const cardsData = data.filter(isCardProduct).map(getCardMeta);
        setCards(cardsData);
        setError(null);
      } catch (err) {
        const fallback = sampleProducts.filter(isCardProduct).map(getCardMeta);
        setCards(fallback);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);


  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(null), 2000);
    return () => clearTimeout(t);
  }, [justAdded]);

  const sorted = [...cards].sort((a, b) => {
    const apr = Number(a.price) || parseInt(String(a.price).replace(/[^0-9]/g, ''), 10) || 0;
    const bpr = Number(b.price) || parseInt(String(b.price).replace(/[^0-9]/g, ''), 10) || 0;
    if (sortBy === 'price-low') return apr - bpr;
    if (sortBy === 'price-high') return bpr - apr;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const filtered = sorted.filter(c => {
    if (selectedCategory && c.cardType !== selectedCategory) return false;
    if (selectedCoating && c.coating !== selectedCoating) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="tote-bags-wrapper">
        <div className="page-container">
          <h2>विजिटिंग कार्ड शादी कार्ड कलेक्शन</h2>
          <p>Loading cards…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tote-bags-wrapper">
        <div className="page-container">
          <h2>विजिटिंग कार्ड शादी कार्ड कलेक्शन</h2>
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
          <label className="filter-title">Category</label>
          {categories.map((cat) => (
            <label key={cat}>
              <input type="checkbox" checked={selectedCategory === cat} onChange={(e) => setSelectedCategory(e.target.checked ? cat : '')} />
              {cat}
            </label>
          ))}
        </div>

        <div className="filter-group">
          <label className="filter-title">Coating</label>
          {coatings.map((coat) => (
            <label key={coat}>
              <input type="checkbox" checked={selectedCoating === coat} onChange={(e) => setSelectedCoating(e.target.checked ? coat : '')} />
              {coat}
            </label>
          ))}
        </div>

        <button className="clear-btn" onClick={() => { setSortBy('rating'); setSelectedCategory(''); setSelectedCoating(''); }}>✕ Clear All</button>
      </div>
      <div className="page-container">
        <h2>विजिटिंग कार्ड शादी कार्ड कलेक्शन</h2>
        <div className="product-grid">
          {filtered.map(card => (
            <Link to={`/visiting-card/${card._id || card.id}`} className="product-card-link" key={card._id || card.id}>
              <div className="product-card">
                <div className="product-image">
                  <img src={card.image || card.img} alt={card.name} />
                  <button className="wishlist-btn" onClick={(e) => e.preventDefault()}>♡</button>
                </div>
                <div className="product-details">
                  <h3>{card.name}</h3>
                  <p className="product-size">{card.cardType} / {card.coating}</p>
                  <table className="pricing-table">
                    <tbody>
                      <tr>
                        <td>Price</td>
                        <td className="price">₹{card.price}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="contact-buttons">
                    <a
                      href={`https://wa.me/919805699966?text=मैं ${card.name} (₹${card.price}) में रुचि रखता हूँ`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      WhatsApp
                    </a>
                    <a
                      href="tel:+919805699966"
                      className="call-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Call
                    </a>
                    <button
                      className="add-cart-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart({ id: card._id || card.id, name: card.name, price: card.price, image: card.image || card.img, qty: 200 });
                        setJustAdded(card._id || card.id);
                      }}
                    >
                      Add to Cart
                      {justAdded === (card._id || card.id) && <span className="mini-added">✓</span>}
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisitingCards;