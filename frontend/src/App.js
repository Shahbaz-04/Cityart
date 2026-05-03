import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './HomeScreen';
import VisitingCards from './pages/VisitingCards';
import ToteBags from './pages/ToteBags';
import FlexBanners from './pages/FlexBanners';
import Admin from './pages/Admin';
import './App.css';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import CardDetails from './pages/CardDetails';
import BagDetail from './pages/BagDetail';
import BannerDetail from './pages/BannerDetail';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';

// 2. (गलत) 'pages.css' को यहाँ import करने की ज़रूरत नहीं है, इसे pages फोल्डर के अंदर करें
// import '../pages.css'; 

// 3. (गलत) यह डुप्लीकेट import था, इसे हटा दिया गया है
// import CardDetails from './pages/CardDetails'; s

function App() {
  return (
    <Router>
      <CartProvider>
        <Header />
        <div className="App">
          <main className="main-content">
            <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/visiting-cards" element={<VisitingCards />} />
            <Route path="/tote-bags" element={<ToteBags />} />
            <Route path="/flex-banners" element={<FlexBanners />} />
            <Route path="/invitation-cards" element={<VisitingCards />} />
            <Route path="/greeting-cards" element={<VisitingCards />} />
            <Route path="/posters" element={<FlexBanners />} />
            <Route path="/banners" element={<FlexBanners />} /> 
            
            
            
            {/* यह डायनामिक रूट है जो हर कार्ड के लिए काम करेगा */}
            <Route path="/visiting-card/:id" element={<CardDetails />} />
            <Route path="/bag/:id" element={<BagDetail />} /> {/* बैग डिटेल पेज के लिए नया रूट */}
            <Route path="/banner/:id" element={<BannerDetail />} /> {/* फ्लेक्स बैनर डिटेल */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/admin" element={<Admin />} />
            
            </Routes>
          </main>
        </div>
        <Footer />
      </CartProvider>
    </Router>
  );
}

export default App;