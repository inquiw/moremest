import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Destinations from './components/Destinations';
import Experiences from './components/Experiences';
import Footer from './components/Footer';
import SearchResults from './pages/SearchResults';

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
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </div>
  );
};

export default App;
