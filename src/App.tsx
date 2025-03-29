import React, { useEffect } from 'react';
import ConfigProvider from 'antd/lib/config-provider';
import ruRU from 'antd/lib/locale/ru_RU';
import OrderForm from './components/OrderForm';
import styled from 'styled-components';

// Обновленные стили контейнера для мобильной версии
const AppContainer = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
  min-height: 100vh;
  background-color: #f0f2f5;
  color: #000000;
  
  @media (min-width: 768px) {
    max-width: 500px;
    padding: 8px;
  }
`;

// Смартфон обертка
const PhoneFrame = styled.div`
  max-width: 100%;
  margin: 0 auto;
  overflow: hidden;
  background-color: #ffffff;
  height: 100vh;
  position: relative;
  
  @media (min-width: 768px) {
    max-width: 375px;
    height: 812px;
    border-radius: 40px;
    border: 12px solid #121212;
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.2);
    margin-top: 50px;
    margin-bottom: 50px;
    overflow-y: auto;
  }
`;

const App: React.FC = () => {
  useEffect(() => {
    // Инициализация Telegram Mini App
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      
      // Принудительно устанавливаем светлую тему
      if (window.Telegram.WebApp.setBackgroundColor) {
        window.Telegram.WebApp.setBackgroundColor('#ffffff');
      }
      
      if (window.Telegram.WebApp.setHeaderColor) {
        window.Telegram.WebApp.setHeaderColor('#ffffff');
      }
    }
  }, []);

  return (
    <ConfigProvider locale={ruRU}>
      <AppContainer>
        <PhoneFrame>
          <OrderForm />
        </PhoneFrame>
      </AppContainer>
    </ConfigProvider>
  );
};

export default App;
