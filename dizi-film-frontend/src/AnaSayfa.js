import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZWQ5YzVhMjU0ZWIwYzFlZjlmN2ZmMTg2NDFiYjA1MiIsIm5iZiI6MTc2Nzk3MDk4OC4wODcwMDAxLCJzdWIiOiI2OTYxMThhY2MxMDJiYTRjMDYzNjQxYmMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.ltW7Hb1e-8K84y2972BAeb8DI7jftNpECJFvAXC4Tno";

function AnaSayfa() {
    const [filmler, setFilmler] = useState([]);
    const [diziler, setDiziler] = useState([]);
    const [query, setQuery] = useState(''); // EKSİK OLAN STATE
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
                // Arama sonuçlarında media_type'a göre filtreleme ve tip atama
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

    // MovieRow bileşenini tipini dinamik alacak şekilde güncelledik
    const MovieRow = ({ title, data, type }) => (
        <div className="section-container">
            <h2 className="section-title">{title}</h2>
            <div className="horizontal-scroll">
                {data.map(item => (
                    <div
                        key={item.id}
                        className="movie-card scroll-item"
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
                <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    DIZI<span style={{ color: 'white' }}>BOX</span>
                </div>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Film veya dizi ara..."
                    value={query}
                    onChange={(e) => aramaYap(e.target.value)}
                />
                <div className="nav-auth">
                    {username ? (
                        <div className="user-info">
                            <span style={{ color: 'white', marginRight: '10px' }}>
                                Selam,
                                <b
                                    onClick={() => navigate('/profil')}
                                    style={{ color: 'var(--header-pink)', cursor: 'pointer', marginLeft: '5px' }}
                                >
                                    {username}
                                </b>
                            </span>                            <button className="back-btn" onClick={() => { localStorage.clear(); window.location.reload(); }}>Çıkış</button>
                        </div>
                    ) : (
                        <button className="yorum-btn" onClick={() => navigate('/login')}>Giriş</button>
                    )}
                </div>
            </nav>

            <div className="container">
                {/* ARAMA SONUÇLARI (Sadece bir şey yazıldığında görünür) */}
                {searchResult.length > 0 && (
                    <MovieRow title="ARAMA SONUÇLARI" data={searchResult} />
                )}

                <MovieRow title="POPULAR MOVIES" data={filmler} type="film" />
                <MovieRow title="POPULAR SERIES" data={diziler} type="dizi" />
            </div>
        </div>
    );
}

export default AnaSayfa;