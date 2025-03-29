import React from 'react';
import { Space } from 'antd/lib/index';
import { StepContainer, StepTitle } from './styles';
import { Card } from '../common/Card';
import { Material } from '../../types';
import { Button } from '../common/Button';

interface MaterialStepProps {
  selectedMaterial?: Material;
  onSelect: (material: Material) => void;
  onBack: () => void;
}

const materials = [
  {
    material: 'Акрил' as Material,
    image: '/images/materials/acrylic.jpg',
    description: 'Легкий и прочный материал с отличной светопропускаемостью'
  },
  {
    material: 'Хрусталь' as Material,
    image: '/images/materials/crystal.jpg',
    description: 'Элегантный и роскошный материал с высокой прозрачностью'
  },
  {
    material: 'Swarovski' as Material,
    image: '/images/materials/swarovski.jpg',
    description: 'Премиальные кристаллы с непревзойденным блеском'
  }
];

const MaterialStep: React.FC<MaterialStepProps> = ({ selectedMaterial, onSelect, onBack }) => {
  return (
    <StepContainer>
      <StepTitle>Выберите материал</StepTitle>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {materials.map(({ material, image, description }) => (
          <Card
            key={material}
            selected={selectedMaterial === material}
            onClick={() => onSelect(material)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" size={8}>
              <img src={image} alt={material} style={{ width: '100%', height: 'auto' }} />
              <div>
                <h3>{material}</h3>
                <p>{description}</p>
              </div>
            </Space>
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

export default MaterialStep;

