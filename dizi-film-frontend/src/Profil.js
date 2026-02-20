import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profil() {
  const [favoriler, setFavoriler] = useState([]);
  const [reviews, setReviews] = useState([]); // Yorumlar için state
  const [activeTab, setActiveTab] = useState(''); 
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (userId) {
      favoriGetir();
      reviewGetir();
    }
  }, [userId]);

  const favoriGetir = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/favorites/${userId}`);
      setFavoriler(res.data);
    } catch (err) {
      console.error("Favoriler yüklenemedi", err);
    }
  };

  const reviewGetir = async () => {
    try {
      // Backend'de bu rotanın olduğundan emin ol
      const res = await axios.get(`http://localhost:5000/api/reviews/user/${userId}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Yorumlar yüklenemedi", err);
    }
  };

  const favoriSil = async (id) => {
    if (window.confirm("Listeden çıkarmak istediğine emin misin?")) {
      try {
        await axios.delete(`http://localhost:5000/api/favorites/${id}`);
        setFavoriler(favoriler.filter(f => f.id !== id));
      } catch (err) {
        alert("Silme işlemi başarısız.");
      }
    }
  };

  const toggleSpotlight = async (fav) => {
    try {
        await axios.put(`http://localhost:5000/api/favorites/spotlight/${fav.id}`, {
            is_spotlight: !fav.is_spotlight,
            user_id: userId,
            media_type: fav.media_type
        });
        favoriGetir();
    } catch (err) {
        alert("Spotlight güncellenemedi.");
    }
  };

  const filtrelenmişFavoriler = favoriler.filter(f => f.media_type === activeTab);
  const spotlightOlanlar = favoriler.filter(f => f.is_spotlight);

  return (
    <div className="container">
      <button className="back-btn" onClick={() => navigate('/')}>← ANA SAYFA</button>

      {/* --- SPOTLIGHT (ÖNE ÇIKANLAR) --- */}
      {spotlightOlanlar.length > 0 && (
        <div className="spotlight-section" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '40px', 
            margin: '40px 0',
            padding: '20px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '20px'
        }}>
            {spotlightOlanlar.map(spot => (
                <div key={spot.id} style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--header-pink)', fontWeight: 'bold', marginBottom: '10px', fontSize: '0.8rem' }}>
                        FAVORİ {spot.media_type === 'film' ? 'FİLMİM' : 'DİZİM'}
                    </p>
                    <img 
                        src={`https://image.tmdb.org/t/p/w500${spot.poster_path}`} 
                        alt={spot.title}
                        style={{ 
                            width: '180px', 
                            borderRadius: '15px', 
                            border: '4px solid var(--header-pink)', 
                            boxShadow: '0 0 20px rgba(216, 27, 96, 0.5)',
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/${spot.media_type}/${spot.media_id}`)}
                    />
                    <h3 style={{ fontSize: '1rem', marginTop: '10px', maxWidth: '180px', color: 'white' }}>{spot.title}</h3>
                </div>
            ))}
        </div>
      )}
      
      <div className="section-container" style={{textAlign: 'center', marginTop: '20px'}}>
        <h1 className="detay-baslik" style={{fontSize: '2.5rem'}}>{username?.toUpperCase()} KOLEKSİYONU</h1>
        
        {/* --- REVIEWS ÖZET BÖLÜMÜ --- */}
        <div className="section-container" style={{ textAlign: 'left', marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
            <h2 className="section-title" style={{ margin: 0, border: 'none' }}>REVIEWS</h2>
            <button className="back-btn" onClick={() => navigate('/all-reviews')} style={{ fontSize: '0.8rem', padding: '5px 15px' }}>
              TÜMÜNÜ GÖR →
            </button>
          </div>

          <div className="reviews-list">
            {reviews.slice(0, 4).map(rev => (
              <div key={rev.id} className="review-horizontal-card">
                <img 
                  src={`https://image.tmdb.org/t/p/w200${rev.poster_path}`} 
                  alt={rev.media_title} 
                  onClick={() => navigate(`/${rev.media_type}/${rev.media_id}`)}
                />
                <div className="review-content">
                  <h4 style={{ color: 'white', margin: '0 0 5px 0' }}>{rev.media_title}</h4>
                  <div className="rating" style={{ color: '#ffcc00', marginBottom: '5px' }}>
                    {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                  </div>
                  <p style={{ color: '#ccc', fontSize: '0.9rem', fontStyle: 'italic' }}>"{rev.comment}"</p>
                </div>
              </div>
            ))}
            {reviews.length === 0 && <p style={{ color: 'rgba(255,255,255,0.5)' }}>Henüz yorum yapılmamış.</p>}
          </div>
        </div>

        {/* --- SEÇİM BUTONLARI --- */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', margin: '60px 0 40px 0' }}>
          <div onClick={() => setActiveTab('film')} style={{ cursor: 'pointer', padding: '20px', border: `3px solid ${activeTab === 'film' ? '#d81b60' : 'white'}`, borderRadius: '20px', background: 'rgba(0,0,0,0.3)', transition: '0.3s', width: '200px' }}>
            <span style={{fontSize: '3rem'}}>🎬</span>
            <h3 style={{color: 'white', marginTop: '10px'}}>FAVORİ FİLMLERİM</h3>
          </div>
          <div onClick={() => setActiveTab('dizi')} style={{ cursor: 'pointer', padding: '20px', border: `3px solid ${activeTab === 'dizi' ? '#d81b60' : 'white'}`, borderRadius: '20px', background: 'rgba(0,0,0,0.3)', transition: '0.3s', width: '200px' }}>
            <span style={{fontSize: '3rem'}}>📺</span>
            <h3 style={{color: 'white', marginTop: '10px'}}>FAVORİ DİZİLERİM</h3>
          </div>
        </div>

        {/* --- LİSTE ALANI --- */}
        {activeTab && (
          <div style={{marginTop: '50px'}}>
            <h2 className="section-title" style={{ textAlign: 'left' }}>
              {activeTab === 'film' ? "SİNEMA ARŞİVİM" : "DİZİ ARŞİVİM"}
            </h2>
            <div className="horizontal-scroll" style={{padding: '20px 0'}}>
              {filtrelenmişFavoriler.map(fav => (
                <div key={fav.id} className="movie-card scroll-item">
                  <img src={`https://image.tmdb.org/t/p/w500${fav.poster_path}`} alt={fav.title} onClick={() => navigate(`/${fav.media_type}/${fav.media_id}`)} />
                  <div className="movie-info">
                    <h3 title={fav.title} style={{fontSize: '0.9rem'}}>{fav.title}</h3>
                    <button onClick={() => toggleSpotlight(fav)} style={{ background: fav.is_spotlight ? '#d81b60' : 'transparent', border: '1px solid #d81b60', color: 'white', fontSize: '0.7rem', cursor: 'pointer', padding: '6px', width: '100%', marginTop: '8px', borderRadius: '5px', fontWeight: 'bold' }}>
                      {fav.is_spotlight ? '★ ÖNE ÇIKARILDI' : '☆ ÖNE ÇIKAR'}
                    </button>
                    <button className="yorum-btn" style={{background: 'black', color: '#ff4444', fontSize: '0.7rem', width: '100%', marginTop: '5px', border: '1px solid #333'}} onClick={() => favoriSil(fav.id)}>
                      LİSTEDEN KALDIR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profil;