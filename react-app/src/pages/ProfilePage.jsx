import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { API_BASE_URL } from '../config';
import { showNotification } from '../utils/apiFunctions';
import '../styles.css';

const ProfilePage = () => {
  const { isAuthenticated, loading } = useAuth();  
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');

  // Загрузка профиля при успешной авторизации
  useEffect(() => {
    if (loading || !isAuthenticated) return;  // Ждем завершения авторизации

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          setMessage('Не удалось загрузить профиль');
          return;
        }

        const data = await res.json();
        if (data.id) {
          setProfile(data);
        } else {
          setMessage('Не удалось загрузить профиль');
        }
      } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
        setMessage('Ошибка загрузки профиля');
      }
    };

    fetchProfile();
  }, [loading, isAuthenticated]);  // Зависимости для перезагрузки при изменении состояния авторизации

  // Если данные еще загружаются
  if (loading) {
    return <p>Загрузка данных...</p>;
  }

  // Если нет профиля или ошибка
  if (!profile) {
    return <p>{message || 'Не удалось загрузить профиль.'}</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirm_password.value;

    if (password && password !== confirmPassword) {
      setMessage('Пароли не совпадают!');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    if (password) {
      formData.append('password', password);
      formData.append('confirm_password', confirmPassword);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/user/update`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.type === 'success') {
        showNotification('Профиль успешно обновлён', 'success');
        setMessage(data.msg || 'Профиль обновлён');
        setProfile((prev) => ({ ...prev, username, email }));
      } else {
        setMessage(data.msg || 'Ошибка обновления профиля');
      }
    } catch (err) {
      console.error('Ошибка обновления профиля:', err);
      setMessage('Ошибка обновления профиля');
    }
  };

  return (
    <section className="profile-page">
      <h2>Профиль</h2>
      <div className="profile-info">
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Имя пользователя:</strong> {profile.username}</p>
        <p><strong>Дата регистрации:</strong> {new Date(profile.created_at).toLocaleString()}</p>
      </div>

      <div className="profile-edit-notice">
        Изменить данные
      </div>
      
      {/* Описание для формы */}
      <p className="profile-edit-description">
        Вводите только те поля, которые хотите изменить
      </p>

      <form onSubmit={handleSubmit} id="profile-form" className="profile-form">
        <label>
          Имя пользователя:
          <input type="text" name="username" placeholder="Введите новое имя пользователя" className="input-field" />
        </label>
        <br />
        <label>
          Email:
          <input type="email" name="email" placeholder="Введите новую почту" className="input-field" />
        </label>
        <br />
        <label>
          Новый пароль:
          <input type="password" name="password" placeholder="Введите новый пароль" className="input-field" />
        </label>
        <br />
        <label>
          Подтверждение пароля:
          <input type="password" name="confirm_password" placeholder="Повторите новый пароль" className="input-field" />
        </label>
        <br />
        <button type="submit" className="submit-button">Обновить профиль</button>
      </form>

      {message && (
        <div id="profile-message" className="message">
          {message}
        </div>
      )}
    </section>
  );
};

export default ProfilePage;
