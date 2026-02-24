import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZWQ5YzVhMjU0ZWIwYzFlZjlmN2ZmMTg2NDFiYjA1MiIsIm5iZiI6MTc2Nzk3MDk4OC4wODcwMDAxLCJzdWIiOiI2OTYxMThhY2MxMDJiYTRjMDYzNjQxYmMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.ltW7Hb1e-8K84y2972BAeb8DI7jftNpECJFvAXC4Tno";

function AnaSayfa() {
    const [filmler, setFilmler] = useState([]);
    const [diziler, setDiziler] = useState([]);
    const [query, setQuery] = useState('');
    const [searchResult, setSearchResult] = useState([]);

    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    useEffect(() => {
        verileriGetir();
    }, []);

    const verileriGetir = async () => {
        try {
            const [filmRes, diziRes] = await Promise.all([
                axios.get('https://api.themoviedb.org/3/movie/popular?language=tr-TR', {
                    headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
                }),
                axios.get('https://api.themoviedb.org/3/tv/popular?language=tr-TR', {
                    headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
                })
            ]);
            setFilmler(filmRes.data.results);
            setDiziler(diziRes.data.results);
        } catch (err) {
            console.error("Veriler çekilemedi", err);
        }
    };

    const aramaYap = async (term) => {
        setQuery(term);
        if (term.length > 2) {
            try {
                const res = await axios.get(`https://api.themoviedb.org/3/search/multi?language=tr-TR&query=${term}`, {
                    headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
                });
                const filtered = res.data.results
                    .filter(i => i.media_type === 'movie' || i.media_type === 'tv')
                    .map(i => ({ ...i, customType: i.media_type === 'movie' ? 'film' : 'dizi' }));

                setSearchResult(filtered);
            } catch (err) {
                console.error("Arama hatası", err);
            }
        } else {
            setSearchResult([]);
        }
    };

    const MovieRow = ({ title, data, type }) => (
        <div className="section-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="section-title" style={{ margin: 0 }}>{title}</h2>
                <span style={{ color: 'var(--header-pink)', cursor: 'pointer', fontSize: '0.9rem' }}>View All →</span>
            </div>
            <div className="horizontal-scroll">
                {data.map(item => (
                    <div
                        key={item.id}
                        className="movie-card"
                        onClick={() => navigate(`/${type || item.customType}/${item.id}`)}
                    >
                        <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} alt={item.title || item.name} />
                        <div className="movie-info">
                            <h3>{item.title || item.name}</h3>
                            <span className="rating">★ {item.vote_average?.toFixed(1)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            <nav className="navbar">
                <div className="logo" onClick={() => navigate('/')}>
                    MEDIA-<span style={{ color: 'var(--header-pink)' }}>TRACK</span>
                </div>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search titles..."
                    value={query}
                    onChange={(e) => aramaYap(e.target.value)}
                />
                <div className="nav-auth">
                    {username ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                Selam, <b onClick={() => navigate('/profil')} style={{ color: 'white', cursor: 'pointer' }}>{username}</b>
                            </span>
                            <button className="back-btn" style={{ marginBottom: 0 }} onClick={() => { localStorage.clear(); window.location.reload(); }}>Çıkış</button>
                        </div>
                    ) : (
                        <button className="btn-primary" onClick={() => navigate('/login')}>Giriş</button>
                    )}
                </div>
            </nav>

            <div className="container">
                {/* --- SPOTLIGHT BANNER (Hero Bölümü) --- */}
                {!query && filmler[0] && (
                    <div className="spotlight-banner">
                        <img 
                            src={`https://image.tmdb.org/t/p/original${filmler[0].backdrop_path}`} 
                            alt="hero" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.5' }}
                        />
                        <div className="spotlight-overlay">
                            <span style={{ background: 'var(--header-pink)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', width: 'fit-content' }}>
                                TRENDING NOW
                            </span>
                            <h1 style={{ fontSize: '4rem', margin: '15px 0', fontWeight: '900', lineHeight: '1' }}>
                                {filmler[0].title.toUpperCase()}
                            </h1>
                            <p style={{ maxWidth: '600px', color: 'var(--text-dim)', marginBottom: '30px', fontSize: '1.1rem' }}>
                                {filmler[0].overview?.substring(0, 160)}...
                            </p>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button className="btn-primary" onClick={() => navigate(`/film/${filmler[0].id}`)}>Watch Trailer</button>
                                <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }}>+ Add to List</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ARAMA SONUÇLARI */}
                {searchResult.length > 0 && (
                    <MovieRow title="SEARCH RESULTS" data={searchResult} />
                )}

                {/* POPÜLER İÇERİKLER */}
                <MovieRow title="POPULAR MOVIES" data={filmler} type="film" />
                <MovieRow title="POPULAR SERIES" data={diziler} type="dizi" />

                {/* --- BROWSE BY GENRE --- */}
                <div className="section-container" style={{ marginTop: '40px' }}>
                    <h2 className="section-title">BROWSE BY GENRE</h2>
                    <div className="genre-container">
                        <div className="genre-item">🚀 SCI-FI</div>
                        <div className="genre-item">😂 COMEDY</div>
                        <div className="genre-item">🎭 DRAMA</div>
                        <div className="genre-item">💀 HORROR</div>
                        <div className="genre-item">💗 ROMANCE</div>
                        <div className="genre-item">⚔️ ACTION</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnaSayfa;