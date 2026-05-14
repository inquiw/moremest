import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Collections from './components/Collections';
import Experiences from './components/Experiences';
import Footer from './components/Footer';

const App = () => {
  return (
    <div className="min-h-screen bg-sand-50">
      <Header />
      <Hero />
      <Collections />
      <Experiences />
      <Footer />
    </div>
  );
};

export default App;
