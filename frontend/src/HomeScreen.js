import React from 'react';
import { Link } from 'react-router-dom';
import './HomeScreen.css';

const HomeScreen = () => {
  const products = [
    { id: 1, name: 'प्रीमियम विजिटिंग कार्ड', img: '/assets/Card6.png', link: '/visiting-cards' },
    { id: 2, name: 'लूप हैंडल बैग', img: '/assets/Bag5.jpg', link: '/tote-bags' },
    { id: 3, name: 'फ्लेक्स बैनर', img: '/assets/Banner2.png', link: '/flex-banners' },
  ];

  return (
    <div className="homescreen">
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-tag">High-Tech Printing Studio</span>
          <h1>आपका प्रिंटिंग अनुभव अब और भी प्रोफेशनल</h1>
          <p className="hero-sub">अंतरंग मशीनरी, प्रीमियम फिनिश और तेज़ डिलीवरी — एकदम आधुनिक प्रिंटिंग सेवा।</p>
          <div className="hero-actions">
            <Link to="/visiting-cards" className="hero-button">आइए शुरू करें</Link>
            <a href="tel:+919805699966" className="hero-secondary">सीधी कॉल करें</a>
          </div>
          <div className="hero-stats">
            <div>
              <strong>24/7</strong>
              <span>ऑर्डर सपोर्ट</span>
            </div>
            <div>
              <strong>500+</strong>
              <span>प्रोडक्ट्स तैयार</span>
            </div>
            <div>
              <strong>99%</strong>
              <span>ग्राहक संतुष्टि</span>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-products-section">
        <h2>लोकप्रिय प्रोडक्ट्स</h2>
        <div className="product-grid">
          {products.map(product => (
            <Link key={product.id} to={product.link} className="product-card">
              <div className="card-media">
                <img src={product.img} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">₹250+</p>
                <div className="card-actions">
                  <a href="https://wa.me/919805699966" target="_blank" rel="noopener noreferrer" className="whatsapp-link" onClick={(e) => e.stopPropagation()}>💬 WhatsApp</a>
                  <a href="tel:+919805699966" className="call-link" onClick={(e) => e.stopPropagation()}>📞 Call</a>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="why-us-section">
        <h2>क्यों हमें चुनें?</h2>
        <div className="features">
          <div className="feature-card">
            <span className="icon">⚡</span>
            <h4>उन्नत मशीनरी</h4>
            <p>इंडस्ट्री-ग्रेड मशीनें और प्रीमियम प्रिंट टेक्नोलॉजी।</p>
          </div>
          <div className="feature-card">
            <span className="icon">💡</span>
            <h4>इनोवेटिव डिज़ाइन</h4>
            <p>कस्टम प्रोडक्ट्स जो ब्रांड को हाई-एंड दिखाएँ।</p>
          </div>
          <div className="feature-card">
            <span className="icon">🚚</span>
            <h4>फास्ट डिलीवरी</h4>
            <p>तेज़ और विश्वसनीय डिलीवरी पूरे भारत में।</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;

