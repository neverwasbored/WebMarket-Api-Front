import { API_BASE_URL } from 'config';

/**
 * Инициализация приложения
 */
export function initApp() {
  // Навешиваем обработчики кликов на ссылки навигации для работы через History API
  setupNavLinks();

  setupLogoutHandler();
  checkAuthLinks();
  window.addEventListener('popstate', router); // Для кнопок "Назад/Вперёд" браузера
  router();
  updateCartCounter(); // Обновляем счетчик сразу при запуске
}

/**
 * Навешивает обработчик кликов на все навигационные ссылки
 * для работы без хеша, используя history.pushState
 */
function setupNavLinks() {
  const navLinks = document.querySelectorAll('nav a.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const url = this.getAttribute('href');
      history.pushState(null, '', url);
      router();
    });
  });
}

/**
 * Функция показа уведомления пользователю (при добавлении товара)
 */
function showNotification(message, type = 'success') {
  const notif = document.createElement('div');
  notif.className = 'notification ' + type;
  notif.textContent = message;
  document.body.appendChild(notif);
  // Удаление уведомления после завершения анимации (3.5 секунды)
  setTimeout(() => {
    if (notif.parentNode) {
      notif.parentNode.removeChild(notif);
    }
  }, 3500);
}

/**
 * Обновление счетчика товаров в корзине
 */
async function updateCartCounter() {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/`, { credentials: 'include' });
    const result = await response.json();
    if (result.type === 'success') {
      let totalQuantity = 0;
      result.data.forEach(item => {
        totalQuantity += item.quantity;
      });
      const counterElem = document.getElementById('cart-counter');
      if (counterElem) {
        counterElem.textContent = totalQuantity;
      }
    }
  } catch (err) {
    console.error('Ошибка при обновлении счетчика корзины:', err);
  }
}

/**
 * Обработчик кнопки "Выйти"
 */
function setupLogoutHandler() {
  const logoutLink = document.getElementById('logout-link');
  if (!logoutLink) return;
  logoutLink.addEventListener('click', async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Ошибка при выходе');
      const result = await response.json();
      console.log(result.msg || 'Вы успешно вышли из аккаунта!');
      checkAuthLinks();
      history.pushState(null, '', '/login');
      router();
    } catch (err) {
      console.error('Не удалось выйти из аккаунта:', err);
    }
  });
}

/**
 * Показываем/скрываем ссылки в навигации в зависимости от авторизации
 * Скрываем также ссылку "Профиль" для неавторизованных пользователей.
 */
function checkAuthLinks() {
  const addProductLink = document.getElementById('add-product-link');
  const registerLink = document.getElementById('register-link');
  const loginLink = document.getElementById('login-link');
  const logoutLink = document.getElementById('logout-link');
  const profileLink = document.getElementById('profile-link');
  const loggedIn = isLoggedIn();
  
  if (addProductLink) {
    addProductLink.style.display = loggedIn ? 'inline-block' : 'none';
  }
  if (registerLink) {
    registerLink.style.display = loggedIn ? 'none' : 'inline-block';
  }
  if (loginLink) {
    loginLink.style.display = loggedIn ? 'none' : 'inline-block';
  }
  if (logoutLink) {
    logoutLink.style.display = loggedIn ? 'inline-block' : 'none';
  }
  if (profileLink) {
    profileLink.style.display = loggedIn ? 'inline-block' : 'none';
  }
}

/**
 * Простая проверка авторизации по кукам
 */
async function isLoggedIn() {
  try {
    const res = await fetch(`${API_BASE_URL}/user/me`, { credentials: 'include' });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.id;
  } catch (e) {
    return false;
  }
}

/**
 * Роутер на основе History API.
 * Путь берётся из location.pathname.
 */
function router() {
  const path = window.location.pathname || '/';
  const app = document.getElementById('app');
  app.innerHTML = '';
  
  if (path === '/' || path === '/home') {
    renderHomePage(app);
  } else if (path === '/profile') {
    renderProfilePage(app);
  } else if (path === '/cart') {
    renderCartPage(app);
  } else if (path === '/register') {
    renderRegisterPage(app);
  } else if (path === '/login') {
    renderLoginPage(app);
  } else if (path === '/add-product') {
    renderAddProductPage(app);
  } else if (path.startsWith('/product/')) {
    // Например, /product/1
    const segments = path.split('/');
    const productId = segments[2];
    renderProductPage(app, productId);
  } else {
    app.innerHTML = `<h2>404 - Страница не найдена</h2>`;
  }
}

/* ======================
   Главная страница
   ====================== */
async function renderHomePage(app) {
  const section = document.createElement('section');
  section.className = 'home-page';
  const grid = document.createElement('div');
  grid.className = 'products-grid';
  section.appendChild(grid);
  grid.innerHTML = '<p>Загрузка товаров...</p>';
  try {
    const response = await fetch(`${API_BASE_URL}/products/`, { credentials: 'include' });
    const result = await response.json();
    if (result.type !== 'success') {
      grid.innerHTML = '<p>Ошибка получения данных</p>';
      console.error('Ответ сервера:', result);
      return;
    }
    const items = result.data.items;
    grid.innerHTML = '';
    if (!items || items.length === 0) {
      grid.innerHTML = '<p>Нет товаров для отображения</p>';
      return;
    }
    const limited = items.slice(0, 12);
    limited.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      let imageHTML = placeholderSVG();
      if (product.media) {
        const normalizedPath = product.media.replace(/\\/g, '/');
        imageHTML = `<img src="/${normalizedPath}" alt="${product.name || ''}" width="100" height="100" style="object-fit: cover;" />`;
      }
      card.innerHTML = `
        <a href="/product/${product.id}" class="product-link">
          <div class="product-image">${imageHTML}</div>
          <h3 class="product-title">${product.name || 'Название товара'}</h3>
          <p class="product-price">${product.price ? product.price + '₽' : 'Цена не указана'}</p>
        </a>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = '<p>Ошибка загрузки товаров</p>';
    console.error(err);
  }
  app.appendChild(section);
}

