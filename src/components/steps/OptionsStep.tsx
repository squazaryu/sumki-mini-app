import React from 'react';
import { Option, ProductType } from '../../types';
import { Card, Typography, Space, Button, Checkbox } from 'antd/lib/index';
import styled from 'styled-components';

const { Title, Text } = Typography;

interface OptionsStepProps {
  selectedOptions: Option[];
  productType: ProductType;
  onSubmit: (options: Option[]) => void;
  onBack: () => void;
}

const bagOptions: Option[] = [
  'Застёжка',
  'Подклад',
  'Ручка-цепочка',
  'Короткая ручка'
];

const podstakannikOptions: Option[] = [
  'Подсветка',
  'Крышка',
  'Подставка'
];

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

const OptionsStep: React.FC<OptionsStepProps> = ({
  selectedOptions,
  productType,
  onSubmit,
  onBack
}) => {
  const options = productType === 'bag' ? bagOptions : podstakannikOptions;

  const handleOptionChange = (option: Option) => {
    const newOptions = selectedOptions.includes(option)
      ? selectedOptions.filter(o => o !== option)
      : [...selectedOptions, option];
    onSubmit(newOptions);
  };

  return (
    <div className="options-step">
      <Title level={2}>Выберите дополнительные опции</Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {options.map((option) => (
          <StyledCard key={option}>
            <Checkbox
              checked={selectedOptions.includes(option)}
              onChange={() => handleOptionChange(option)}
            >
              <Space direction="vertical">
                <Title level={5}>{option}</Title>
                <Text type="secondary">
                  {productType === 'bag'
                    ? `Добавить ${option.toLowerCase()} к сумке`
                    : `Добавить ${option.toLowerCase()} к подстаканнику`}
                </Text>
              </Space>
            </Checkbox>
          </StyledCard>
        ))}
      </Space>
      <Space style={{ marginTop: '16px' }}>
        <Button onClick={onBack}>
          Назад
        </Button>
        <Button type="primary" onClick={() => onSubmit(selectedOptions)}>
          Продолжить
        </Button>
      </Space>
    </div>
  );
};

export default OptionsStep; 