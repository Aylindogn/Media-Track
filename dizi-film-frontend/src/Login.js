import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false); // Yüklenme durumu için
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', formData);
    
    // Gelen veriyi konsola yazdır ki içinde ne var gör (Hata ayıklamak için)
    console.log("Sunucudan gelen cevap:", res.data);

    const userId = res.data.id || res.data.userId;

    if (userId) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('userId', String(userId));
      
      navigate('/');
      window.location.reload(); 
    } else {
      // Eğer buraya düşüyorsan Sunucu (Backend) ID göndermiyor demektir!
      alert("Hata: Sunucu kullanıcı numarasını göndermedi.");
    }
  } catch (err) {
    alert(err.response?.data?.error || "Giriş başarısız.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 style={{color: 'var(--header-pink)'}}>GİRİŞ YAP</h2>
        
        <input 
          type="email" 
          placeholder="E-posta" 
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          required 
          autoComplete="email"
        />
        
        <input 
          type="password" 
          placeholder="Şifre" 
          onChange={(e) => setFormData({...formData, password: e.target.value})} 
          required 
          autoComplete="current-password"
        />
        
        <button 
          type="submit" 
          className="yorum-btn" 
          style={{width: '100%', marginTop: '10px'}}
          disabled={loading}
        >
          {loading ? "GİRİŞ YAPILIYOR..." : "GİRİŞ YAP"}
        </button>
        
        <p 
          onClick={() => navigate('/register')} 
          style={{cursor: 'pointer', marginTop: '15px', color: 'var(--header-pink)', fontWeight: 'bold'}}
        >
          Hesabın yok mu? Kayıt ol.
        </p>
      </form>
    </div>
  );
}

export default Login;