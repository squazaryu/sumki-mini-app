import React from 'react';
import { BagShape } from '../../types';
import { Space } from 'antd/lib/index';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface ShapeStepProps {
  selectedShape?: BagShape;
  onSelect: (shape: BagShape) => void;
  onBack: () => void;
}

const shapes: Array<{ shape: BagShape; image: string; description: string }> = [
  {
    shape: 'Круглая',
    image: '/images/krug.jpg',
    description: 'Классическая круглая форма'
  },
  {
    shape: 'Прямоугольная',
    image: '/images/pramougolnaya.jpg',
    description: 'Практичная прямоугольная форма'
  },
  {
    shape: 'Трапеция',
    image: '/images/trapeciya.jpg',
    description: 'Стильная трапециевидная форма'
  },
  {
    shape: 'Квадратная',
    image: '/images/kvadratnaya.jpg',
    description: 'Современная квадратная форма'
  },
  {
    shape: 'Месяц',
    image: '/images/mesyac.jpg',
    description: 'Романтичная форма в виде месяца'
  },
  {
    shape: 'Сердце',
    image: '/images/serdce.jpg',
    description: 'Романтичная форма в виде сердца'
  }
];

const StepContainer = styled.div`
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.background};
  min-height: 100vh;
`;

const StepTitle = styled.h2`
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.h2.fontSize};
  font-weight: ${theme.typography.h2.fontWeight};
  line-height: ${theme.typography.h2.lineHeight};
  letter-spacing: ${theme.typography.h2.letterSpacing};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xl};
`;

const ShapeTitle = styled.h4`
  font-family: ${theme.typography.fontFamily};
  font-size: 20px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin: ${theme.spacing.sm} 0;
`;

const ShapeDescription = styled.p`
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.body.fontSize};
  line-height: ${theme.typography.body.lineHeight};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: ${theme.borderRadius.md};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ShapeStep: React.FC<ShapeStepProps> = ({ selectedShape, onSelect, onBack }) => {
  return (
    <StepContainer>
      <StepTitle>Выберите форму сумки</StepTitle>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {shapes.map(({ shape, image, description }) => (
          <Card
            key={shape}
            selected={selectedShape === shape}
            onClick={() => onSelect(shape)}
          >
            <ImageContainer>
              <img src={image} alt={shape} />
            </ImageContainer>
            <ShapeTitle>{shape}</ShapeTitle>
            <ShapeDescription>{description}</ShapeDescription>
          </Card>
        ))}
        <Button
          variant="outline"
          fullWidth
          onClick={onBack}
        >
          Назад
        </Button>
      </Space>
    </StepContainer>
  );
};

export default ShapeStep;
 