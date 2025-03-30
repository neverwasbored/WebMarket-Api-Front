import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Link } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { loadUserRatings, getRating } from '../utils/apiFunctions'; // Оставляем только импорт из apiFunctions.js

import '../styles.css';

const placeholderSVG = (
  <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#E0E0E0" />
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#888" fontSize="12">
      Изображение
    </text>
  </svg>
);

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/`, { credentials: 'include' });
        const result = await res.json();
        if (result.type === 'success') {
          await loadUserRatings();
          setProducts(result.data.items);
        } else {
          setError(result.msg || 'Ошибка получения данных');
        }
      } catch (err) {
        console.error('Ошибка при загрузке товаров:', err);
        setError('Ошибка при загрузке товаров');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Загрузка товаров...</p>;
  if (error) return <p>Ошибка: {error}</p>;
  if (!products || products.length === 0) return <p>Нет товаров для отображения</p>;

  return (
    <section className="home-page">
      <div className="products-grid">
        {products.slice(0, 12).map((product) => {
          const rating = getRating(product.id);
          const imageSrc = product.media ? `/${product.media.replace(/\\/g, '/')}` : null;
          return (
            <div key={product.id} className="product-card">
              <Link to={`/product/${product.id}`} className="product-link">
                <div className="product-image">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={product.name || ''}
                      className="product-image"
                    />
                  ) : (
                    placeholderSVG
                  )}
                </div>
                <h3 className="product-title">{product.name || 'Название товара'}</h3>
                <p className="product-price">
                  {product.price ? `${product.price}₽` : 'Цена не указана'}
                </p>
              </Link>
              <StarRating productId={product.id} currentRating={rating} />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HomePage;
