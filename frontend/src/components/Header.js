import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { itemCount } = useCart();
  const [showAdminLink, setShowAdminLink] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (token && user) {
      try {
        const parsed = JSON.parse(user);
        setShowAdminLink(parsed.role === 'admin');
      } catch {
        setShowAdminLink(false);
      }
    } else {
      setShowAdminLink(false);
    }
  }, []);

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="header-contact">
            <span>📞 +91 98056 99966</span>
            <span>💬 support@cityart.com</span>
          </div>
        </div>
      </div>

      <nav className="navbar">
        <div className="container">
          <div className="logo">
            <Link to="/" className="logo-link">
              <img src="/assets/cityart-logo.jpg" alt="Cityart Printer" className="logo-image" />
              <span className="logo-text">Cityart Printer</span>
            </Link>
          </div>
          <ul className="nav-menu">
            <li><Link to="/">होम</Link></li>
            <li><Link to="/visiting-cards">विजिटिंग कार्ड</Link></li>
            <li><Link to="/tote-bags">लूप हैंडल बैग</Link></li>
            <li><Link to="/flex-banners">फ्लेक्स बैनर</Link></li>
            <li className="cart-link">
              <Link to="/cart">🛒 Cart {itemCount > 0 ? `(${itemCount})` : ''}</Link>
            </li>
            {showAdminLink && (
              <li className="admin-link">
                <Link to="/admin">Admin</Link>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