/* ======================
   Страница товара (детали)
   ====================== */
async function renderProductPage(app, productId) {
  const section = document.createElement('section');
  section.className = 'product-detail-page';
  section.innerHTML = `<p>Загрузка данных о товаре...</p>`;
  app.appendChild(section);
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, { credentials: 'include' });
    const result = await response.json();
    if (result.type !== 'success') {
      section.innerHTML = `<p>Ошибка: ${result.msg || 'Товар не найден'}</p>`;
      console.error('Ответ сервера:', result);
      return;
    }
    const product = result.data;
    section.innerHTML = `
      <h2 class="product-title">${product.name}</h2>
      <div class="product-detail-wrapper">
        <div class="product-detail-image">
          ${renderProductImage(product)}
        </div>
        <div class="product-detail-info">
          <p class="product-price"><strong>Цена:</strong> ${product.price ? product.price + '₽' : 'Цена не указана'}</p>
          <p class="product-description"><strong>Описание:</strong> ${product.description || 'Нет описания'}</p>
          <!-- Вместо отдельного <p> для даты, обернём и дату, и кнопку в .product-detail-footer -->
          <div class="product-detail-footer">
            <p class="product-created"><em>Создан: ${new Date(product.created_at).toLocaleString()}</em></p>
            <button id="add-to-cart-btn" class="add-to-cart-button">Добавить в корзину</button>
          </div>
        </div>
      </div>
    `;
    const addToCartBtn = section.querySelector('#add-to-cart-btn');
    addToCartBtn.addEventListener('click', () => {
      addToCart(product.id);
    });
  } catch (err) {
    section.innerHTML = '<p>Ошибка при загрузке товара</p>';
    console.error(err);
  }
}

/**
 * Функция добавления товара в корзину (AJAX)
 */
