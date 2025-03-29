import React, { useState } from 'react';
import { Button, Typography, Card, Row, Col } from 'antd/lib/index';
import styled from 'styled-components';
import { StepProps } from '../types';

const { Title, Text } = Typography;

interface OptionsStepProps extends StepProps {
  onSelect: (options: string[]) => void;
  onClose?: () => void;
}

const ContainerWrapper = styled.div`
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
`;

const OptionTitle = styled(Title)`
  color: #000000 !important;
  margin-bottom: 8px !important;
  font-size: 18px !important;
`;

const OptionDescription = styled(Text)`
  color: #000000 !important;
  display: block;
  line-height: 1.6;
  font-size: 14px;
`;

const OptionCard = styled(Card)<{ selected: boolean }>`
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  margin-bottom: 12px;
  border: ${props => props.selected ? '1px solid #52c41a' : '1px solid #d9d9d9'};
  background-color: ${props => props.selected ? 'rgba(82, 196, 26, 0.1)' : 'white'};
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .ant-card-body {
    padding: 16px;
  }
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

const SubmitButton = styled(Button)`
  min-width: 100px;
  font-weight: 500;
  height: 36px;
  border-radius: 10px;
  box-shadow: none;
  background-color: #007AFF;
  border-color: #007AFF;
  
  &:hover, &:focus {
    background-color: #0066D6;
    border-color: #0066D6;
    box-shadow: none;
  }
`;

const OptionsStep: React.FC<OptionsStepProps> = ({ onSelect, onBack, onClose }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const options = [
    {
      id: 'clasp',
      name: 'Застёжка',
      description: 'Удобная застёжка для сумки'
    },
    {
      id: 'lining',
      name: 'Подклад',
      description: 'Внутренний подклад для сумки'
    },
    {
      id: 'chain',
      name: 'Ручка-цепочка',
      description: 'Элегантная ручка в виде цепочки'
    },
    {
      id: 'short_handle',
      name: 'Короткая ручка',
      description: 'Компактная ручка для удобства'
    }
  ];

  const handleOptionClick = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    } else {
      setSelectedOptions([...selectedOptions, optionId]);
    }
  };

  const handleSubmit = () => {
    const selectedOptionNames = options
      .filter(option => selectedOptions.includes(option.id))
      .map(option => option.name);
    
    onSelect(selectedOptionNames);
  };

  return (
    <ContainerWrapper>
      <Navigation>
        <OptionTitle level={3}>Выберите дополнительные опции</OptionTitle>
        <ButtonContainer>
          <BackButton size="large" onClick={onBack}>
            Назад
          </BackButton>
          <SubmitButton 
            type="primary" 
            onClick={handleSubmit}
            size="large"
          >
            Далее
          </SubmitButton>
        </ButtonContainer>
      </Navigation>
      
      <Row gutter={[16, 16]}>
        {options.map(option => (
          <Col xs={24} sm={12} key={option.id}>
            <OptionCard 
              selected={selectedOptions.includes(option.id)}
              onClick={() => handleOptionClick(option.id)}
              hoverable
            >
              <OptionTitle level={5}>{option.name}</OptionTitle>
              <OptionDescription>{option.description}</OptionDescription>
              {selectedOptions.includes(option.id) && (
                <div style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  right: '12px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#52c41a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                </div>
              )}
            </OptionCard>
          </Col>
        ))}
      </Row>
    </ContainerWrapper>
  );
};

export default OptionsStep; 