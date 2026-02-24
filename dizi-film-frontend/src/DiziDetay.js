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

  const isMovie = window.location.pathname.includes('/film/');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState(null); 
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const endpoint = isMovie ? `movie/${id}` : `tv/${id}`;
    axios.get(`https://api.themoviedb.org/3/${endpoint}?language=tr-TR`, {
      headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
    }).then(res => setDetay(res.data));
  }, [id, isMovie]);

  useEffect(() => {
    if (!isMovie && detay) {
      axios.get(`https://api.themoviedb.org/3/tv/${id}/season/${sezonNo}?language=tr-TR`, {
        headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
      }).then(res => setBolumler(res.data.episodes));
    }
  }, [id, sezonNo, isMovie, detay]);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'auto';
  }, [isModalOpen]);

  const favoriEkle = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId || userId === "undefined") {
        alert("Oturum hatası. Lütfen tekrar giriş yapın.");
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
        alert("Zaten listende veya bir hata oluştu.");
    }
  };

  const yorumuGonder = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return alert("Giriş yapmalısın!");

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
        alert("Yorumun gönderildi! ❤️");
        setIsModalOpen(false);
        setComment('');
    } catch (err) {
        alert("Sunucu hatası oluştu.");
    }
  };

  if (!detay) return <div className="loading">Yükleniyor...</div>;

  return (
    <div className="container" style={{paddingTop: '40px'}}>
      <button className="back-btn" onClick={() => navigate(-1)}>← GERİ GİT</button>
      
      {/* HEADER ALANI - Banner Tarzı */}
      <div className="profile-header-card" style={{flexDirection: 'column', alignItems: 'flex-start', position: 'relative', overflow: 'hidden'}}>
        {/* Arka plan için bulanık büyük afiş */}
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundImage: `url(https://image.tmdb.org/t/p/original${detay.backdrop_path})`,
            backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.1, zIndex: 0
        }}></div>

        <div style={{display: 'flex', gap: '40px', zIndex: 1, width: '100%', flexWrap: 'wrap'}}>
            <img 
                src={`https://image.tmdb.org/t/p/w500${detay.poster_path}`} 
                alt={detay.title || detay.name} 
                style={{width: '240px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)'}}
            />
            <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                <span style={{color: 'var(--header-pink)', fontWeight: 'bold', letterSpacing: '2px', fontSize: '0.8rem'}}>
                    {isMovie ? 'FEATURE FILM' : 'TV SERIES'}
                </span>
                <h1 style={{fontSize: '3.5rem', fontWeight: '900', margin: '10px 0', lineHeight: '1.1'}}>{detay.title || detay.name}</h1>
                <div style={{display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px'}}>
                    <span style={{color: '#ffcc00', fontSize: '1.2rem'}}>★ {detay.vote_average?.toFixed(1)}</span>
                    <span style={{color: 'var(--text-dim)'}}>{detay.release_date || detay.first_air_date}</span>
                </div>
                <p style={{color: 'var(--text-dim)', lineHeight: '1.6', maxWidth: '800px'}}>{detay.overview}</p>
                
                <div style={{marginTop: '30px', display: 'flex', gap: '15px'}}>
                    <button className="btn-primary" onClick={favoriEkle}>❤️ LİSTEME EKLE</button>
                    <button className="back-btn" style={{marginBottom: 0}} onClick={() => window.scrollTo({top: 600, behavior: 'smooth'})}>
                        {isMovie ? 'YORUMLARI GÖR' : 'BÖLÜMLERİ GÖR'}
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* DİZİ SEZON/BÖLÜM ALANI */}
      {!isMovie && (
        <div className="section-container" style={{marginTop: '60px'}}>
          <h2 className="section-title">SEASONS</h2>
          <div className="genre-container" style={{justifyContent: 'flex-start', marginBottom: '40px'}}>
            {detay.seasons?.filter(s => s.season_number > 0).map(s => (
              <div 
                key={s.id} 
                className={`genre-item ${sezonNo === s.season_number ? 'active-genre' : ''}`}
                onClick={() => setSezonNo(s.season_number)}
                style={{
                    padding: '12px 25px', cursor: 'pointer',
                    border: sezonNo === s.season_number ? '1px solid var(--header-pink)' : '1px solid var(--glass-border)',
                    background: sezonNo === s.season_number ? 'rgba(216, 27, 96, 0.1)' : 'var(--glass-bg)'
                }}
              >
                {s.season_number}. SEZON
              </div>
            ))}
          </div>

          <div className="reviews-grid">
            {bolumler.map(b => (
              <div key={b.id} className="review-horizontal-card" style={{alignItems: 'center'}}>
                <div style={{
                    width: '50px', height: '50px', borderRadius: '12px', background: 'var(--glass-bg)', 
                    display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold'
                }}>
                    {b.episode_number}
                </div>
                <div className="review-content">
                  <h4 style={{margin: 0}}>{b.name}</h4>
                  <p style={{margin: '5px 0 0 0', fontSize: '0.8rem', color: 'var(--text-dim)'}}>{b.air_date} • {b.runtime} dk</p>
                </div>
                <button className="btn-primary" style={{padding: '8px 20px', fontSize: '0.7rem'}} onClick={() => { setActiveEpisode(b.episode_number); setIsModalOpen(true); }}>
                  YORUM YAP
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FİLM YORUM ALANI */}
      {isMovie && (
        <div style={{textAlign: 'center', padding: '100px 0'}}>
            <h2 style={{fontSize: '2rem', marginBottom: '20px'}}>Bu film hakkında ne düşünüyorsun?</h2>
            <button className="btn-primary" style={{padding: '20px 60px'}} onClick={() => { setActiveEpisode(null); setIsModalOpen(true); }}>
                ✍️ FİKİRLERİNİ PAYLAŞ
            </button>
        </div>
      )}

      {/* --- YORUM MODAL --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{padding: '40px'}}>
            <h2 style={{color: 'var(--header-pink)', fontSize: '2rem', marginBottom: '10px'}}>Eleştirini Yaz</h2>
            <p style={{color: 'var(--text-dim)', marginBottom: '30px'}}>
               {detay.title || detay.name} {activeEpisode ? `• Bölüm ${activeEpisode}` : ""}
            </p>
            
            <div style={{marginBottom: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px'}}>
              <label>Puanın:</label>
              <select className="search-input" style={{width: 'auto'}} value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
                {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Yıldız</option>)}
              </select>
            </div>

            <textarea 
              placeholder="Düşüncelerin neler?..." 
              value={comment} 
              onChange={(e) => setComment(e.target.value)}
              style={{
                  width: '100%', height: '150px', background: 'var(--bg-dark)', color: 'white',
                  border: '1px solid var(--glass-border)', borderRadius: '15px', padding: '15px', marginBottom: '30px', outline: 'none'
              }}
            />

            <div style={{display: 'flex', gap: '15px', justifyContent: 'center'}}>
              <button className="btn-primary" onClick={yorumuGonder}>YAYINLA</button>
              <button className="back-btn" style={{marginBottom: 0}} onClick={() => setIsModalOpen(false)}>İPTAL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiziDetay;