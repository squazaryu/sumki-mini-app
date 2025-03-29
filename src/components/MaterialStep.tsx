import React from 'react';
import { Card, Typography, Button } from 'antd/lib/index';
import styled from 'styled-components';
import { getAssetPath } from '../utils';
import { StepProps } from '../types';

const { Title, Text } = Typography;

interface MaterialStepProps extends StepProps {
  onSelect: (value: string) => void;
  onClose?: () => void;
}

const ContainerWrapper = styled.div`
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
`;

const MaterialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;
  align-items: start;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`;

const MaterialCard = styled(Card)`
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  
  .ant-card-body {
    padding: 12px;
    flex-grow: 0;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  padding-top: 100%; /* Создает квадратную форму */
  position: relative;
  overflow: hidden;
  margin-bottom: 0; /* Убираем отступ снизу */
  background-color: #f8f8f8;
  
  /* Стили для стандартного img */
  img {
    position: absolute;
    top: 0; 
    left: 0;
    width: 100%; 
    height: 100%; 
    object-fit: contain;
    object-position: center;
  }
`;

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const CardContent = styled.div`
  padding: 12px 8px 8px 8px; /* Уменьшенные отступы */
  text-align: center;
  min-height: 80px; /* Фиксированная минимальная высота */
  max-height: 80px; /* Максимальная высота для всех карточек */
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const MaterialTitle = styled(Title)`
  margin: 0 0 4px 0 !important; /* Сокращенные отступы */
  font-size: 16px !important; /* Уменьшенный размер шрифта */
  color: #000000 !important;
  text-align: center;
  line-height: 1.25 !important; /* Уменьшенная высота строки */
  
  @media (max-width: 576px) {
    font-size: 15px !important;
  }
`;

const MaterialDescription = styled(Text)`
  color: #000000;
  line-height: 1.4; /* Уменьшенная высота строки */
  display: block;
  margin: 0; /* Убрали отступ внизу */
  font-size: 12px; /* Уменьшенный размер шрифта */
  text-align: center;
  
  @media (max-width: 576px) {
    font-size: 11px;
  }
`;

const ActionButton = styled(Button)`
  margin-top: 20px;
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

const MaterialStep: React.FC<MaterialStepProps> = ({ onSelect, onBack, onClose }) => {
  const materials = [
    {
      id: 'akril',
      name: 'Акрил',
      description: 'Лёгкие и недорогие бусины',
      image: 'https://squazaryu.github.io/sumki-mini-app/images/bags/materials/akril.jpg',
      imageStyle: { objectFit: 'cover' as const }
    },
    {
      id: 'hrustal',
      name: 'Хрусталь',
      description: 'Красивые блестящие бусины среднего качества',
      image: 'https://squazaryu.github.io/sumki-mini-app/images/bags/materials/hrustal.jpg',
      imageStyle: { objectFit: 'contain' as const }
    },
    {
      id: 'swarovski',
      name: 'Swarovski',
      description: 'Премиальные бусины высокого качества',
      image: 'https://squazaryu.github.io/sumki-mini-app/images/bags/materials/swarovski.jpg',
      imageStyle: { objectFit: 'contain' as const }
    }
  ];

  const fallbackImagePath = getAssetPath('images/bag-placeholder.jpg');
  console.log("[MaterialStep] Fallback Image Path:", fallbackImagePath);

  return (
    <ContainerWrapper>
      <Navigation>
        <Title level={4} style={{ margin: 0, color: '#000000' }}>Выберите материал бусин</Title>
        <NavigationButtons>
          <BackButton size="large" onClick={onBack}>
            Назад
          </BackButton>
        </NavigationButtons>
      </Navigation>
      
      <MaterialGrid>
        {materials.map((material) => (
          <MaterialCard
            key={material.id}
            hoverable
            onClick={() => onSelect(material.name)}
          >
            <ImageContainer>
              <img 
                src={material.image} 
                alt={material.name}
                style={material.imageStyle}
                onError={(e) => { 
                  // Попытка загрузить fallback изображение при ошибке
                  (e.target as HTMLImageElement).onerror = null; // Предотвращаем бесконечный цикл onError
                  (e.target as HTMLImageElement).src = fallbackImagePath;
                  console.log(`[MaterialStep] Error loading ${material.image}, trying fallback ${fallbackImagePath}`);
                }} 
              />
            </ImageContainer>
            <CardContent>
              <MaterialTitle level={5}>{material.name}</MaterialTitle>
              <MaterialDescription>{material.description}</MaterialDescription>
            </CardContent>
          </MaterialCard>
        ))}
      </MaterialGrid>
    </ContainerWrapper>
  );
};

export default MaterialStep; 