import React, { useState, useEffect } from 'react';
import { useCart } from '../utils/CartContext';
import '../styles.css';

const CheckoutPage = () => {
  const { cartCounter, updateCart } = useCart();
  const [address, setAddress] = useState('');  // Используем состояние для адреса
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderSummary, setOrderSummary] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Обновим данные корзины и подсчитаем общую сумму
  useEffect(() => {
    const fetchCartData = async () => {
      const cartItems = [
        { name: 'Товар 1', quantity: 2, price: 500 },
        { name: 'Товар 2', quantity: 1, price: 1500 },
      ];

      const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      setOrderSummary(cartItems);
      setTotalPrice(total);
    };

    fetchCartData();
  }, []);

  // Функция для обновления адреса
  const handleAddressChange = (e) => {
    console.log('Текущее значение адреса:', e.target.value); // Добавляем отладочную информацию
    setAddress(e.target.value);  // Обновляем адрес в состоянии при изменении
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
              value={address}  // Связываем инпут с состоянием address
              onChange={handleAddressChange}  // Обновляем адрес при изменении
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
                  <td>{item.name.length > 15 ? `${item.name.slice(0, 15)}...` : item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price * item.quantity} ₽</td>
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
