import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';  // Импортируем useNavigate
import { API_BASE_URL } from '../config';
import { useAuth } from '../utils/AuthContext';
import { loadUserRatings, getRating, showNotification } from '../utils/apiFunctions';
import { useCart } from '../utils/CartContext';
import StarRating from '../components/StarRating';
import '../styles.css';

const ProductPage = () => {
  const { id: productId } = useParams();
  const { userId, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);

  const { updateCart } = useCart();

  const navigate = useNavigate();  // Хук для навигации

  useEffect(() => {
    if (isAuthenticated && userId) {
      const adminIds = process.env.REACT_APP_ADMIN_IDS.split(',').map(id => parseInt(id.trim(), 10));
      setIsAdmin(adminIds.includes(parseInt(userId, 10)));
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${productId}`, { credentials: 'include' });
        const data = await res.json();
        if (data.type === 'success') {
          setProduct(data.data);
          await loadUserRatings();
        } else {
          setError(data.msg || 'Ошибка загрузки товара');
        }
      } catch (err) {
        console.error('Ошибка загрузки товара:', err);
        setError('Ошибка загрузки товара');
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const currentRating = getRating(productId);

  const handleAddToCart = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/cart/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity }),
      });

      if (!res.ok) {
        showNotification('Ошибка при добавлении в корзину', 'error');
        return;
      }

      const data = await res.json();
      showNotification(data.msg || 'Товар добавлен в корзину');
      updateCart();
    } catch (err) {
      console.error('Ошибка при добавлении в корзину:', err);
      showNotification('Ошибка при добавлении в корзину', 'error');
    }
  };

  const handleDeleteProduct = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        showNotification('Ошибка при удалении товара', 'error');
        return;
      }

      const data = await res.json();
      showNotification(data.msg || 'Товар удален');

      // Перенаправляем на главную страницу
      navigate('/');
    } catch (err) {
      console.error('Ошибка при удалении товара:', err);
      showNotification('Ошибка при удалении товара', 'error');
    }
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  if (loading) return <p className="loading-msg">Загрузка данных о товаре...</p>;
  if (error) return <p className="error-msg">{error}</p>;
  if (!product) return <p className="error-msg">Товар не найден</p>;

  const imageSrc = product.media ? `/${product.media.replace(/\\/g, '/')}` : null;

  return (
    <section className="product-detail-page">
      <div className="product-detail-container">
        <div className="product-detail-image">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.name || ''}
              className="product-image"
            />
          ) : (
            <div className="product-image-placeholder">
              <svg width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="#E0E0E0" />
                <text
                  x="50%"
                  y="55%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="#888"
                  fontSize="12"
                >
                  Изображение
                </text>
              </svg>
            </div>
          )}
          <StarRating productId={product.id} currentRating={currentRating} />
        </div>
        <div className="product-detail-info">
          <h2 className="product-title">{product.name}</h2>
          <p className="product-price">
            <strong>Цена:</strong> {product.price ? `${product.price}₽` : 'Цена не указана'}
          </p>
          <p className="product-description">
            <strong>Описание:</strong> {product.description || 'Нет описания'}
          </p>
          <div className="product-detail-footer">
            <p className="product-created">
              <em>Создан: {new Date(product.created_at).toLocaleString()}</em>
            </p>
            <div className="quantity-controls">
              <button onClick={decreaseQuantity}>-</button>
              <input
                type="number"
                className="quantity-input"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
              />
              <button onClick={increaseQuantity}>+</button>
            </div>
            <button id="add-to-cart-btn" className="add-to-cart-button" onClick={handleAddToCart}>
              Добавить в корзину
            </button>
            {isAdmin && (
              <button
                id="delete-product-btn"
                className="delete-product-button"
                onClick={handleDeleteProduct}
              >
                Удалить товар
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductPage;