async function addToCart(productId) {
  try {
    const res = await fetch(`${API_BASE_URL}/cart/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId })
    });
    if (!res.ok) throw new Error('Ошибка при добавлении в корзину');
    const data = await res.json();
    showNotification(data.msg || 'Товар добавлен в корзину');
    updateCartCounter();
  } catch (err) {
    console.error('Ошибка при добавлении в корзину:', err);
    showNotification('Ошибка при добавлении в корзину', 'error');
  }
}

/**
 * Вспомогательная функция рендеринга картинки товара
 */
function renderProductImage(product) {
  if (!product.media) {
    return placeholderSVG();
  }
  const normalizedPath = product.media.replace(/\\/g, '/');
  return `
    <img src="/${normalizedPath}" alt="${product.name || ''}" width="200" height="200" style="object-fit: cover;" />
  `;
}

/**
 * Заглушка для картинки (SVG)
 */
function placeholderSVG() {
  return `
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#E0E0E0"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#888" font-size="12">Изображение</text>
    </svg>
  `;
}

/* ======================
   Страница профиля
   ====================== */
   function renderProfilePage(app) {
    const section = document.createElement('section');
    section.className = 'profile-page';
    section.innerHTML = `<h2>Профиль</h2><p>Загрузка данных профиля...</p>`;
    app.appendChild(section);
  
    // Запрос профиля
    fetch(`${API_BASE_URL}/user/me`, { credentials: 'include' })
      .then(response => response.json())
      .then(result => {
        if (!result.id) {
          section.innerHTML = `<h2>Профиль</h2><p>Ошибка загрузки профиля</p>`;
          return;
        }
        const { id, username, email, created_at } = result;
        section.innerHTML = `
          <h2>Профиль</h2>
          <div class="profile-info">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Дата регистрации:</strong> ${new Date(created_at).toLocaleString()}</p>
          </div>
          <form id="profile-form">
            <label>Имя пользователя:
              <input type="text" name="username" value="${username}" required />
            </label>
            <label>Новый пароль:
              <input type="password" name="password" placeholder="Введите новый пароль" />
            </label>
            <label>Подтверждение пароля:
              <input type="password" name="confirm_password" placeholder="Повторите новый пароль" />
            </label>
            <button type="submit">Обновить профиль</button>
          </form>
          <div id="profile-message" style="margin-top:10px;"></div>
        `;
        
        const form = section.querySelector('#profile-form');
        form.addEventListener('submit', async (event) => {
          event.preventDefault();
          const formData = new FormData(form);
          const newUsername = formData.get('username').trim();
          const password = formData.get('password').trim();
          const confirmPassword = formData.get('confirm_password').trim();
  
          if (password !== confirmPassword) {
            document.getElementById('profile-message').textContent = 'Пароли не совпадают!';
            return;
          }
  
          const payload = { username: newUsername };
          if (password) {
            payload.password = password;
          }
  
          try {
            const updateResponse = await fetch(`${API_BASE_URL}/user/me`, {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            const updateResult = await updateResponse.json();
            const messageElem = document.getElementById('profile-message');
            if (updateResponse.ok && updateResult.type === 'success') {
              messageElem.style.color = '#2ECC71';
              messageElem.textContent = updateResult.msg || 'Профиль успешно обновлён';
            } else {
              messageElem.style.color = '#E74C3C';
              messageElem.textContent = updateResult.msg || 'Ошибка обновления профиля';
            }
          } catch (err) {
            console.error('Ошибка обновления профиля:', err);
            document.getElementById('profile-message').textContent = 'Ошибка обновления профиля';
          }
        });
      })
      .catch(err => {
        console.error('Ошибка загрузки профиля:', err);
        section.innerHTML = `<h2>Профиль</h2><p>Ошибка загрузки профиля</p>`;
      });
  }
  
/* ======================
   Страница корзины
   ====================== */
async function renderCartPage(app) {
  const section = document.createElement('section');
  section.className = 'cart-page';
  section.innerHTML = `<h2>Корзина</h2><p>Загрузка корзины...</p>`;
  if (!isLoggedIn()) {
    section.innerHTML = `<h2>Корзина</h2>
      <p>Вы не авторизованы. <a href="/login">Войдите</a>, чтобы посмотреть корзину.</p>`;
    app.appendChild(section);
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/cart/`, { credentials: 'include' });
    const result = await response.json();
    if (result.type !== 'success') {
      section.innerHTML = `<p>Ошибка: ${result.msg || 'Неизвестная ошибка'}</p>`;
      console.error('Ответ сервера:', result);
      app.appendChild(section);
      return;
    }
    const cartItems = result.data;
    section.innerHTML = '<h2>Корзина</h2>';
    if (!cartItems || cartItems.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.textContent = 'Ваша корзина пуста.';
      section.appendChild(emptyMsg);
      app.appendChild(section);
      return;
    }
    // Расчёт суммарного количества товаров и общей суммы
    let totalQuantity = 0;
    let totalSum = 0;
    cartItems.forEach(item => {
      totalQuantity += item.quantity;
      const productPrice = item.product && item.product.price ? parseFloat(item.product.price) : 0;
      totalSum += productPrice * item.quantity;
    });
    // Вывод информации о количестве товаров
    const quantityInfo = document.createElement('p');
    quantityInfo.className = 'cart-quantity-info';
    quantityInfo.textContent = `Количество товаров: ${totalQuantity}`;
    section.appendChild(quantityInfo);

    const table = document.createElement('table');
    table.className = 'cart-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Товар</th>
          <th>Цена</th>
          <th>Количество</th>
          <th>Сумма</th>
          <th>Удалить</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    section.appendChild(table);
    const tbody = table.querySelector('tbody');
    cartItems.forEach(item => {
      const productName = item.product ? item.product.name : 'Без названия';
      const productPrice = item.product && item.product.price ? parseFloat(item.product.price) : 0;
      const quantity = item.quantity;
      const rowSum = productPrice * quantity;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${productName}</td>
        <td>${productPrice ? productPrice.toFixed(2) + '₽' : '—'}</td>
        <td>
          <div class="quantity-controls" data-product-id="${item.product ? item.product.id : ''}">
            <button class="quantity-btn minus">-</button>
            <span class="quantity-value">${quantity}</span>
            <button class="quantity-btn plus">+</button>
          </div>
        </td>
        <td>${rowSum ? rowSum.toFixed(2) + '₽' : '—'}</td>
        <td><button class="remove-from-cart">X</button></td>
      `;
      const quantityWrapper = tr.querySelector('.quantity-controls');
      const minusBtn = quantityWrapper.querySelector('.minus');
      const plusBtn = quantityWrapper.querySelector('.plus');
      minusBtn.addEventListener('click', async () => {
        await updateCartQuantity(item.product.id, -1);
      });
      plusBtn.addEventListener('click', async () => {
        await updateCartQuantity(item.product.id, 1);
      });
      const removeBtn = tr.querySelector('.remove-from-cart');
      removeBtn.addEventListener('click', async () => {
        await removeFromCart(item.product.id);
      });
      tbody.appendChild(tr);
    });
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'cart-summary';
    summaryDiv.innerHTML = `
      <div class="total-sum">Общая сумма: ${totalSum.toFixed(2)}₽</div>
      <button class="pay-button">Оплатить</button>
    `;
    summaryDiv.querySelector('.pay-button').addEventListener('click', () => {
      console.log('Переходим к оплате...');
      // Здесь можно добавить вызов функции оплаты или переход на страницу оплаты
    });
    section.appendChild(summaryDiv);
  } catch (err) {
    section.innerHTML = `<p>Ошибка загрузки корзины</p>`;
    console.error(err);
  }
  app.appendChild(section);
}

/**
 * Функция обновления количества товара в корзине (AJAX)
 * Оповещение при изменении количества не выводится.
 */
async function updateCartQuantity(productId, quantity) {
  try {
    const res = await fetch(`${API_BASE_URL}/cart/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity })
    });
    if (!res.ok) throw new Error('Не удалось обновить корзину');
    console.log('Корзина обновлена');
    router();
    updateCartCounter();
  } catch (err) {
    console.error('Ошибка при обновлении количества:', err);
  }
}

