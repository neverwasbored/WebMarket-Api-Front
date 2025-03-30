import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null); // Храним userId
  const [loading, setLoading] = useState(true); // Состояние для загрузки данных

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/me`, {
          method: 'GET',
          credentials: 'include', // Для отправки куков
        });

        if (res.ok) {
          const userData = await res.json();
          setUserId(userData.id); // Сохраняем userId
          setIsAuthenticated(true); // Если все ок, считаем пользователя авторизованным
        } else {
          setIsAuthenticated(false); // Если нет, разлогиниваем
        }
      } catch (err) {
        console.error('Ошибка при проверке авторизации:', err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false); // Загружаем, когда запрос завершится
      }
    };

    checkAuth();
  }, []);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
