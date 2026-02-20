import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AllReviews() {
  const [reviews, setReviews] = useState([]);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/reviews/user/${userId}`)
      .then(res => setReviews(res.data));
  }, [userId]);

  return (
    <div className="container">
      <button className="back-btn" onClick={() => navigate('/profil')}>← PROFİLE DÖN</button>
      <h1 className="detay-baslik" style={{ margin: '30px 0' }}>TÜM YORUMLARIM</h1>
      
      <div className="reviews-full-list">
        {reviews.map(rev => (
          <div key={rev.id} className="review-horizontal-card" style={{ marginBottom: '20px', background: 'rgba(0,0,0,0.3)' }}>
            <img src={`https://image.tmdb.org/t/p/w200${rev.poster_path}`} alt={rev.media_title} />
            <div className="review-content">
              <h3>{rev.media_title}</h3>
              <div className="rating">{"★".repeat(rev.rating)}</div>
              <p style={{ fontSize: '1.2rem', fontStyle: 'italic' }}>{rev.comment}</p>
              <button className="yorum-btn" onClick={() => navigate(`/${rev.media_type}/${rev.media_id}`)}>İçeriğe Git</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllReviews;