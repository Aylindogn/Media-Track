import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profil() {
  const [favoriler, setFavoriler] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('film'); // Varsayılan olarak filmleri göster
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

      {/* --- PROFİL ÜST KART (Alex Rivera Tarzı) --- */}
      <div className="profile-header-card">
        <div className="profile-avatar" style={{ 
          width: '120px', height: '120px', borderRadius: '50%', 
          background: 'linear-gradient(45deg, var(--header-pink), #ad1457)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3rem' 
        }}>
          {username?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800' }}>{username?.toUpperCase()} KOLEKSİYONU</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: '5px' }}>Movie Enthusiast & Critic • Since 2026</p>
          <div style={{ display: 'flex', gap: '40px', marginTop: '20px', alignItems: 'center' }}>
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--header-pink)' }}>{favoriler.length}</div>
    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>MOVIES WATCHED</div>
  </div>
  
  <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }}></div>
  
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--header-pink)' }}>{reviews.length}</div>
    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>REVIEWS</div>
  </div>
</div>
        </div>
        <button className="btn-primary" onClick={() => alert("Profil düzenleme yakında!")}>Edit Profile</button>
      </div>

      {/* --- SPOTLIGHT BANNER (Yeni Büyük Görünüm) --- */}
      {spotlightOlanlar.length > 0 && (
        <div className="spotlight-banner">
          <img 
            src={`https://image.tmdb.org/t/p/original${spotlightOlanlar[0].poster_path}`} 
            alt="spotlight"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.4' }}
          />
          <div className="spotlight-overlay">
            <span style={{ color: 'var(--header-pink)', fontWeight: 'bold', letterSpacing: '2px', fontSize: '0.8rem' }}>TRENDING IN YOUR LIST</span>
            <h2 style={{ fontSize: '3.5rem', margin: '10px 0', fontWeight: '900' }}>{spotlightOlanlar[0].title}</h2>
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <button className="btn-primary" onClick={() => navigate(`/${spotlightOlanlar[0].media_type}/${spotlightOlanlar[0].media_id}`)}>
                DETAYLARA GİT
              </button>
              <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }}>
                + LİSTEYE EKLE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- REVIEWS GRID (Yorumlar) --- */}
      <div className="section-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 className="section-title">LATEST REVIEWS</h2>
          <button className="back-btn" onClick={() => navigate('/all-reviews')} style={{fontSize: '0.8rem'}}>TÜMÜNÜ GÖR →</button>
        </div>

        <div className="reviews-grid">
          {reviews.slice(0, 4).map(rev => (
            <div key={rev.id} className="review-horizontal-card">
              <img 
                src={`https://image.tmdb.org/t/p/w200${rev.poster_path}`} 
                alt={rev.media_title} 
                onClick={() => navigate(`/${rev.media_type}/${rev.media_id}`)}
              />
              <div className="review-content">
                <h4 style={{ fontSize: '1.2rem', marginBottom: '5px', color: 'white' }}>{rev.media_title}</h4>
                <div className="rating" style={{ color: '#ffcc00', marginBottom: '10px' }}>
                  {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                </div>
                <p style={{ fontStyle: 'italic', color: 'var(--text-dim)', fontSize: '0.9rem' }}>"{rev.comment}"</p>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <p className="glass-panel">Henüz yorum yapılmamış.</p>}
        </div>
      </div>

      {/* --- SEÇİM VE ARŞİV --- */}
      <div className="section-container" style={{marginTop: '60px'}}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '40px' }}>
          <div className={`genre-item ${activeTab === 'film' ? 'active-genre' : ''}`} 
               onClick={() => setActiveTab('film')}
               style={{ border: activeTab === 'film' ? '1px solid var(--header-pink)' : '1px solid var(--glass-border)', width: '200px' }}>
            <span style={{fontSize: '2rem'}}>🎬</span>
            <h3>FİLMLER</h3>
          </div>
          <div className={`genre-item ${activeTab === 'dizi' ? 'active-genre' : ''}`} 
               onClick={() => setActiveTab('dizi')}
               style={{ border: activeTab === 'dizi' ? '1px solid var(--header-pink)' : '1px solid var(--glass-border)', width: '200px' }}>
            <span style={{fontSize: '2rem'}}>📺</span>
            <h3>DİZİLER</h3>
          </div>
        </div>

        <h2 className="section-title">{activeTab === 'film' ? "SİNEMA ARŞİVİM" : "DİZİ ARŞİVİM"}</h2>
        <div className="horizontal-scroll">
          {filtrelenmişFavoriler.map(fav => (
            <div key={fav.id} className="movie-card">
              <img 
                src={`https://image.tmdb.org/t/p/w500${fav.poster_path}`} 
                alt={fav.title} 
                onClick={() => navigate(`/${fav.media_type}/${fav.media_id}`)} 
              />
              <div className="movie-info">
                <h3 title={fav.title}>{fav.title}</h3>
                <button className="btn-primary" onClick={() => toggleSpotlight(fav)} style={{ fontSize: '0.6rem', padding: '5px', width: '100%', marginBottom: '5px' }}>
                  {fav.is_spotlight ? '★ ÖNE ÇIKARILDI' : '☆ ÖNE ÇIKAR'}
                </button>
                <button className="back-btn" style={{ fontSize: '0.6rem', padding: '5px', width: '100%', color: '#ff4444' }} onClick={() => favoriSil(fav.id)}>
                  LİSTEDEN KALDIR
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profil;