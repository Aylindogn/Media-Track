import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZWQ5YzVhMjU0ZWIwYzFlZjlmN2ZmMTg2NDFiYjA1MiIsIm5iZiI6MTc2Nzk3MDk4OC4wODcwMDAxLCJzdWIiOiI2OTYxMThhY2MxMDJiYTRjMDYzNjQxYmMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.ltW7Hb1e-8K84y2972BAeb8DI7jftNpECJFvAXC4Tno";

function PopularPage() {
  const { type } = useParams(); // 'film' veya 'dizi'
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = type === 'film' ? 'movie/popular' : 'tv/popular';
        const res = await axios.get(`https://api.themoviedb.org/3/${endpoint}?language=tr-TR&page=1`, {
          headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
        });
        setItems(res.data.results);
      } catch (err) {
        console.error("Veriler çekilemedi", err);
      }
    };
    fetchData();
  }, [type]);

  return (
    <div className="container">
      <button className="back-btn" style={{marginBottom: '30px'}} onClick={() => navigate('/')}>← ANA SAYFA</button>
      
      <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '40px' }}>
        {type === 'film' ? "TÜM POPÜLER FİLMLER" : "TÜM POPÜLER DİZİLER"}
      </h1>
      
      <div className="reviews-grid"> 
        {items.map(item => (
          <div key={item.id} className="movie-card" onClick={() => navigate(`/${type}/${item.id}`)}>
            <img 
              src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
              alt={item.title || item.name} 
            />
            <div className="movie-info">
              <h3 title={item.title || item.name}>{item.title || item.name}</h3>
              <span className="rating">★ {item.vote_average?.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PopularPage;