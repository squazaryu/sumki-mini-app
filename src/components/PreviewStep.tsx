import React, { useState, useEffect } from 'react';
import { Typography, Button, Card, Table, Alert, Spin, Result } from 'antd/lib/index';
import styled from 'styled-components';
import { PreviewStepProps, TelegramUser } from '../types';
import axios from 'axios';

const { Title } = Typography;

// Стилизованные компоненты для мобильного интерфейса со светлой темой
const Container = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const StyledTitle = styled(Title)`
  text-align: center;
  margin-bottom: 20px !important;
  color: #000000 !important;
  font-size: 22px !important;
  
  @media (max-width: 320px) {
    font-size: 20px !important;
  }
`;

const StyledCard = styled(Card)`
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  
  .ant-table {
    background: transparent;
  }
  
  .ant-table-thead > tr > th {
    background-color: #f5f5f5;
    color: rgba(0, 0, 0, 0.65);
    font-weight: 500;
  }
  
  .ant-table-tbody > tr > td {
    color: #000000;
  }
  
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  @media (max-width: 576px) {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 10px 12px;
      font-size: 13px;
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
`;

const ActionButton = styled(Button)`
  min-width: 100px;
  height: 36px;
  border-radius: 10px;
  font-weight: 500;
  
  &.submit-button {
    background-color: #1890ff;
    border-color: #1890ff;
    color: #ffffff;
  }
`;

const CloseButton = styled(Button)`
  min-width: 100px;
  background-color: #F2F2F7;
  font-weight: 500;
  height: 36px;
  border-radius: 10px;
  box-shadow: none;
  border: 1px solid #E5E5EA;
  color: #000000;
  
  &:hover {
    border-color: #FF3B30;
    color: #FF3B30;
  }
`;

