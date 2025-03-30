import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useAuth } from '../utils/AuthContext'; // Импортируем контекст

import '../styles.css'; // Подключаем стили

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Используем login из контекста

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams();
    const password = e.target.password.value;
    const confirmPassword = e.target.confirm_password.value;

    if (password !== confirmPassword) {
      console.error('Пароли не совпадают!');
      return;
    }

    formData.append('email', e.target.email.value);
    formData.append('username', e.target.username.value);
    formData.append('password', password);
    formData.append('confirm_password', confirmPassword);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(), // отправляем данные как строку
      });

      const data = await res.json();
      if (data.type === 'success') {
        // Сохраняем токен и обновляем состояние авторизации
        localStorage.setItem('authToken', data.token); // Или другое хранилище
        login(data.token); // Обновляем контекст о том, что пользователь вошел
        navigate('/'); // Перенаправляем на главную страницу
      } else {
        console.error(data.msg || 'Ошибка регистрации');
      }
    } catch (err) {
      console.error('Ошибка регистрации:', err);
    }
  };

  return (
    <section className="register-page">
      <h2 className="page-title">Регистрация</h2>
      <form id="register-form" onSubmit={handleSubmit} className="form">
        <label className="form-label">
          Email:
          <input type="email" name="email" required className="input-field" />
        </label>
        <label className="form-label">
          Имя пользователя:
          <input type="text" name="username" required className="input-field" />
        </label>
        <label className="form-label">
          Пароль:
          <input type="password" name="password" required className="input-field" />
        </label>
        <label className="form-label">
          Подтверждение пароля:
          <input type="password" name="confirm_password" required className="input-field" />
        </label>
        <button type="submit" className="submit-button">Зарегистрироваться</button>
      </form>
      <p className="auth-switch-link">
        Уже есть аккаунт? <Link to="/login" className="auth-switch-link__link">Войдите</Link>
      </p>
    </section>
  );
};

export default RegisterPage;
