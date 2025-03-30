import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn, showNotification } from '../utils/apiFunctions';
import ProductDescription from '../components/ProductDescription';

import '../styles.css';

const AddProductPage = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(null);
  const [error, setError] = useState(null);
  const [description, setDescription] = useState(''); // Состояние для текста

  useEffect(() => {
    (async () => {
      try {
        const auth = await isLoggedIn();
        setLoggedIn(auth);
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        setLoggedIn(false);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.target);

    // Добавляем описание с сохранением переносов строк
    formData.set('description', description);

    try {
      const res = await fetch(`${API_BASE_URL}/products/`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || 'Ошибка при добавлении товара');
      }
      showNotification(data.msg || 'Товар успешно добавлен');
      navigate('/');
    } catch (err) {
      console.error('Ошибка при добавлении товара:', err);
      setError(err.message || 'Ошибка при добавлении товара');
    }
  };

  if (loggedIn === null) {
    return <p>Загрузка...</p>;
  }

  if (!loggedIn) {
    return (
      <p>
        Вы не авторизованы. <a href="/login">Войдите</a>, чтобы добавить товар.
      </p>
    );
  }

  return (
    <section className="add-product-page">
      <h2 className="page-title">Добавить новый товар</h2>
      {error && <p className="error-message">{error}</p>}
      <form id="add-product-form" onSubmit={handleSubmit} encType="multipart/form-data" className="product-form">
        <label>
          <span>Название товара:</span>
          <input type="text" name="name" required className="input-field" />
        </label>
        <label>
          <span>Описание товара:</span>
          <textarea
            name="description"
            className="input-field"
            value={description}
            onChange={(e) => setDescription(e.target.value)} // Обновляем описание с сохранением переносов строк
          />
        </label>
        <label>
          <span>Цена товара:</span>
          <input type="number" name="price" step="0.01" required className="input-field" />
        </label>
        <label>
          <span>Изображение товара:</span>
          <input type="file" name="media" accept="image/*" required className="input-field" />
        </label>
        <button type="submit" className="submit-button">Добавить товар</button>
      </form>
    </section>
  );
};

export default AddProductPage;
