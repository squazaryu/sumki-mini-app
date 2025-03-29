import React from 'react';
import { BagSize } from '../../types';
import { Card, Typography, Space, Button } from 'antd/lib/index';
import styled from 'styled-components';

const { Title, Text } = Typography;

interface SizeStepProps {
  selectedSize?: BagSize;
  onSelect: (size: BagSize) => void;
  onBack: () => void;
}

const sizes: Array<{ size: BagSize; description: string }> = [
  { size: 'S', description: 'Маленькая (15-20 см)' },
  { size: 'M', description: 'Средняя (20-25 см)' },
  { size: 'L', description: 'Большая (25-30 см)' }
];

const StyledCard = styled(Card)<{ $selected?: boolean }>`
  &.size-card {
    border: ${props => props.$selected ? '2px solid #1890ff' : '1px solid #d9d9d9'};
    margin-bottom: 16px;
  }
`;

const SizeStep: React.FC<SizeStepProps> = ({ selectedSize, onSelect, onBack }) => {
  return (
    <div className="size-step">
      <Title level={2}>Выберите размер сумки</Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {sizes.map(({ size, description }) => (
          <StyledCard
            key={size}
            hoverable
            onClick={() => onSelect(size)}
            className="size-card"
            $selected={selectedSize === size}
          >
            <Space direction="vertical">
              <Title level={4}>Размер {size}</Title>
              <Text>{description}</Text>
            </Space>
          </StyledCard>
        ))}
      </Space>
      <Button onClick={onBack} style={{ marginTop: '16px' }}>
        Назад
      </Button>
    </div>
  );
};

export default SizeStep; 