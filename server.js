const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- TEST ROTASI ---
app.get('/test', async (req, res) => {
  try {
    const resDb = await pool.query('SELECT current_user, current_database()');
    res.json({
      status: "Başarılı!",
      user: resDb.rows[0].current_user,
      db: resDb.rows[0].current_database
    });
  } catch (err) {
    console.error("Hata Detayı:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- AUTH SİSTEMİ ---
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username',
      [username, email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: "Bu kullanıcı adı veya e-posta zaten kullanımda." });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        const token = jwt.sign({ id: user.id, username: user.username }, 'GIZLI_ANAHTAR', { expiresIn: '1d' });
        res.json({ token, username: user.username, id: user.id });
      } else {
        res.status(401).json({ error: "Şifre yanlış." });
      }
    } else {
      res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
  } catch (err) {
    res.status(500).json({ error: "Sunucu hatası." });
  }
});

// --- FAVORİLER VE SPOTLIGHT ---
app.post('/api/favorites', async (req, res) => {
  const { user_id, media_id, media_type, title, poster_path } = req.body;
  if (!user_id || user_id === "undefined") {
    return res.status(400).json({ error: "Kullanıcı ID bulunamadı." });
  }
  try {
    await pool.query(
      'INSERT INTO favorites (user_id, media_id, media_type, title, poster_path) VALUES ($1, $2, $3, $4, $5)',
      [user_id, media_id, media_type, title, poster_path]
    );
    res.status(201).json({ message: "Favorilere eklendi!" });
  } catch (err) {
    if (err.code === '23505') res.status(400).json({ error: "Zaten listende!" });
    else res.status(500).json({ error: err.message });
  }
});

app.get('/api/favorites/:user_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM favorites WHERE user_id = $1', [req.params.user_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Favoriler getirilemedi." });
  }
});

app.delete('/api/favorites/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM favorites WHERE id = $1', [req.params.id]);
    res.json({ message: "Silindi." });
  } catch (err) {
    res.status(500).json({ error: "Silme hatası." });
  }
});

app.put('/api/favorites/spotlight/:id', async (req, res) => {
    const { id } = req.params;
    const { is_spotlight, user_id, media_type } = req.body;
    try {
        if (is_spotlight) {
            await pool.query('UPDATE favorites SET is_spotlight = FALSE WHERE user_id = $1 AND media_type = $2', [user_id, media_type]);
        }
        await pool.query('UPDATE favorites SET is_spotlight = $1 WHERE id = $2', [is_spotlight, id]);
        res.json({ message: "Spotlight güncellendi!" });
    } catch (err) {
        res.status(500).json({ error: "Hata oluştu." });
    }
});

// --- YORUMLAR (REVIEWS) - BURASI HATALIYDI DÜZELTİLDİ ---
app.post('/api/reviews', async (req, res) => {
  try {
    // Frontend'den gelen tüm verileri burada karşılıyoruz
    const { user_id, media_id, media_type, media_title, poster_path, rating, comment, episode_no } = req.body;

    // INSERT sorgusunda sütun isimlerinin SQL tablosuyla birebir aynı olduğundan emin oluyoruz
    const result = await pool.query(
      'INSERT INTO reviews (user_id, media_id, media_type, media_title, poster_path, rating, comment, episode_no) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [user_id, media_id, media_type, media_title, poster_path, rating, comment, episode_no]
    );

    res.status(201).json({ message: "Başarıyla kaydedildi!", data: result.rows[0] });
  } catch (err) {
    console.error("Yorum Kayıt Hatası:", err.message);
    res.status(500).json({ error: "Sunucu hatası: " + err.message });
  }
});

app.get('/api/reviews/user/:userId', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM reviews WHERE user_id = $1 ORDER BY created_at DESC', 
            [req.params.userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Yorum çekme hatası:", err);
        res.status(500).json({ error: "Yorumlar getirilemedi." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda hazır!`);
});