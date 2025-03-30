import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useAuth } from '../utils/AuthContext'; // Импортируем контекст

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Используем login из контекста

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams();
    formData.append('email', e.target.email.value);
    formData.append('password', e.target.password.value);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(), // отправляем данные как строку
      });

      if (!res.ok) {
        throw new Error('Ошибка авторизации');
      }

      const data = await res.json();
      if (data.type === 'success') {
        // Сохраняем токен и обновляем состояние авторизации
        localStorage.setItem('authToken', data.token); // Или другое хранилище
        login(data.token); // Обновляем контекст о том, что пользователь вошел
        navigate('/'); // Перенаправляем на главную страницу
      } else {
        console.error(data.msg || 'Ошибка авторизации');
      }
    } catch (err) {
      console.error('Ошибка авторизации:', err);
    }
  };

  return (
    <section className="login-page">
      <h2 className="page-title">Авторизация</h2>
      <form id="login-form" onSubmit={handleSubmit} className="auth-form">
        <label>
          <span>Email:</span>
          <input type="email" name="email" required className="input-field" />
        </label>
        <br />
        <label>
          <span>Пароль:</span>
          <input type="password" name="password" required className="input-field" />
        </label>
        <br />
        <button type="submit" className="submit-button">Войти</button>
      </form>
      <p className="auth-switch-link">
        Нет аккаунта? <Link to="/register" className="auth-switch-link__link">Зарегистрироваться</Link>
      </p>
    </section>
  );
};

export default LoginPage;
