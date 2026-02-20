const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Bu 3 satırı ekleyerek timeout hatasını çözelim:
  connectionTimeoutMillis: 10000, // Bağlantı için 10 saniye bekle
  idleTimeoutMillis: 30000,      // Boştaki bağlantıyı 30 saniye tut
  max: 10                        // Aynı anda maksimum 10 bağlantı aç
});

module.exports = pool;