const PreviewStep: React.FC<PreviewStepProps> = ({ orderDetails, onBack, onClose }) => {
  // Инициализация Telegram Web App
  const tgWebApp = window.Telegram?.WebApp;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<TelegramUser | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [contactRequested, setContactRequested] = useState(false); // Флаг, что контакт запрошен
  const [showContactRequest, setShowContactRequest] = useState(false);
  
  // Сервер с прокси для отправки сообщений
  const SERVER_URL = "https://telegram-bot-webhook-proxy.vercel.app/api/send-message";
  
  // ID продавца и токен бота
  const SELLER_CHAT_ID = "50122963";
  const BOT_TOKEN = "7408506728:AAGK9d5kddSnMQDwgIYOiEK-6nPFFwgYP-M";
  
  // Перевод цветов на русский
  const colorTranslations: {[key: string]: string} = {
    'pink': 'Розовый',
    'red': 'Красный',
    'blue': 'Синий',
    'green': 'Зеленый',
    'yellow': 'Желтый',
    'black': 'Черный',
    'white': 'Белый',
    'purple': 'Фиолетовый',
    'orange': 'Оранжевый',
    'gray': 'Серый',
    'brown': 'Коричневый',
    'gold': 'Золотой',
    'silver': 'Серебряный',
    'darkred': 'Темно-красный',
    'darkblue': 'Темно-синий',
    'darkgreen': 'Темно-зеленый',
    '#f5222d': 'Красный',
    '#eb2f96': 'Розовый',
    '#722ed1': 'Фиолетовый',
    '#1890ff': 'Синий',
    '#13c2c2': 'Голубой',
    '#52c41a': 'Зеленый',
    '#fadb14': 'Желтый',
    '#fa8c16': 'Оранжевый',
    '#000000': 'Черный',
    '#8c8c8c': 'Серый',
    '#ffffff': 'Белый',
    '#8B0000': 'Темно-красный',
    '#00008B': 'Темно-синий',
    '#006400': 'Темно-зеленый',
    '#FFC0CB': 'Розовый'
  };
  
  // Перевод опций на русский
  const optionTranslations: {[key: string]: string} = {
    'clasp': 'Застежка',
    'lining': 'Подкладка',
    'chain': 'Цепочка',
    'short_handle': 'Короткая ручка',
    'long_handle': 'Длинная ручка',
    'pocket': 'Карман',
    'zipper': 'Молния',
    'embroidery': 'Вышивка',
    'custom_color': 'Индивидуальный цвет'
  };
  
  // Перевод форм на русский
  const shapeTranslations: {[key: string]: string} = {
    'kruglaya': 'Круглая',
    'pryamougolnaya': 'Прямоугольная',
    'kvadratnaya': 'Квадратная',
    'trapeciya': 'Трапеция',
    'mesyac': 'Месяц',
    'serdce': 'Сердце',
    'round': 'Круглая',
    'rectangular': 'Прямоугольная',
    'square': 'Квадратная',
    'trapezoid': 'Трапеция',
    'crescent': 'Месяц',
    'heart': 'Сердце'
  };
  
  // Перевод материалов на русский
  const materialTranslations: {[key: string]: string} = {
    'akril': 'Акрил',
    'hrustal': 'Хрусталь',
    'swarovski': 'Swarovski',
    'acrylic': 'Акрил',
    'crystal': 'Хрусталь'
  };
  
  // Загружаем информацию о пользователе при монтировании компонента
  useEffect(() => {
    let mainButtonClickHandler: (() => void) | null = null;
    try {
      if (tgWebApp?.initDataUnsafe?.user) {
        console.log("User data available:", tgWebApp.initDataUnsafe.user);
        setUserInfo(tgWebApp.initDataUnsafe.user as TelegramUser);
        setDebugInfo(prev => prev + `\nUser data: ${JSON.stringify(tgWebApp.initDataUnsafe.user)}`);
      } else {
        console.log("No user data available");
        setDebugInfo(prev => prev + '\nNo user data available');
      }
      
      console.log("Full WebApp data:", tgWebApp);
      setDebugInfo(prev => prev + `\nTelegram WebApp available: ${!!tgWebApp}`);
      
      if (tgWebApp) {
        setDebugInfo(prev => prev + `\nVersion: ${tgWebApp.version}`);
        setDebugInfo(prev => prev + `\nPlatform: ${tgWebApp.platform}`);
        
        // Настраиваем MainButton - всегда показываем независимо от userInfo
        if (tgWebApp.MainButton) {
          tgWebApp.MainButton.setText('Подтвердить заказ');
          tgWebApp.MainButton.show();
          tgWebApp.MainButton.color = '#1890ff';
          tgWebApp.MainButton.textColor = '#ffffff';
          
          mainButtonClickHandler = handleSubmit;
          tgWebApp.MainButton.onClick(mainButtonClickHandler);
          console.log("MainButton configured with handleSubmit");
          setDebugInfo(prev => prev + "\nMainButton configured with handleSubmit");
        }
      }
    } catch (e) {
      console.error("Error initializing component or accessing user data", e);
      setDebugInfo(prev => prev + `\nError initializing: ${e}`);
      setError("Произошла ошибка при инициализации. Попробуйте перезапустить приложение.");
    }
    
    // Очистка обработчика при размонтировании
    return () => {
      if (tgWebApp?.MainButton && mainButtonClickHandler) {
          tgWebApp.MainButton.offClick(mainButtonClickHandler);
      }
    };
  }, [tgWebApp]); // Убираем userInfo из зависимостей, чтобы кнопка настраивалась независимо от наличия данных

  // Функция форматирования для отображения данных заказа
  const formatOrderData = () => {
    console.log('Formatting order data from:', orderDetails);
    
    const formattedProduct = orderDetails.product === 'bag' ? 'Сумка' : 
                            orderDetails.product === 'coaster' ? 'Подстаканник' : 
                            orderDetails.product === 'custom' ? 'Индивидуальный заказ' : 
                            orderDetails.product || '';
    
    const formattedShape = orderDetails.shape ? (shapeTranslations[orderDetails.shape] || orderDetails.shape) : '';
    
    const formattedMaterial = orderDetails.material ? 
                             (materialTranslations[orderDetails.material] || orderDetails.material) : '';
    
    const formattedColor = orderDetails.color ? 
                          (colorTranslations[orderDetails.color] || orderDetails.color) : '';
    
    let formattedOptions = '';
    if (orderDetails.options && orderDetails.options.length > 0) {
      const translatedOptions = orderDetails.options.map(option => 
        optionTranslations[option] || option
      );
      formattedOptions = translatedOptions.join(', ');
    }
    
    const formattedDescription = orderDetails.customDescription || '';
    
    return {
      product: formattedProduct,
      size: orderDetails.size || '',
      shape: formattedShape,
      material: formattedMaterial,
      color: formattedColor,
      options: formattedOptions,
      customDescription: formattedDescription
    };
  };
  
  // Подготовка данных для таблицы
  const formattedOrderData = formatOrderData();
  const dataSource = [];
  
  // Тип изделия (обязательное поле)
  dataSource.push({
    key: 'product',
    parameter: 'Тип изделия',
    value: formattedOrderData.product
  });
  
  // Размер (только для сумок)
  if (orderDetails.product === 'bag' && formattedOrderData.size) {
    dataSource.push({
      key: 'size',
      parameter: 'Размер',
      value: formattedOrderData.size
    });
  }
  
  // Форма (только для сумок)
  if (orderDetails.product === 'bag' && formattedOrderData.shape) {
    dataSource.push({
      key: 'shape',
      parameter: 'Форма',
      value: formattedOrderData.shape
    });
  }
  
  // Материал
  if (formattedOrderData.material) {
    dataSource.push({
      key: 'material',
      parameter: 'Материал',
      value: formattedOrderData.material
    });
  }
  
  // Цвет
  if (formattedOrderData.color) {
    dataSource.push({
      key: 'color',
      parameter: 'Цвет',
      value: formattedOrderData.color
    });
  }
  
  // Дополнительные опции
  if (formattedOrderData.options) {
    dataSource.push({
      key: 'options',
      parameter: 'Дополнительные опции',
      value: formattedOrderData.options
    });
  }
  
  // Описание пользовательского заказа
  if (formattedOrderData.customDescription) {
    dataSource.push({
      key: 'customDescription',
      parameter: 'Описание',
      value: formattedOrderData.customDescription
    });
  }
  
  // Определение колонок таблицы
  const columns = [
    {
      title: '',
      dataIndex: 'parameter',
      key: 'parameter',
      width: '40%',
    },
    {
      title: '',
      dataIndex: 'value',
      key: 'value',
      width: '60%',
    }
  ];

  // Функция для генерации текста заказа при отправке  
  const generateOrderText = (orderData: any, contactInfo: TelegramUser | null, sharedPhoneNumber?: string) => {
    // Отладочная информация - выводим все полученные данные
    console.log("Full orderData received:", JSON.stringify(orderData, null, 2));
    console.log("User info:", JSON.stringify(contactInfo, null, 2));
    
    let orderText = "🛍️ *Новый заказ из мини-приложения*\n\n";
    
    orderText += "*Детали заказа:*\n";
    
    // Более детальные и понятные названия параметров на русском
    const keyMapping: {[key: string]: string} = {
      product: 'Продукт',
      size: 'Размер',
      shape: 'Форма',
      material: 'Материал бусин',
      color: 'Цвет',
      options: 'Дополнительные опции',
      customDescription: 'Описание индивидуального заказа'
    };
    
    // Более детальное преобразование продукта в человекочитаемый формат
    if (orderData.product) {
      if (orderData.product === 'bag') {
        orderData = { ...orderData, product: 'Сумка' };
      } else if (orderData.product === 'coaster') {
        orderData = { ...orderData, product: 'Подстаканник' };
      } else if (orderData.product === 'custom') {
        orderData = { ...orderData, product: 'Индивидуальный заказ' };
      }
    }
    
    // Форматируем и преобразуем каждое поле к читаемому виду
    Object.entries(orderData).forEach(([key, value]) => {
      const displayKey = keyMapping[key] || key;
      
      // Преобразуем ID формы/материала в читаемый текст
      let displayValue = value;
      if (key === 'shape' && typeof value === 'string') {
        displayValue = shapeTranslations[value] || value;
      } else if (key === 'material' && typeof value === 'string') {
        displayValue = materialTranslations[value] || value;
      } else if (Array.isArray(value)) {
        // Форматируем вывод массивов (options) - теперь каждая опция с новой строки
        if (value.length > 0) {
          displayValue = "\n  • " + value.join("\n  • ");
        } else {
          displayValue = 'Не выбраны';
        }
      }
      
      // Добавляем поле в текст заказа только если значение не пустое
      if (value && !(typeof displayValue === 'string' && displayValue.trim() === '')) {
        if (key === 'options' && Array.isArray(value) && value.length > 0) {
          // Для опций делаем особый формат - список с точками
          orderText += `- ${displayKey}:${displayValue}\n`;
        } else {
          orderText += `- ${displayKey}: ${displayValue}\n`;
        }
      }
    });
    
    orderText += "\n*Данные клиента:*\n";
    if (contactInfo) {
      orderText += `- ID: ${contactInfo.id}\n`;
      orderText += `- Имя: ${contactInfo.first_name}${contactInfo.last_name ? ' ' + contactInfo.last_name : ''}\n`;
      if (contactInfo.username) {
        orderText += `- Username: @${contactInfo.username}\n`;
      }
    }
    
    // Добавляем номер телефона, если он был предоставлен
    if (sharedPhoneNumber) {
        orderText += `- Телефон: ${sharedPhoneNumber}\n`;
    }
    
    // Логируем окончательный текст заказа для отладки
    console.log("Final order text:", orderText);
    
    return orderText;
  };

  const handleSubmit = async () => {
    console.log("Начало handleSubmit");
    setDebugInfo(prev => prev + "\nhandleSubmit triggered");

    if (!tgWebApp) {
      console.error("Telegram WebApp не инициализирован!");
      setError("Ошибка: Не удалось получить доступ к Telegram WebApp.");
      setDebugInfo(prev => prev + "\nError: Telegram WebApp not initialized");
      return;
    }

    // Показываем индикатор загрузки на кнопке
    tgWebApp.MainButton.showProgress(false);
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    // Собираем данные для отправки
    const orderDataToSend = {
      ...orderDetails, 
      // Добавляем информацию о пользователе, если она есть
      user: userInfo ? {
        id: userInfo.id,
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        username: userInfo.username,
        language_code: userInfo.language_code
      } : null,
      // Добавляем контакт, если он был получен (важно)
      contact: orderDetails.contact // Используем сохраненный контакт, если он есть
    };
    
    // --- ЛОГИРОВАНИЕ ДАННЫХ ПЕРЕД ОТПРАВКОЙ --- 
    console.log("!!!!!!!! Данные для отправки (orderDataToSend):", JSON.stringify(orderDataToSend, null, 2));
    setDebugInfo(prev => prev + `\nData to send: ${JSON.stringify(orderDataToSend)}`);
    // -------------------------------------------

    try {
      // Отправляем данные в бот через метод WebApp
      tgWebApp.sendData(JSON.stringify(orderDataToSend));
      console.log("Данные успешно отправлены через tgWebApp.sendData");
      setDebugInfo(prev => prev + "\nData sent via tgWebApp.sendData");
      
      // --- ВАЖНО: Здесь НЕ НУЖНО отправлять через прокси, если используем sendData! --- 
      // sendData уже отправляет данные в бот.
      // Отправка через прокси используется, если нужно отправить что-то напрямую 
      // продавцу или выполнить другое серверное действие, не связанное 
      // с передачей данных от WebApp к боту.
      
      setSuccess(true);
      setError(null);

    } catch (e) {
      console.error('Ошибка при отправке данных через tgWebApp.sendData:', e);
      setError('Произошла ошибка при отправке заказа. Попробуйте еще раз.');
      setDebugInfo(prev => prev + `\nError sending data via tgWebApp.sendData: ${e}`);
    } finally {
      // Скрываем индикатор загрузки
      tgWebApp.MainButton.hideProgress();
      setIsSubmitting(false);
      
      // Не скрываем кнопку сразу, чтобы пользователь видел результат
      // tgWebApp.MainButton.hide(); 
    }
  };

  // Запрос контактных данных у пользователя
  const requestContact = () => {
    setShowContactRequest(true);
    setDebugInfo(prev => prev + '\nContact request shown');
    
    // В Telegram Web App нет прямого метода запроса контактов
    // Поэтому показываем сообщение с просьбой поделиться контактом через бота
    if (tgWebApp) {
      tgWebApp.expand(); // Разворачиваем мини-приложение на полный экран
      
      // Показываем нативный алерт в Telegram
      tgWebApp.showAlert(
        "Для завершения заказа нам необходимы ваши контактные данные. Пожалуйста, перейдите в бота и поделитесь своим контактом через кнопку 'Поделиться контактом'.",
        () => {
          // После закрытия алерта, добавляем кнопку для продолжения
          setShowContactRequest(true);
          setDebugInfo(prev => prev + '\nAlert shown to user');
        }
      );
    }
  };

  // Отображение состояния загрузки, успеха или ошибки
  if (isSubmitting) {
    return <Container style={{ alignItems: 'center', justifyContent: 'center', height: '80vh' }}><Spin size="large" tip="Отправка заказа..." /></Container>;
  }

  if (success) {
    return (
      <Result
        status="success"
        title="Заказ успешно отправлен!"
        subTitle="Спасибо за ваш заказ! Мы скоро свяжемся с вами."
        extra={[
          <Button type="primary" key="close" onClick={() => tgWebApp?.close()}>
            Закрыть
          </Button>,
        ]}
      />
    );
  }

  return (
    <Container>
      <StyledTitle level={3}>Подтверждение заказа</StyledTitle>
      
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} closable onClose={() => setError(null)} />}
      
      {/* Вывод отладочной информации */} 
      {/* <Alert message={<pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{debugInfo}</pre>} type="info" style={{ marginBottom: '16px' }} /> */}
      
      <StyledCard title="Детали вашего заказа">
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          bordered
          size="small"
        />
      </StyledCard>
      
      {userInfo && (
        <StyledCard title="Ваши данные">
           <p><strong>ID:</strong> {userInfo.id}</p>
           <p><strong>Имя:</strong> {userInfo.first_name} {userInfo.last_name || ''}</p>
           {userInfo.username && <p><strong>Username:</strong> @{userInfo.username}</p>}
        </StyledCard>
      )}

      <ButtonContainer>
        <ActionButton onClick={onBack} disabled={isSubmitting}>Назад</ActionButton>
        {/* Кнопка подтверждения теперь управляется через tgWebApp.MainButton */} 
        {/* <ActionButton 
          type="primary" 
          onClick={handleSubmit} 
          loading={isSubmitting} 
          disabled={!userInfo} // Деактивируем, если нет данных пользователя
          className="submit-button"
        >
          Подтвердить и отправить контакт
        </ActionButton> */} 
      </ButtonContainer>
      
      {/* Убрана форма ручного ввода */}
      
    </Container>
  );
};

export default PreviewStep; 