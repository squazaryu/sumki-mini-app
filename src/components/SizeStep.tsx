import React from 'react';
import Card from 'antd/lib/card';
import Typography from 'antd/lib/typography';
import Button from 'antd/lib/button';
import styled from 'styled-components';

const { Title, Text } = Typography;

interface SizeStepProps {
  onSelect: (value: string) => void;
  onBack: () => void;
  onClose?: () => void;
}

const StepContainer = styled.div`
  padding: 16px 0;
`;

const PageTitle = styled(Title)`
  text-align: center;
  margin-bottom: 24px !important;
  color: #000000 !important;
`;

const SizeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin: 24px 0;
`;

const SizeCard = styled(Card)<{ isselected?: string }>`
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: ${(props) => (props.isselected === 'true' ? '2px solid #1890ff' : '1px solid #f0f0f0')};
  box-shadow: ${(props) =>
    props.isselected === 'true'
      ? '0 8px 16px rgba(24, 144, 255, 0.2)'
      : '0 2px 8px rgba(0, 0, 0, 0.05)'};
  
  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
  }

  .ant-card-body {
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 120px;
  }
`;

const SizeTitle = styled(Title)`
  margin-bottom: 0 !important;
  color: #000000 !important;
  text-align: center;
  font-size: 20px !important;
`;

const SelectedIndicator = styled.div`
  padding: 6px 0;
  margin-top: 12px;
  border-radius: 20px;
  text-align: center;
  font-weight: 500;
  font-size: 14px;
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
  display: ${(props) => (props.hidden ? 'none' : 'block')};
  width: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

const sizes = [
  {
    size: 'S',
    title: 'Размер S'
  },
  {
    size: 'M',
    title: 'Размер M'
  },
  {
    size: 'L',
    title: 'Размер L'
  }
];

const SizeStep: React.FC<SizeStepProps> = ({ onSelect, onBack, onClose }) => {
  const [selectedSize, setSelectedSize] = React.useState<string>('');

  const handleSelect = (size: string) => {
    setSelectedSize(size);
    setTimeout(() => onSelect(size), 300); // Небольшая задержка для анимации
  };

  return (
    <StepContainer>
      <Navigation>
        <PageTitle level={3} style={{ margin: 0 }}>Выберите размер сумки</PageTitle>
        <ButtonContainer>
          <BackButton size="large" onClick={onBack}>
            Назад
          </BackButton>
        </ButtonContainer>
      </Navigation>
      <SizeGrid>
        {sizes.map((size) => (
          <SizeCard
            key={size.size}
            hoverable
            isselected={selectedSize === size.size ? 'true' : 'false'}
            onClick={() => handleSelect(size.size)}
          >
            <SizeTitle level={4}>{size.title}</SizeTitle>
            <SelectedIndicator hidden={selectedSize !== size.size}>
              Выбрано
            </SelectedIndicator>
          </SizeCard>
        ))}
      </SizeGrid>
    </StepContainer>
  );
};

export default SizeStep; 