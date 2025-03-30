import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate для перенаправления
import { API_BASE_URL } from '../config';
import { showNotification, updateCartCounter } from '../utils/apiFunctions';
import '../styles.css';

const CartPage = () => {
  const navigate = useNavigate();  // Используем useNavigate для перенаправления
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Храним исходные значения для каждого товара при фокусе
  const [originalQuantities, setOriginalQuantities] = useState({});

  // Функция загрузки корзины с сервера с опцией отображения загрузчика
  const fetchCart = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/cart/`, { credentials: 'include' });
      const data = await res.json();
      if (data.type && data.type.trim().toLowerCase() === 'success') {
        setCartItems(data.data);
      } else {
        setError(data.msg || 'Неизвестная ошибка');
      }
    } catch (err) {
      console.error('Ошибка загрузки корзины:', err);
      setError('Ошибка загрузки корзины');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart(true);
  }, []);

  // Оптимистичное обновление количества товара при нажатии кнопок
  const updateQuantity = async (productId, delta) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + delta }
          : item
      )
    );
    const newTotal = cartItems.reduce((sum, item) => {
      if (item.product.id === productId) {
        return sum + (item.quantity + delta);
      }
      return sum + item.quantity;
    }, 0);
    const counterElem = document.getElementById('cart-counter');
    if (counterElem) counterElem.textContent = newTotal;

    try {
      const res = await fetch(`${API_BASE_URL}/cart/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: delta }),
      });
      const data = await res.json();
      if (data.type && data.type.trim().toLowerCase() !== 'success') {
        console.error('Ошибка обновления корзины: ', data.msg);
      }
    } catch (err) {
      console.error('Ошибка обновления корзины:', err);
    } finally {
      fetchCart(false);
      updateCartCounter();
    }
  };

  // Обновление количества при вводе значения
  const handleInputChange = (productId, newQuantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
    const newTotal = cartItems.reduce((sum, item) => {
      if (item.product.id === productId) {
        return sum + newQuantity;
      }
      return sum + item.quantity;
    }, 0);
    const counterElem = document.getElementById('cart-counter');
    if (counterElem) counterElem.textContent = newTotal;
  };

  // При фокусе сохраняем исходное значение
  const handleInputFocus = (productId, currentQuantity) => {
    setOriginalQuantities(prev => ({ ...prev, [productId]: currentQuantity }));
  };

  // При потере фокуса вычисляем изменение (delta) и отправляем запрос
  const handleInputBlur = async (productId, newQuantity) => {
    const orig = originalQuantities[productId] || newQuantity;
    const delta = newQuantity - orig;
    if (delta === 0) return;
    try {
      const res = await fetch(`${API_BASE_URL}/cart/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: delta }),
      });
      const data = await res.json();
      if (data.type && data.type.trim().toLowerCase() !== 'success') {
        console.error('Ошибка обновления корзины: ', data.msg);
      }
    } catch (err) {
      console.error('Ошибка обновления корзины:', err);
    } finally {
      fetchCart(false);
      updateCartCounter();
    }
  };

  // Оптимистичное удаление товара
  const removeFromCart = async (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    const newTotal = cartItems
      .filter(item => item.product.id !== productId)
      .reduce((sum, item) => sum + item.quantity, 0);
    const counterElem = document.getElementById('cart-counter');
    if (counterElem) counterElem.textContent = newTotal;

    try {
      const res = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.type && data.type.trim().toLowerCase() !== 'success') {
        console.error('Ошибка удаления из корзины: ', data.msg);
      }
    } catch (err) {
      console.error('Ошибка при удалении из корзины:', err);
    } finally {
      fetchCart(false);
      updateCartCounter();
    }
  };

  // Перенаправление на страницу оформления заказа
  const handleCheckout = () => {
    navigate('/checkout'); // Перенаправление на страницу оформления заказа
  };

  if (loading) return <p>Загрузка корзины...</p>;
  if (error) return <p>Ошибка: {error}</p>;

  if (cartItems.length === 0) {
    return (
      <p>
        Ваша корзина пуста.{' '}
        <button onClick={() => navigate('/')}>Перейти на главную</button>
      </p>
    );
  }

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalSum = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <section className="cart-page">
      <h2 className="page-title">Корзина</h2>
      <p className="cart-quantity-info">Количество товаров: {totalQuantity}</p>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Товар</th>
            <th>Цена</th>
            <th>Количество</th>
            <th>Сумма</th>
            <th>Удалить</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map(item => {
            const product = item.product || {};
            const price = product.price || 0;
            const truncatedName =
              product.name && product.name.length > 20
                ? product.name.slice(0, 20) + '...'
                : product.name || 'Без названия';

            return (
              <tr key={product.id}>
                <td>
                  <a
                    href={`/product/${product.id}`}
                    className="cart-product-link"
                    title={product.name}
                  >
                    {truncatedName}
                  </a>
                </td>
                <td>{price ? `${price.toFixed(2)}₽` : '—'}</td>
                <td>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(product.id, -1)}>-</button>
                    <input
                      type="number"
                      className="quantity-input"
                      value={item.quantity}
                      min="1"
                      onFocus={() => handleInputFocus(product.id, item.quantity)}
                      onChange={(e) =>
                        handleInputChange(product.id, parseInt(e.target.value, 10))
                      }
                      onBlur={(e) =>
                        handleInputBlur(product.id, parseInt(e.target.value, 10))
                      }
                    />
                    <button onClick={() => updateQuantity(product.id, 1)}>+</button>
                  </div>
                </td>
                <td>{(price * item.quantity).toFixed(2)}₽</td>
                <td>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="remove-from-cart-button"
                  >
                    X
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="cart-summary">
        <div className="total-sum">Общая сумма: {totalSum.toFixed(2)}₽</div>
        <button className="pay-button" onClick={handleCheckout}>Перейти к оплате</button>
      </div>
    </section>
  );
};

export default CartPage;
