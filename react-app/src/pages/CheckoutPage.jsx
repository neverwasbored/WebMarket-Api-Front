import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Импортируем useNavigate для перенаправления
import { API_BASE_URL } from '../config';
import { useCart } from '../utils/CartContext';
import '../styles.css';

const CheckoutPage = () => {
  const navigate = useNavigate();  // Используем useNavigate для перенаправления
  const { cartCounter, updateCart } = useCart();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderSummary, setOrderSummary] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Обновляем данные корзины, делая запрос к API
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/cart/`, {
          method: 'GET',
          credentials: 'include', // если требуется передача cookie (например, для аутентификации)
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          // Выводим статус и текст ошибки для отладки
          const errorText = await response.text();
          console.error('Ошибка при запросе корзины:', response.status, errorText);
          throw new Error(`Ошибка запроса: ${response.status}`);
        }

        const result = await response.json();
        if (result.type === 'success' && result.data) {
          // Вычисляем общую стоимость на основе цены товара и количества
          const total = result.data.reduce((sum, item) => {
            return sum + item.product.price * item.quantity;
          }, 0);
          setOrderSummary(result.data);
          setTotalPrice(total);
        } else {
          console.error('Ошибка получения данных корзины:', result.msg);
        }
      } catch (error) {
        console.error('Ошибка при загрузке корзины:', error);
      }
    };

    fetchCartData();
  }, []);

  const handleAddressChange = (e) => {
    console.log('Текущее значение адреса:', e.target.value);
    setAddress(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Заказ отправлен');
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Левая часть: форма адреса и способы оплаты */}
        <div className="checkout-left">
          <form onSubmit={handleSubmit} className="address-form">
            <h2>Адрес доставки</h2>
            <input
              type="text"
              value={address}
              onChange={handleAddressChange}
              placeholder="Введите адрес доставки"
              className="address-input"
              required
            />
          </form>

          <div className="payment-methods">
            <h3>Методы оплаты</h3>
            <label>
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Банковская карта
            </label>
            <label>
              <input
                type="radio"
                value="sbp"
                checked={paymentMethod === 'sbp'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              СБП
            </label>
            <label>
              <input
                type="radio"
                value="sberbank"
                checked={paymentMethod === 'sberbank'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Сбербанк
            </label>
          </div>
        </div>

        {/* Правая часть: товары в корзине */}
        <div className="checkout-right">
          <h3>Товары в корзине</h3>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Количество</th>
                <th>Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {orderSummary.map((item, index) => (
                <tr key={index}>
                  <td>
                    {/* Добавляем ссылку на страницу товара */}
                    <a
                      href={`/product/${item.product.id}`}  // Ссылка на страницу товара
                      className="cart-product-link"
                    >
                      {item.product.name.length > 15
                        ? `${item.product.name.slice(0, 15)}...`
                        : item.product.name}
                    </a>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{item.product.price * item.quantity} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-summary">
            <p><strong>Общая сумма: </strong>{totalPrice} ₽</p>
            <button type="submit" className="pay-button">Оплатить</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
