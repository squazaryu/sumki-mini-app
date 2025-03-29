import React, { useState } from 'react';
import Typography from 'antd/lib/typography';
import Button from 'antd/lib/button';
import styled from 'styled-components';

const { Title, Text } = Typography;

interface ColorStepProps {
  selectedColor?: string;
  onSelect: (color: string) => void;
  onBack: () => void;
}

const StepContainer = styled.div`
  padding: 16px 0;
`;

const ColorButton = styled.button<{ color: string, isSelected: boolean }>`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  margin: 0 16px 16px 0;
  cursor: pointer;
  background-color: ${props => props.color};
  border: ${props => props.isSelected ? '4px solid #1890ff' : '2px solid #d9d9d9'};
  box-shadow: ${props => props.isSelected ? '0 0 0 2px #1890ff' : 'none'};
  transition: all 0.3s;
  
  &:hover {
    transform: scale(1.1);
    border-color: #1890ff;
  }
`;

const ColorGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 24px 0;
`;

const ColorInfo = styled.div`
  margin-top: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
  border-left: 4px solid #1890ff;
`;

const ButtonContainer = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: flex-start;
`;

const ColorChip = styled.div<{ color: string }>`
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: ${props => props.color};
  margin-right: 8px;
  vertical-align: middle;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const colors = [
  { name: 'Красный', value: '#f5222d' },
  { name: 'Розовый', value: '#eb2f96' },
  { name: 'Фиолетовый', value: '#722ed1' },
  { name: 'Синий', value: '#1890ff' },
  { name: 'Голубой', value: '#13c2c2' },
  { name: 'Зеленый', value: '#52c41a' },
  { name: 'Желтый', value: '#fadb14' },
  { name: 'Оранжевый', value: '#fa8c16' },
  { name: 'Черный', value: '#000000' },
  { name: 'Серый', value: '#8c8c8c' },
  { name: 'Белый', value: '#ffffff' },
];

const ColorStep: React.FC<ColorStepProps> = ({ selectedColor, onSelect, onBack }) => {
  const [localSelectedColor, setLocalSelectedColor] = useState(selectedColor || '');
  
  const handleSelect = (color: string) => {
    setLocalSelectedColor(color);
    setTimeout(() => onSelect(color), 300); // Небольшая задержка для анимации
  };
  
  const getColorName = (value: string) => {
    const found = colors.find(c => c.value === value);
    return found ? found.name : '';
  };

  return (
    <StepContainer>
      <Title level={3}>Выберите цвет</Title>
      <Text style={{ display: 'block', marginTop: 8 }}>
        Все изделия создаются вручную из качественного материала. Выберите цвет, который подойдет именно вам.
      </Text>
      
      <ColorGrid>
        {colors.map(color => (
          <ColorButton
            key={color.value}
            color={color.value}
            isSelected={localSelectedColor === color.value}
            onClick={() => handleSelect(color.value)}
            title={color.name}
          />
        ))}
      </ColorGrid>
      
      {localSelectedColor && (
        <ColorInfo>
          <Text style={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>
            <ColorChip color={localSelectedColor} />
            Выбранный цвет: {getColorName(localSelectedColor)}
          </Text>
        </ColorInfo>
      )}
      
      <ButtonContainer>
        <Button size="large" onClick={onBack}>
          Назад
        </Button>
      </ButtonContainer>
    </StepContainer>
  );
};

export default ColorStep; 