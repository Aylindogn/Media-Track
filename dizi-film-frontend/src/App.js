import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AnaSayfa from './AnaSayfa';
import DiziDetay from './DiziDetay';
import './App.css';
import Login from './Login';
import Register from './Register';
import Profil from './Profil';
import AllReviews from './AlllReviews';
import GenrePage from './GenrePage'; // Dosya isminin doğru olduğundan emin ol
import PopularPage from './PopularPage'; // En üste ekle

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AnaSayfa />} />
          {/* Hem film hem dizi için aynı detay sayfasını kullanıyoruz */}
          <Route path="/dizi/:id" element={<DiziDetay />} />
          <Route path="/film/:id" element={<DiziDetay />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/all-reviews" element={<AllReviews />} />
          <Route path="/genre/:id/:name" element={<GenrePage />} />
          <Route path="/popular/:type" element={<PopularPage />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;