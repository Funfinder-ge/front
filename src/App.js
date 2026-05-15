import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from './config/googleAuth';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { GuideProvider } from './contexts/GuideContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Home } from "./pages/home/Home";
import { About } from "./pages/about/About";
import Tickets from "./pages/tickets/Tickets";
import Restrictions from "./pages/restrictions/Restrictions";
import Contact from "./pages/contact/Contact";
import Rules from "./pages/rules/Rules";
import Privacy from "./pages/privacy/Privacy";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/profile/Profile";
import Footer from "./layout/Footer";
import Sidebar from './layout/Sidebar';

// API Example Component
import ApiExample from './components/ApiExample';

// New Entertainment Pages
import BookingHistory from './pages/booking/BookingHistory';
import ActivityDetails from './pages/activities/ActivityDetails';
import MapDemo from './pages/map/MapDemo';
import PaymentPage from './pages/payment/Payment';
import PaymentStatus from './pages/payment/PaymentStatus';
import CurrencyToggle from './components/CurrencyToggle';
import AccessibilityPanel from './components/AccessibilityPanel';
import ScrollToTop from './components/ScrollToTop';
import ScrollProgressBar from './components/ScrollProgressBar';
import OrbitalFab from './components/OrbitalFab';
import GooglePayTest from './pages/payment/GooglePayTest';

// Land Activity Specific Pages
import LandActivities from './pages/activities/land/LandActivities';
import QuadTours from './pages/activities/land/QuadTours';
import MotoTours from './pages/activities/land/MotoTours';
import JeepTours from './pages/activities/land/JeepTours';
import Bicycles from './pages/activities/land/Bicycles';
import Hiking from './pages/activities/land/Hiking';


import WaterActivities from './pages/activities/water/WaterActivities';
import Parachute from './pages/activities/water/Parachute';
import Yacht from './pages/activities/water/Yacht';
import Rafting from './pages/activities/water/Rafting';
import SeaMoto from './pages/activities/water/SeaMoto';
import SeaOther from './pages/activities/water/SeaOther';
import NearbyActivities from './pages/activities/NearbyActivities';
import CategoryPage from './pages/activities/CategoryPage';


function App() {
  const clientId = GOOGLE_CLIENT_ID || "333647909738-mk7oujo9rhbji5dpgdu4okh49ue2r3ba.apps.googleusercontent.com";
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LanguageProvider>
        <CurrencyProvider>
          <GuideProvider>
            <Sidebar />
            <div className="main-content" style={{fontFamily:"nino-herv!important"}}>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/restrictions" element={<Restrictions />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/privacy-policy" element={<Privacy />} />
              <Route path="/terms" element={<Rules />} />
              <Route path="/terms-of-service" element={<Rules />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* New Entertainment Pages */}
              <Route path="/activity/:id" element={<ActivityDetails />} />
              <Route path="/booking-history" element={<BookingHistory />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/payment/status/:orderNumber" element={<PaymentStatus />} />
              <Route path="/map-demo" element={<MapDemo />} />
              
              {/* Water Activities */}
              <Route path="/water-activities" element={<WaterActivities />} />
              <Route path="/parachute" element={<Parachute />} />
              <Route path="/yacht" element={<Yacht />} />
              <Route path="/rafting" element={<Rafting />} />
              <Route path="/sea-moto" element={<SeaMoto />} />
              <Route path="/sea-other" element={<SeaOther />} />
              
              {/* Dynamic Category Route */}
              <Route path="/category/:categoryId" element={<CategoryPage />} />

              {/* Land Activities */}
              <Route path="/land-activities" element={<LandActivities />} />
              <Route path="/quad-tours" element={<QuadTours />} />
              <Route path="/moto-tours" element={<MotoTours />} />
              <Route path="/jeep-tours" element={<JeepTours />} />
              <Route path="/bicycles" element={<Bicycles />} />
              <Route path="/hiking" element={<Hiking />} />
              
                {/* Nearby Activities */}
                <Route path="/nearby-activities" element={<NearbyActivities />} />
                
                <Route path="/api-example" element={<ApiExample />} />
                <Route path="/google-pay-test" element={<GooglePayTest />} />
              </Routes>
            <Footer />
            </div>
            <ScrollProgressBar />
            <CurrencyToggle />
            <AccessibilityPanel />
            <ScrollToTop />
            <OrbitalFab />
          </GuideProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
