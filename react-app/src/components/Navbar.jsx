import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../utils/CartContext';  // Импортируем контекст корзины
import '../styles.css';

const Navbar = ({ loggedIn, userId }) => {
  const { cartCounter, updateCart } = useCart();  // Используем данные и функцию из контекста
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (loggedIn && userId) {
      updateCart();  // Обновляем счетчик корзины при изменении логина

      // Получаем список ID администраторов из переменной окружения
      const adminIds = process.env.REACT_APP_ADMIN_IDS.split(',').map(id => parseInt(id.trim(), 10));

      // Преобразуем userId в число, если оно строка
      const userIdNumber = parseInt(userId, 10);

      // Проверяем, является ли текущий пользователь администратором
      setIsAdmin(adminIds.includes(userIdNumber));
    }
  }, [loggedIn, updateCart, userId]);

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link to="/">Главная</Link>
        </li>
        {loggedIn ? (
          <>
            {isAdmin && (
              <li className="navbar-item">
                <Link to="/add-product">Добавить товар</Link>
              </li>
            )}
            <li className="navbar-item">
              <Link to="/cart">
                Корзина
                <span className="cart-counter">{cartCounter}</span> {/* отображаем количество */}
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/profile">Профиль</Link>
            </li>
            <li className="navbar-item">
              <Link to="/logout">Выход</Link>
            </li>
          </>
        ) : (
          <>
            <li className="navbar-item">
              <Link to="/login">Вход</Link>
            </li>
            <li className="navbar-item">
              <Link to="/register">Регистрация</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
