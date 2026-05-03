import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Cityart Printer</h4>
          <p>उच्च गुणवत्ता वाली प्रिंटिंग सेवाएँ</p>
        </div>
        <div className="footer-section">
          <h4>त्वरित लिंक</h4>
          <ul>
            <li><a href="/">होम</a></li>
            <li><a href="/about">हमारे बारे में</a></li>
            <li><a href="/contact">संपर्क करें</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>संपर्क करें</h4>
          <p>📞 +91-9876543210</p>
          <p>💬 WhatsApp करें</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Cityart Printer. सभी अधिकार सुरक्षित।</p>
      </div>
    </footer>
  );
};

export default Footer;
