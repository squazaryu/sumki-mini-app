import React from 'react';
import { Card, Row, Col, Typography, Button } from 'antd/lib/index';
import styled from 'styled-components';
import { ProductType } from '../types';

const { Title, Text } = Typography;

interface ProductTypeStepProps {
  value: ProductType;
  onChange: (value: ProductType) => void;
  onClose?: () => void; // Опциональный параметр для закрытия окна
}

const StyledCard = styled(Card)<{ isselected?: boolean }>`
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  border: ${(props) => (props.isselected ? '2px solid #1890ff' : '1px solid #f0f0f0')};
  box-shadow: ${(props) =>
    props.isselected
      ? '0 8px 16px rgba(24, 144, 255, 0.2)'
      : '0 2px 8px rgba(0, 0, 0, 0.05)'};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  .ant-card-body {
    padding: 16px;
  }
`;

const CardTitle = styled(Title)`
  margin-bottom: 8px !important;
  color: #000000 !important;
`;

const CardDescription = styled(Text)`
  color: #000000 !important;
  display: block;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ProductTypeStep: React.FC<ProductTypeStepProps> = ({ value, onChange, onClose }) => {
  const productTypes: { type: ProductType; title: string; description: string }[] = [
    {
      type: 'bag',
      title: 'Сумка',
      description: 'Классическая сумка из бусин'
    },
    {
      type: 'coaster',
      title: 'Подстаканник',
      description: 'Подстаканник для автомобиля'
    },
    {
      type: 'custom',
      title: 'Нестандартный заказ',
      description: 'Индивидуальный заказ по вашим требованиям'
    }
  ];

  return (
    <div>
      <HeaderContainer>
        <Title level={4} style={{ margin: 0, color: '#000000' }}>Выберите тип изделия</Title>
      </HeaderContainer>
      <Row gutter={[16, 16]}>
        {productTypes.map((product) => (
          <Col xs={24} sm={8} key={product.type}>
            <StyledCard
              isselected={value === product.type}
              onClick={() => onChange(product.type)}
              hoverable
            >
              <CardTitle level={5}>{product.title}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </StyledCard>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProductTypeStep; 