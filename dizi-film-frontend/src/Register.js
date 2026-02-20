import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert("Hesabın oluşturuldu! Şimdi giriş yapabilirsin.");
      navigate('/login');
    } catch (err) {
      alert(err.response.data.error || "Kayıt sırasında bir hata oluştu.");
    }
  };

  return (
    // Register.js içindeki return kısmını şununla değiştir:
<div className="auth-container">
  <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
    <h2 style={{color: 'var(--header-pink)'}}>YENİ HESAP AÇ</h2>
    
<input 
  type="text" 
  name="username_new" // İsmi değiştirdik ki eski kayıtlarla eşleşmesin
  placeholder="Kullanıcı Adı" 
  autoComplete="none" // Otomatik doldurmayı kapatmaya zorla
  onChange={(e) => setFormData({...formData, username: e.target.value})} 
  required 
/>

<input 
  type="email" 
  name="email_new"
  placeholder="E-posta" 
  autoComplete="none"
  onChange={(e) => setFormData({...formData, email: e.target.value})} 
  required 
/>

<input 
  type="password" 
  name="password_new"
  placeholder="Şifre" 
  autoComplete="new-password" // Tarayıcıya bunun yeni bir şifre olduğunu anlatır
  onChange={(e) => setFormData({...formData, password: e.target.value})} 
  required 
/>

    <button type="submit" className="yorum-btn" style={{width: '100%', marginTop: '10px'}}>KAYIT OL</button>
    <p 
  onClick={() => navigate('/login')} 
  style={{
    cursor: 'pointer', 
    marginTop: '15px', 
    color: 'var(--header-pink)', // Burada rengi pembeye çevirdik
    fontWeight: 'bold',
    textDecoration: 'underline' // Link olduğu belli olsun
  }}
>
  Zaten hesabın var mı? Giriş yap.
</p>
  </form>
</div>
  );
}

export default Register;