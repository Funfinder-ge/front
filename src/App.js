import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Container from '@mui/material/Container';
import { Home } from "./pages/home/Home";
import { About } from "./pages/about/About";
import Movies from "./pages/movies/Movies";
import MovieDetails from "./pages/movies/MovieDetails";
import Tickets from "./pages/tickets/Tickets";
import IMAX from "./pages/imax/IMAX";
import Restrictions from "./pages/restrictions/Restrictions";
import Contact from "./pages/contact/Contact";
import Cinemas from "./pages/cinemas/Cinemas";
import AppInfo from "./pages/app/AppInfo";
import Rules from "./pages/rules/Rules";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/profile/Profile";
import Footer from "./layout/Footer";
import Parachute from './pages/parachute/Parachute';
import Yacht from './pages/yacht/Yacht';
import Rafting from './pages/rafting/Rafting';
import SeaMoto from './pages/sea-moto/SeaMoto';
import SeaOther from './pages/sea-other/SeaOther';
import NewPage from './pages/new';
import Sidebar from './layout/Sidebar';

// API Example Component
import ApiExample from './components/ApiExample';

// New Entertainment Pages
import WaterActivities from './pages/activities/WaterActivities';
import LandActivities from './pages/activities/LandActivities';
import EntertainmentActivities from './pages/activities/EntertainmentActivities';
import AdventureActivities from './pages/activities/AdventureActivities';
import CulturalActivities from './pages/activities/CulturalActivities';
import BookingHistory from './pages/booking/BookingHistory';
import ActivityDetails from './pages/activities/ActivityDetails';
import Taxi from './pages/taxi/Taxi';
import MapDemo from './pages/map/MapDemo';
import PaymentPage from './pages/payment/Payment';
import PaymentSuccess from './pages/payment/PaymentSuccess';
import PaymentFailed from './pages/payment/PaymentFailed';
import ClaudeChatBot from './components/ClaudeChatBot';

// Land Activity Specific Pages
import QuadTours from './pages/activities/QuadTours';
import MotoTours from './pages/activities/MotoTours';
import JeepTours from './pages/activities/JeepTours';
import Bicycles from './pages/activities/Bicycles';
import Hiking from './pages/activities/Hiking';

function App() {
  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Container maxWidth="lg" sx={{ mt: { xs: 1, md: 4 }, mb: 4, pt: { xs: 1, md: 0 } }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/:id" element={<MovieDetails />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/imax" element={<IMAX />} />
            <Route path="/restrictions" element={<Restrictions />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cinemas" element={<Cinemas />} />
            <Route path="/app" element={<AppInfo />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Sea Activities */}
            <Route path="/parachute" element={<Parachute />} />
            <Route path="/yacht" element={<Yacht />} />
            <Route path="/rafting" element={<Rafting />} />
            <Route path="/sea-moto" element={<SeaMoto />} />
            <Route path="/sea-other" element={<SeaOther />} />
            
            {/* New Entertainment Pages */}
            <Route path="/water-activities" element={<WaterActivities />} />
            <Route path="/land-activities" element={<LandActivities />} />
            <Route path="/entertainment-activities" element={<EntertainmentActivities />} />
            <Route path="/adventure-activities" element={<AdventureActivities />} />
            <Route path="/cultural-activities" element={<CulturalActivities />} />
            <Route path="/activity/:id" element={<ActivityDetails />} />
            <Route path="/booking-history" element={<BookingHistory />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
            <Route path="/taxi" element={<Taxi />} />
            <Route path="/map-demo" element={<MapDemo />} />
            
            {/* Land Activity Specific Routes */}
            <Route path="/quad-tours" element={<QuadTours />} />
            <Route path="/moto-tours" element={<MotoTours />} />
            <Route path="/jeep-tours" element={<JeepTours />} />
            <Route path="/bicycles" element={<Bicycles />} />
            <Route path="/hiking" element={<Hiking />} />
            
            <Route path="/api-example" element={<ApiExample />} />
            <Route path="/new" element={<NewPage />} />
          </Routes>
        </Container>
        <Footer />
      </div>
      <ClaudeChatBot />
    </>
  );
}

export default App;
