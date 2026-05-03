// यह src/pages/CardDetails.js का पूरा कोड है
    
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import '../pages/pages.css'; // (यह सही है - '..' मतलब एक फोल्डर बाहर जाओ, फिर 'pages' में जाओ)// (सही पाथ './pages.css')

// डेटा हमें यहाँ फिर से चाहिए ताकि हम ID से सही कार्ड ढूँढ सकें
const cardsData = [
  { id: 1, name: 'Matte Finish Visiting Card', price: '₹250', img: '/assets/matte-card.png', desc: 'प्रोफेशनल और मॉडर्न लुक के लिए नॉन-शाइनी मैट फ़िनिश कार्ड।' },
  { id: 2, name: 'Glossy Finish Visiting Card', price: '₹300', img: '/assets/glossy-card.png', desc: 'चमकदार ग्लॉसी फ़िनिश जो आपके रंगों को वाइब्रेंट दिखाती है।' },
  { id: 3, name: 'Luxury Texture Card', price: '₹500', img: '/assets/luxury-card.png', desc: 'एक हाई-एंड फील के लिए प्रीमियम टेक्सचर्ड पेपर।' },
  { id: 4, name: 'Eco-friendly Card', price: '₹200', img: '/assets/eco-friendly-card.png', desc: '100% रीसायकल मटेरियल से बना, पर्यावरण के लिए बेहतर।' },
  { id: 5, name: 'Premium Silk Card', price: '₹450', img: '/assets/silk-card.png', desc: 'यूनिक और शानदार टच के लिए स्मूथ सिल्क लैमिनेशन।' },
  { id: 6, name: 'Spot UV Card', price: '₹350', img: '/assets/spot-uv-card.png', desc: 'अपने लोगो या नाम को शाइनी स्पॉट UV से हाईलाइट करें।' },
  { id: 7, name: 'Embossed Card', price: '₹600', img: '/assets/embossed-card.png', desc: 'क्लासिक फील के लिए उभरी हुई (raised) प्रिंटिंग।' },
  { id: 8, name: 'Die-cut Card', price: '₹700', img: '/assets/die-cut-card.png', desc: 'कस्टम शेप में कटे हुए कार्ड जो आपको सबसे अलग दिखाते हैं।' },
  { id: 9, name: 'Card Design 9', price: '₹270', img: '/assets/Card1.png', desc: 'एक और आकर्षक कार्ड डिज़ाइन।' },
  { id: 10, name: 'Card Design 10', price: '₹320', img: '/assets/Card10.jpeg', desc: 'एक और शानदार कार्ड डिज़ाइन।' },
  { id: 11, name: 'Card Design 11', price: '₹400', img: '/assets/Card11.jpeg', desc: 'एक और प्रीमियम कार्ड डिज़ाइन।' },
  { id: 12, name: 'Card Design 12', price: '₹350', img: '/assets/Card12.jpeg', desc: 'एक और यूनिक कार्ड डिज़ाइन।' },
  { id: 13, name: 'Card Design 13', price: '₹300', img: '/assets/Card13.jpeg', desc: 'एक और आकर्षक कार्ड डिज़ाइन।' },
  { id: 14, name: 'Card Design 14', price: '₹450', img: '/assets/Card14.jpeg', desc: 'एक और शानदार कार्ड डिज़ाइन।' },
  { id: 15, name: 'Card Design 15', price: '₹500', img: '/assets/Card15.jpeg', desc: 'एक और प्रीमियम कार्ड डिज़ाइन।' },
];

const CardDetails = () => {
  const { id } = useParams();
  const card = cardsData.find(c => c.id === parseInt(id));

  if (!card) {
    return (
      <div className="page-container">
        <h2>प्रोडक्ट नहीं मिला</h2>
        <Link to="/visiting-cards" className="back-link">कलेक्शन पर वापस जाएँ</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link to="/visiting-cards" className="back-link">← कलेक्शन पर वापस जाएँ</Link>
      <div className="card-details-container">
        <div className="details-img-container">
          <img src={card.img} alt={card.name} className="details-img" />
        </div>
        <div className="details-info">
          <h1>{card.name}</h1>
          <p className="details-price">{card.price}</p>
          <p className="details-desc">{card.desc}</p>
          <button className="add-to-cart-btn">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default CardDetails;