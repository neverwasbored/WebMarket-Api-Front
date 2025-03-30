import React, { useState } from 'react';
import { setRating } from '../utils/apiFunctions'; // Функция для обновления рейтинга на сервере
import { showNotification, isLoggedIn } from '../utils/apiFunctions'; // Импортируем showNotification и isLoggedIn

const StarRating = ({ productId, currentRating }) => {
  const [rating, setLocalRating] = useState(currentRating);

  // Обработка клика по звезде
  const handleStarClick = async (value) => {
    // Проверка авторизации перед изменением рейтинга
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      showNotification('Вы должны быть авторизованы, чтобы оценить товар', 'error');
      return;
    }
  
    setLocalRating(value); // Обновление локального состояния
    try {
      const response = await setRating(productId, value); // Отправка нового рейтинга
      if (!response.ok) {
        showNotification('Ошибка при обновлении рейтинга', 'error');
      } else {
        showNotification('Рейтинг успешно обновлен', 'success');
      }
    } catch (err) {
      console.error('Ошибка при установке рейтинга:', err);
      showNotification('Ошибка при установке рейтинга', 'error');
    }
  };

  // Сброс рейтинга
  const resetRating = async () => {
    // Проверка авторизации перед сбросом рейтинга
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      showNotification('Вы должны быть авторизованы, чтобы сбросить рейтинг', 'error');
      return;
    }

    setLocalRating(0); // Обновление локального состояния на 0
    try {
      const response = await setRating(productId, 0); // Отправка запроса на сброс рейтинга
      if (!response.ok) {
        showNotification('Ошибка при сбросе рейтинга', 'error');
      }
    } catch (err) {
      console.error('Ошибка при сбросе рейтинга:', err);
      showNotification('Ошибка при сбросе рейтинга', 'error');
    }
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="star-rating-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="rating-block" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Числовое значение рейтинга слева */}
        <span
          className="rating-value"
          style={{
            marginRight: '8px',
            fontSize: '1.2em',
            fontWeight: 'bold',
            color: '#5c5c5c',
          }}
        >
          {rating.toFixed(1)}
        </span>
        {/* Звезды */}
        <div className="stars" style={{ display: 'flex' }}>
          {stars.map((star) => (
            <span
              key={star}
              onClick={() => handleStarClick(star)}
              style={{
                cursor: 'pointer',
                fontSize: '1.5em',
                color: star <= rating ? 'gold' : '#ccc', // используем золотой цвет для выбранных звезд
                margin: '0 5px',
                transition: 'transform 0.2s, color 0.2s ease',
                transform: star <= rating ? 'scale(1.2)' : 'scale(1)',
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      {/* Кнопка сброса */}
      <button
        onClick={resetRating}
        className="reset-rating-button"
        style={{
          marginTop: '8px',
          padding: '6px 14px',
          fontSize: '1em',
          backgroundColor: '#C5A4D6', // Светлый фиолетовый
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'background-color 0.3s, transform 0.2s',
        }}
      >
        Сбросить
      </button>
    </div>
  );
};

export default StarRating;
