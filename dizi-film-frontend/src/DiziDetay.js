import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZWQ5YzVhMjU0ZWIwYzFlZjlmN2ZmMTg2NDFiYjA1MiIsIm5iZiI6MTc2Nzk3MDk4OC4wODcwMDAxLCJzdWIiOiI2OTYxMThhY2MxMDJiYTRjMDYzNjQxYmMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.ltW7Hb1e-8K84y2972BAeb8DI7jftNpECJFvAXC4Tno";

function DiziDetay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detay, setDetay] = useState(null);
  const [sezonNo, setSezonNo] = useState(1);
  const [bolumler, setBolumler] = useState([]);

  // Modal ve Yorum State'leri
  const isMovie = window.location.pathname.includes('/film/');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState(null); 
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  // 1. Veri Çekme (Film/Dizi Genel Bilgi)
  useEffect(() => {
    const endpoint = isMovie ? `movie/${id}` : `tv/${id}`;
    axios.get(`https://api.themoviedb.org/3/${endpoint}?language=tr-TR`, {
      headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
    }).then(res => setDetay(res.data));
  }, [id, isMovie]);

  // 2. Veri Çekme (Dizi ise Bölümleri Getir)
  useEffect(() => {
    if (!isMovie && detay) {
      axios.get(`https://api.themoviedb.org/3/tv/${id}/season/${sezonNo}?language=tr-TR`, {
        headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
      }).then(res => setBolumler(res.data.episodes));
    }
  }, [id, sezonNo, isMovie, detay]);

  // 3. Modal açıkken scroll kilitleme
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'auto';
  }, [isModalOpen]);

  // Favori Ekleme Fonksiyonu
  const favoriEkle = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId || userId === "undefined") {
        alert("Oturum hatası. Lütfen çıkış yapıp tekrar giriş yapın.");
        return;
    }
    try {
        const response = await axios.post('http://localhost:5000/api/favorites', {
            user_id: parseInt(userId),
            media_id: id.toString(),
            media_type: isMovie ? 'film' : 'dizi',
            title: detay.title || detay.name,
            poster_path: detay.poster_path
        });
        alert(response.data.message);
    } catch (err) {
        alert(err.response?.data?.error || "Zaten listende veya bir hata oluştu.");
    }
  };

  // Yorum Gönderme Fonksiyonu
  const yorumuGonder = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return alert("Yorum yapmak için giriş yapmalısın!");

    try {
        await axios.post('http://localhost:5000/api/reviews', {
            user_id: userId,
            media_id: id,
            media_type: isMovie ? 'film' : 'dizi',
            media_title: detay.title || detay.name,
            poster_path: detay.poster_path,
            comment: comment,
            rating: rating,
            episode_no: activeEpisode 
        });
        alert("Yorumun başarıyla gönderildi! Profilinde görebilirsin. ❤️");
        setIsModalOpen(false);
        setComment('');
        setRating(5);
    } catch (err) {
        alert("Yorum gönderilirken sunucu hatası oluştu.");
    }
  };

  if (!detay) return <div className="loading">İçerik Yükleniyor...</div>;

  return (
    <div className="detay-sayfasi">
      <button className="back-btn" onClick={() => navigate('/')}>← GERİ DÖN</button>
      
      <div className="detay-header">
        <img src={`https://image.tmdb.org/t/p/w500${detay.poster_path}`} alt={detay.title || detay.name} />
        <div className="detay-yazi">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <h1 className="detay-baslik">{detay.title || detay.name}</h1>
            <button className="yorum-btn" onClick={favoriEkle} style={{ background: '#d81b60', color: 'white' }}>
               ❤️ LİSTEME EKLE
            </button>
          </div>
          <p style={{marginTop: '20px', lineHeight: '1.6'}}>{detay.overview || "Bu içerik için henüz bir açıklama girilmemiş."}</p>
        </div>
      </div>

      {/* DİZİ BÖLÜMÜ */}
      {!isMovie && (
        <>
          <div className="sezon-secici">
            <h3 style={{color: 'white'}}>SEZON SEÇ:</h3>
            {detay.seasons?.filter(s => s.season_number > 0).map(s => (
              <button 
                key={s.id} 
                className={sezonNo === s.season_number ? "active-sezon" : ""}
                onClick={() => setSezonNo(s.season_number)}
              >
                {s.season_number}. Sezon
              </button>
            ))}
          </div>

          <div className="bolum-listesi">
            <h2 style={{color: 'var(--header-pink)'}}>{sezonNo}. Sezon Bölümleri</h2>
            {bolumler.map(b => (
              <div key={b.id} className="bolum-kart">
                <span>Bölüm {b.episode_number}: <b>{b.name}</b></span>
                <button className="yorum-btn" onClick={() => { setActiveEpisode(b.episode_number); setIsModalOpen(true); }}>
                  YORUM YAP
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* FİLM BÖLÜMÜ */}
      {isMovie && (
        <div className="bolum-listesi" style={{textAlign: 'center', padding: '40px'}}>
          <h2 style={{color: 'white'}}>Film Hakkında Ne Düşünüyorsun?</h2>
          <button 
            className="yorum-btn" 
            style={{padding: '15px 40px', fontSize: '1.2rem', marginTop: '20px'}} 
            onClick={() => { setActiveEpisode(null); setIsModalOpen(true); }}
          >
            ✍️ FİLME YORUM YAP
          </button>
        </div>
      )}

      {/* --- YORUM MODAL (PENCERE) --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{color: 'var(--header-pink)', marginBottom: '10px'}}>Düşüncelerini Paylaş</h2>
            <p style={{color: 'rgba(255,255,255,0.7)', marginBottom: '20px'}}>
               {detay.title || detay.name} {activeEpisode ? `- Bölüm ${activeEpisode}` : ""}
            </p>
            
            <div style={{marginBottom: '20px', textAlign: 'left'}}>
              <label style={{color: 'white', marginRight: '15px'}}>Puan Ver:</label>
              <select className="rating-select" value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
                {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Yıldız</option>)}
              </select>
            </div>

            <textarea 
              placeholder="Sence nasıldı? (Spoiler vermemeye dikkat et!)" 
              value={comment} 
              onChange={(e) => setComment(e.target.value)}
              style={{
                  width: '100%', 
                  height: '120px', 
                  marginBottom: '20px', 
                  padding: '12px', 
                  borderRadius: '10px',
                  background: '#1a1a1a',
                  color: 'white',
                  border: '1px solid #333'
              }}
            />

            <div style={{display: 'flex', gap: '15px', justifyContent: 'center'}}>
              <button className="yorum-btn" onClick={yorumuGonder} style={{padding: '10px 30px'}}>GÖNDER</button>
              <button className="back-btn" style={{background: '#444'}} onClick={() => setIsModalOpen(false)}>İPTAL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiziDetay;