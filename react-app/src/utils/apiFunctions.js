import { API_BASE_URL } from '../config';

// Кэш для рейтингов пользователя
let userRatingsCache = null;

/**
 * Загружает рейтинги пользователя и сохраняет их в кэше.
 * Возвращает объект вида: { [productId]: rating, ... }
 */
export const loadUserRatings = async () => {
  if (userRatingsCache !== null) return userRatingsCache; // уже загружено

  try {
    const userRes = await fetch(`${API_BASE_URL}/user/me`, { credentials: 'include' });
    if (!userRes.ok) return {};

    const userData = await userRes.json();
    const userId = userData.id;
    if (!userId) return {};

    const ratingsRes = await fetch(`${API_BASE_URL}/rating/user/${userId}`, { credentials: 'include' });
    if (!ratingsRes.ok) return {};

    const ratingsData = await ratingsRes.json();
    if (ratingsData.type !== 'success') return {};

    const ratings = ratingsData.data.ratings;
    userRatingsCache = {};
    ratings.forEach(([productId, rating]) => {
      userRatingsCache[productId] = rating;
    });

    return userRatingsCache;
  } catch (err) {
    console.error('Ошибка при загрузке рейтингов пользователя:', err);
    return {};
  }
};

/**
 * Возвращает текущий рейтинг для товара.
 */
export const getRating = (productId) =>
  userRatingsCache && productId in userRatingsCache ? userRatingsCache[productId] : 0;

/**
 * Отправляет новый рейтинг на сервер (application/x-www-form-urlencoded).
 * После успешного обновления обновляет кэш рейтингов.
 */
export const setRating = async (productId, rating) => {
  try {
    const formData = new URLSearchParams({ rating: String(rating) });

    const res = await fetch(`${API_BASE_URL}/rating/${productId}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const data = await res.json();
    if (data.type === 'success') {
      userRatingsCache = null;
      await loadUserRatings(); // Перезагружаем кэш
    } else {
      console.error('Ошибка при обновлении рейтинга:', data);
    }
    
    return res; // Возвращаем ответ, чтобы можно было обработать его в компоненте
  } catch (err) {
    console.error('Ошибка сети при обновлении рейтинга:', err);
    return { ok: false }; // Возвращаем объект с полем ok для обработки ошибок
  }
};

/**
 * Отображает уведомление пользователю.
 * Создаёт элемент уведомления, добавляет его в body и удаляет через 3.5 секунды.
 */
export const showNotification = (message, type = 'success') => {
  const notif = document.createElement('div');
  notif.className = `notification ${type}`;
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3500);
};

/**
 * Обновляет счётчик товаров в корзине.
 * Если в DOM есть элемент с id="cart-counter", его содержимое обновится.
 */
export const updateCartCounter = async (setCartCounter) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/`, { credentials: 'include' });
    const result = await response.json();
    if (result.type === 'success') {
      const totalQuantity = result.data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCounter(totalQuantity); // Обновляем количество товаров в корзине
    }
  } catch (err) {
    console.error('Ошибка при обновлении счётчика корзины:', err);
  }
};

/**
 * Простая проверка авторизации по кукам.
 * Возвращает true, если пользователь авторизован, иначе false.
 */
export const isLoggedIn = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/user/me`, { credentials: 'include' });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.id);
  } catch (e) {
    return false;
  }
};

/**
 * Навешивает обработчик для кнопки "Выйти".
 * При клике выполняется запрос logout, а затем перенаправление на /login.
 */
export const setupLogoutHandler = () => {
  const logoutLink = document.getElementById('logout-link');
  if (!logoutLink) return;
  logoutLink.addEventListener('click', async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Ошибка при выходе');
      const result = await response.json();
      console.log(result.msg || 'Вы успешно вышли из аккаунта!');
      window.location.href = '/login';
    } catch (err) {
      console.error('Не удалось выйти из аккаунта:', err);
    }
  });
};

/**
 * Показывает или скрывает ссылки в навигации в зависимости от авторизации.
 */
export const checkAuthLinks = async () => {
  const addProductLink = document.getElementById('add-product-link');
  const registerLink = document.getElementById('register-link');
  const loginLink = document.getElementById('login-link');
  const logoutLink = document.getElementById('logout-link');
  const profileLink = document.getElementById('profile-link');

  const loggedIn = await isLoggedIn();
  if (addProductLink) addProductLink.style.display = loggedIn ? 'inline-block' : 'none';
  if (registerLink) registerLink.style.display = loggedIn ? 'none' : 'inline-block';
  if (loginLink) loginLink.style.display = loggedIn ? 'none' : 'inline-block';
  if (logoutLink) logoutLink.style.display = loggedIn ? 'inline-block' : 'none';
  if (profileLink) profileLink.style.display = loggedIn ? 'inline-block' : 'none';
};