/**
 * Удаление товара из корзины (AJAX)
 */
async function removeFromCart(productId) {
  try {
    const res = await fetch(`${API_BASE_URL}/cart/${productId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('Ошибка при удалении из корзины');
    }
    const data = await res.json();
    console.log(data.msg || 'Товар удалён из корзины');
    router();
    updateCartCounter();
  } catch (err) {
    console.error('Ошибка при удалении товара из корзины:', err);
  }
}

/* ======================
   Страница регистрации
   ====================== */
function renderRegisterPage(app) {
  const section = document.createElement('section');
  section.className = 'register-page';
  section.innerHTML = `
    <h2>Регистрация</h2>
    <form id="register-form">
      <label>Email:
        <input type="email" name="email" required />
      </label>
      <label>Имя пользователя:
        <input type="text" name="username" required />
      </label>
      <label>Пароль:
        <input type="password" name="password" required />
      </label>
      <label>Подтверждение пароля:
        <input type="password" name="confirm_password" required />
      </label>
      <button type="submit">Зарегистрироваться</button>
    </form>
    <p>Уже есть аккаунт? <a href="/login">Войдите</a></p>
  `;
  section.querySelector('#register-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');
    if (password !== confirmPassword) {
      console.error('Пароли не совпадают!');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const response = await res.json();
      if (response.type === 'success') {
        console.log('Регистрация успешна');
        history.pushState(null, '', '/login');
        router();
      } else {
        console.error(response.msg || 'Ошибка регистрации');
      }
    } catch (err) {
      console.error('Ошибка регистрации:', err);
    }
  });
  app.appendChild(section);
}

/* ======================
   Страница авторизации
   ====================== */
function renderLoginPage(app) {
  const section = document.createElement('section');
  section.className = 'login-page';
  section.innerHTML = `
    <h2>Авторизация</h2>
    <form id="login-form">
      <label>Email:
        <input type="email" name="email" required>
      </label>
      <label>Пароль:
        <input type="password" name="password" required>
      </label>
      <button type="submit">Войти</button>
    </form>
    <p>Нет аккаунта? <a href="/register">Зарегистрироваться</a></p>
  `;
  section.querySelector('#login-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) {
        throw new Error('Ошибка авторизации');
      }
      const result = await response.json();
      if (result.type === 'success') {
        console.log('Вход выполнен успешно');
        checkAuthLinks();
        history.pushState(null, '', '/');
        router();
      } else {
        console.error(result.msg || 'Ошибка авторизации');
      }
    } catch (err) {
      console.error('Ошибка авторизации:', err);
    }
  });
  app.appendChild(section);
}

/* ======================
   Страница добавления товара
   ====================== */
function renderAddProductPage(app) {
  if (!isLoggedIn()) {
    app.innerHTML = `<p>Вы не авторизованы. <a href="/login">Войдите</a>, чтобы добавить товар.</p>`;
    return;
  }
  const section = document.createElement('section');
  section.className = 'add-product-page';
  section.innerHTML = `
    <h2>Добавить новый товар</h2>
    <form id="add-product-form" enctype="multipart/form-data">
      <label>Название:
        <input type="text" name="name" required>
      </label>
      <label>Описание:
        <textarea name="description"></textarea>
      </label>
      <label>Цена:
        <input type="number" name="price" step="0.01" required>
      </label>
      <label>Изображение:
        <input type="file" name="media" accept="image/*" required>
      </label>
      <button type="submit">Добавить товар</button>
    </form>
  `;
  section.querySelector('#add-product-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    try {
      const response = await fetch(`${API_BASE_URL}/products/`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!response.ok) {
        throw new Error('Ошибка при добавлении товара');
      }
      const data = await response.json();
      console.log(data.msg || 'Товар успешно добавлен');
      history.pushState(null, '', '/');
      router();
    } catch (err) {
      console.error('Ошибка при добавлении товара:', err);
    }
  });
  app.appendChild(section);
}
