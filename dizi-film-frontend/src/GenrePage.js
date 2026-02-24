import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Token'ın zaten AnaSayfa.js'de var, oradan kopyalayabilirsin
const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZWQ5YzVhMjU0ZWIwYzFlZjlmN2ZmMTg2NDFiYjA1MiIsIm5iZiI6MTc2Nzk3MDk4OC4wODcwMDAxLCJzdWIiOiI2OTYxMThhY2MxMDJiYTRjMDYzNjQxYmMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.ltW7Hb1e-8K84y2972BAeb8DI7jftNpECJFvAXC4Tno";

function GenrePage() {
  const { id, name } = useParams();
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchByGenre = async () => {
      try {
        // with_genres parametresi ile ilgili türü çekiyoruz
        const res = await axios.get(`https://api.themoviedb.org/3/discover/movie?with_genres=${id}&language=tr-TR`, {
          headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
        });
        setItems(res.data.results);
      } catch (err) {
        console.error("Tür verileri çekilemedi", err);
      }
    };
    fetchByGenre();
  }, [id]);

  return (
    <div className="container">
      <button className="back-btn" style={{marginBottom: '30px'}} onClick={() => navigate('/')}>← ANA SAYFA</button>
      
      <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '40px' }}>
        {name.toUpperCase()} FİLMLERİ
      </h1>
      
      {/* Filmleri Grid yapısında gösteriyoruz */}
      <div className="reviews-grid"> 
        {items.map(item => (
          <div key={item.id} className="movie-card" onClick={() => navigate(`/film/${item.id}`)}>
            <img 
              src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
              alt={item.title} 
              style={{cursor: 'pointer'}}
            />
            <div className="movie-info">
              <h3 title={item.title}>{item.title}</h3>
              <span className="rating">★ {item.vote_average?.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p style={{color: 'var(--text-dim)', textAlign: 'center', marginTop: '50px'}}>
          Bu türde henüz film bulunamadı.
        </p>
      )}
    </div>
  );
}

export default GenrePage;