import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext'; // Импортируем контекст
import { showNotification } from '../utils/apiFunctions'; // Импортируем showNotification

import { API_BASE_URL } from '../config';

const LogoutPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Используем logout из контекста

  useEffect(() => {
    const logoutUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include', // Чтобы использовать куки сессии
        });

        if (res.ok) {
          logout(); // Обновляем контекст о том, что пользователь вышел
          navigate('/'); // Перенаправляем на главную страницу
          showNotification('Вы успешно вышли', 'success'); // Показываем уведомление
        } else {
          console.error('Ошибка выхода');
        }
      } catch (err) {
        console.error('Ошибка при выходе:', err);
      }
    };

    logoutUser();
  }, [navigate, logout]);

  return <div>Выход...</div>; // Показываем, пока происходит выход
};

export default LogoutPage;
