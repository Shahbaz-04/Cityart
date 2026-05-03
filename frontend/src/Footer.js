import React from 'react';
import './Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h3>प्रिंटिंग शॉप</h3>
          <p>
            हम आपकी सभी प्रिंटिंग ज़रूरतों के लिए वन-स्टॉप समाधान हैं। गुणवत्ता और ग्राहक संतुष्टि हमारी प्राथमिकता है।
          </p>
        </div>
        <div className="footer-section links">
          <h3>क्विक लिंक्स</h3>
          <ul>
            <li><a href="/">होम</a></li>
            <li><a href="/products">प्रोडक्ट्स</a></li>
            <li><a href="/about">हमारे बारे में</a></li>
            <li><a href="/contact">संपर्क करें</a></li>
          </ul>
        </div>
        <div className="footer-section social">
          <h3>हमसे जुड़ें</h3>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faFacebook} /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faInstagram} /></a>
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faWhatsapp} /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} प्रिंटिंग शॉप | सर्वाधिकार सुरक्षित
      </div>
    </footer>
  );
};

export default Footer;

