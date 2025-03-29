import React from 'react';
import { Card, Typography, Button } from 'antd/lib/index';
import styled from 'styled-components';
import { getAssetPath } from '../utils';
import { StepProps } from '../types';

const { Title, Text } = Typography;

interface ShapeStepProps extends StepProps {
  onSelect: (value: string) => void;
  onClose?: () => void;
}

const ContainerWrapper = styled.div`
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
`;

const ShapeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 20px;
  
  @media (max-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`;

const ShapeCard = styled(Card)`
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .ant-card-body {
    padding: 16px;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  padding-top: 100%; /* Создает квадратную форму */
  position: relative;
  overflow: hidden;
  margin-bottom: 10px;
  background-color: #f8f8f8;
  
  /* Стили для стандартного img */
  img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-fit: cover; /* Возвращаем cover, чтобы заполнить контейнер */
    object-position: center;
    /* border: 1px solid red; // Убираем рамку */
  }
`;

const CardContent = styled.div`
  padding: 0 4px;
  text-align: center;
`;

const ShapeTitle = styled(Title)`
  margin-bottom: 8px !important;
  font-size: 18px !important;
  color: #000000 !important;
  text-align: center;
  
  @media (max-width: 576px) {
    font-size: 16px !important;
  }
`;

const ShapeDescription = styled(Text)`
  color: #000000;
  line-height: 1.6;
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  text-align: center;
  
  @media (max-width: 576px) {
    font-size: 12px;
  }
`;

const ActionButton = styled(Button)`
  min-width: 120px;
`;

const BackButton = styled(Button)`
  min-width: 100px;
  background-color: #F2F2F7;
  font-weight: 500;
  height: 36px;
  border-radius: 10px;
  box-shadow: none;
  border: 1px solid #E5E5EA;
  color: #000000;
  
  &:hover {
    border-color: #007AFF;
    color: #007AFF;
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

const Navigation = styled.div`  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ShapeStep: React.FC<ShapeStepProps> = ({ onSelect, onBack, onClose }) => {
  const shapes = [
    {
      id: 'kruglaya',
      name: 'Круглая',
      description: 'Классическая круглая форма',
      image: getAssetPath('images/bags/shapes/kruglaya.jpg')
    },
    {
      id: 'pryamougolnaya',
      name: 'Прямоугольная',
      description: 'Удобная прямоугольная форма',
      image: getAssetPath('images/bags/shapes/pryamougolnaya.jpg'),
      titleStyle: { whiteSpace: 'nowrap' as const }
    },
    {
      id: 'kvadratnaya',
      name: 'Квадратная',
      description: 'Компактная квадратная форма',
      image: getAssetPath('images/bags/shapes/kvadratnaya.jpg')
    },
    {
      id: 'trapeciya',
      name: 'Трапеция',
      description: 'Стильная форма трапеция',
      image: getAssetPath('images/bags/shapes/trapeciya.jpg')
    },
    {
      id: 'mesyac',
      name: 'Месяц',
      description: 'Элегантная форма полумесяца',
      image: getAssetPath('images/bags/shapes/mesyac.jpg')
    },
    {
      id: 'serdce',
      name: 'Сердце',
      description: 'Романтичная форма сердца',
      image: getAssetPath('images/bags/shapes/serdce.jpg')
    }
  ];

  const fallbackImagePath = getAssetPath('images/bag-placeholder.jpg');
  console.log("[ShapeStep] Fallback Image Path:", fallbackImagePath);

  return (
    <ContainerWrapper>
      <Navigation>
        <Title level={4} style={{ margin: 0, color: '#000000' }}>Выберите форму сумки</Title>
        <NavigationButtons>
          <BackButton size="large" onClick={onBack}>
            Назад
          </BackButton>
        </NavigationButtons>
      </Navigation>
      
      <ShapeGrid>
        {shapes.map((shape) => (
          <ShapeCard
            key={shape.id}
            hoverable
            onClick={() => onSelect(shape.name)}
          >
            <ImageContainer>
              <img 
                src={shape.image} 
                alt={shape.name} 
                onError={(e) => { 
                  // Попытка загрузить fallback изображение при ошибке
                  (e.target as HTMLImageElement).onerror = null; // Предотвращаем бесконечный цикл onError
                  (e.target as HTMLImageElement).src = fallbackImagePath; 
                  console.log(`[ShapeStep] Error loading ${shape.image}, trying fallback ${fallbackImagePath}`);
                }}
              />
            </ImageContainer>
            <CardContent>
              <ShapeTitle level={5} style={shape.titleStyle}>{shape.name}</ShapeTitle>
              <ShapeDescription>{shape.description}</ShapeDescription>
            </CardContent>
          </ShapeCard>
        ))}
      </ShapeGrid>
    </ContainerWrapper>
  );
};

export default ShapeStep; 
