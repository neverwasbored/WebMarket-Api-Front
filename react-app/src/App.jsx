import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { API_BASE_URL } from './config';
import { AuthProvider, useAuth } from './utils/AuthContext';  // Импортируем AuthContext
import { CartProvider } from './utils/CartContext'; // Импортируем CartProvider
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AddProductPage from './pages/AddProductPage';
import ProductDetailPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';  // Импортируем CheckoutPage
import Navbar from './components/Navbar';
import LogoutPage from './pages/LogoutPage';
import './styles.css';

const App = () => {
  return (
    <AuthProvider>  {/* Оборачиваем всё приложение в AuthProvider */}
      <CartProvider> {/* Оборачиваем приложение в CartProvider */}
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth(); // Получаем состояние авторизации из контекста
  const [userId, setUserId] = useState(null); // Состояние для хранения userId

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        const userRes = await fetch(`${API_BASE_URL}/user/me`, { credentials: 'include' });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserId(userData.id);  // Сохраняем userId
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated]); // Загружаем userId только если пользователь аутентифицирован

  if (loading) {
    return <p>Загрузка...</p>;
  }

  return (
    <Router>
      <Navbar loggedIn={isAuthenticated} userId={userId} /> {/* Передаем userId в Navbar */}
      <main className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={isAuthenticated ? <CartPage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/add-product" element={isAuthenticated ? <AddProductPage /> : <Navigate to="/login" />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/checkout" element={isAuthenticated ? <CheckoutPage /> : <Navigate to="/login" />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="*" element={<h2>404 - Страница не найдена</h2>} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
