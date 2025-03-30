import React, { createContext, useState, useContext, useEffect } from 'react';
import { updateCartCounter } from '../utils/apiFunctions';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartCounter, setCartCounter] = useState(0);

  // Функция для обновления счетчика корзины
  const updateCart = async () => {
    await updateCartCounter(setCartCounter); // Получаем актуальное количество товаров в корзине
  };

  // Возвращаем контекст с состоянием и функцией обновления
  useEffect(() => {
    updateCart(); // Обновляем счетчик при монтировании
  }, []);

  return (
    <CartContext.Provider value={{ cartCounter, updateCart }}>
      {children}
    </CartContext.Provider>
  );
};
