import React from 'react';
import { OrderDetails } from '../../types';
import { Typography, Space, Button, Card, Image } from 'antd/lib/index';
import styled from 'styled-components';

const { Title, Text } = Typography;

interface PreviewStepProps {
  orderDetails: OrderDetails;
  onSubmit: () => void;
  onBack: () => void;
}

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

const PreviewStep: React.FC<PreviewStepProps> = ({ orderDetails, onSubmit, onBack }) => {
  const calculateTotalPrice = () => {
    let basePrice = 0;

    // Базовая цена в зависимости от типа продукта
    switch (orderDetails.product) {
      case 'bag':
        basePrice = 2000;
        break;
      case 'coaster':
        basePrice = 1000;
        break;
      case 'custom':
        basePrice = 3000;
        break;
    }

    // Дополнительная стоимость за размер
    if (orderDetails.size) {
      switch (orderDetails.size) {
        case 'S':
          basePrice += 500;
          break;
        case 'M':
          basePrice += 1000;
          break;
        case 'L':
          basePrice += 1500;
          break;
      }
    }

    // Дополнительная стоимость за опции
    if (orderDetails.options) {
      basePrice += orderDetails.options.length * 500;
    }

    return basePrice;
  };

  const renderProductDetails = () => {
    if (orderDetails.product === 'custom') {
      return (
        <>
          <Title level={4}>Описание заказа</Title>
          <Text>{orderDetails.customDescription}</Text>
        </>
      );
    }

    return (
      <>
        {orderDetails.size && (
          <>
            <Title level={4}>Размер</Title>
            <Text>{orderDetails.size}</Text>
          </>
        )}
        {orderDetails.shape && (
          <>
            <Title level={4}>Форма</Title>
            <Text>{orderDetails.shape}</Text>
          </>
        )}
        {orderDetails.material && (
          <>
            <Title level={4}>Материал</Title>
            <Text>{orderDetails.material}</Text>
          </>
        )}
        {orderDetails.color && (
          <>
            <Title level={4}>Цвет</Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: orderDetails.color,
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px'
                }}
              />
              <Text>{orderDetails.color}</Text>
            </div>
          </>
        )}
        {orderDetails.options && orderDetails.options.length > 0 && (
          <>
            <Title level={4}>Дополнительные опции</Title>
            <ul>
              {orderDetails.options.map((option, index) => (
                <li key={index}>{option}</li>
              ))}
            </ul>
          </>
        )}
      </>
    );
  };

  return (
    <div className="preview-step">
      <Title level={2}>Предпросмотр заказа</Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <StyledCard>
          <Title level={4}>Тип изделия</Title>
          <Text>
            {orderDetails.product === 'bag' ? 'Сумка' : 
             orderDetails.product === 'coaster' ? 'Подстаканник' : 'Индивидуальный заказ'}
          </Text>
        </StyledCard>

        <StyledCard>
          {renderProductDetails()}
        </StyledCard>

        <StyledCard>
          <Title level={4}>Итого</Title>
          <Text strong>{calculateTotalPrice()} ₽</Text>
        </StyledCard>
      </Space>

      <Space style={{ marginTop: '16px' }}>
        <Button onClick={onBack}>
          Назад
        </Button>
        <Button type="primary" onClick={onSubmit}>
          Оформить заказ
        </Button>
      </Space>
    </div>
  );
};

export default PreviewStep; 