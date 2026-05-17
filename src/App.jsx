import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Destinations from './components/Destinations';
import Experiences from './components/Experiences';
import Footer from './components/Footer';
import SearchResults from './pages/SearchResults';
import Profile from './pages/Profile';
import PropertyDetail from './pages/PropertyDetail';
import Hosts from './pages/Hosts';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';

const Home = () => (
  <>
    <Header />
    <Hero />
    <Destinations />
    <Experiences />
    <Footer />
  </>
);

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1f] via-[#111114] to-[#0a0a0c]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/hosts" element={<Hosts />} />
        <Route path="/add-property" element={<AddProperty />} />
        <Route path="/edit-property/:id" element={<EditProperty />} />
      </Routes>
    </div>
  );
};

export default App;
