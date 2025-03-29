import React, { useReducer, useEffect } from 'react';
import message from 'antd/lib/message';
import Typography from 'antd/lib/typography';
import styled from 'styled-components';
import { ProductType } from '../types';
import SizeStep from './SizeStep';
import ShapeStep from './ShapeStep';
import MaterialStep from './MaterialStep';
import ColorStep from './ColorStep';
import OptionsStep from './OptionsStep';
import CustomOrderStep from './CustomOrderStep';
import PreviewStep from './PreviewStep';
import ProductStep from './steps/ProductStep';
import { getAssetPath } from '../utils';

interface OrderFormState {
  step: number;
  product: ProductType;
  size: string;
  shape: string;
  material: string;
  color: string;
  options: string[];
  customDescription: string;
}

const initialState: OrderFormState = {
  step: 0,
  product: '' as ProductType,
  size: '',
  shape: '',
  material: '',
  color: '',
  options: [],
  customDescription: ''
};

type Action =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP', payload: number }
  | { type: 'SET_PRODUCT', payload: ProductType }
  | { type: 'SET_SIZE', payload: string }
  | { type: 'SET_SHAPE', payload: string }
  | { type: 'SET_MATERIAL', payload: string }
  | { type: 'SET_COLOR', payload: string }
  | { type: 'SET_OPTIONS', payload: string[] }
  | { type: 'SET_CUSTOM_DESCRIPTION', payload: string };

const reducer = (state: OrderFormState, action: Action): OrderFormState => {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1 };
    case 'PREV_STEP':
      return { ...state, step: state.step - 1 };
    case 'GO_TO_STEP':
      return { ...state, step: action.payload };
    case 'SET_PRODUCT':
      return { ...state, product: action.payload };
    case 'SET_SIZE':
      return { ...state, size: action.payload };
    case 'SET_SHAPE':
      return { ...state, shape: action.payload };
    case 'SET_MATERIAL':
      return { ...state, material: action.payload };
    case 'SET_COLOR':
      return { ...state, color: action.payload };
    case 'SET_OPTIONS':
      return { ...state, options: action.payload };
    case 'SET_CUSTOM_DESCRIPTION':
      return { ...state, customDescription: action.payload };
    default:
      return state;
  }
};

const { Title } = Typography;

// Стили для мобильной версии с фиксированными цветами
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background-color: #ffffff;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 12px;
  position: relative;
`;

const ProgressBar = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #f5f5f5;
  z-index: 10;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => `${props.progress}%`};
  background-color: #1890ff;
  transition: width 0.3s ease;
`;

const MobileStepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
  padding: 8px 0;
`;

const StepDot = styled.div<{ active: boolean; completed: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 0 4px;
  background-color: ${props => 
    props.active 
      ? '#1890ff' 
      : props.completed 
        ? '#1890ff' 
        : '#e8e8e8'
  };
  opacity: ${props => props.completed && !props.active ? 0.5 : 1};
  transition: all 0.3s ease;
`;

const StyledTitle = styled(Typography.Title)`
  margin-bottom: 16px !important;
  text-align: center;
  color: #000000 !important;
  font-size: 22px !important;
  font-weight: 600;

  @media (max-width: 320px) {
    font-size: 20px !important;
  }
`;

const OrderForm: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const tgWebApp = window.Telegram?.WebApp;

  // Шаги оформления заказа
  const totalSteps = state.product === 'custom' ? 3 
                   : state.product === 'coaster' ? 5 
                   : 7;

  // Функция для закрытия мини-приложения
  const handleClose = () => {
    if (tgWebApp) {
      tgWebApp.close();
    }
  };

  // Устанавливаем цвета кнопок Telegram Mini App
  useEffect(() => {
    if (tgWebApp) {
      // Установка заголовка в верхнем баре
      const stepTitles = [
        'Выбор изделия',
        'Размер',
        'Форма',
        'Материал',
        'Цвет',
        'Опции',
        'Предпросмотр',
      ];
      
      // Установка цветов интерфейса Telegram
      tgWebApp.setHeaderColor('#ffffff');
      tgWebApp.setBackgroundColor('#ffffff');
      
      // Настраиваем поведение кнопки назад
      if (state.step > 0) {
        // Используем крестик для закрытия приложения
        tgWebApp.BackButton.show();
        tgWebApp.BackButton.onClick(() => {
          // Закрываем приложение при нажатии на кнопку назад
          tgWebApp.close();
        });
      } else {
        tgWebApp.BackButton.hide();
      }
      
      // Обновлять кнопки при смене шага
      if (state.step < stepTitles.length) {
        tgWebApp.MainButton.text = 'Продолжить';
        tgWebApp.MainButton.color = '#1890ff';
        tgWebApp.MainButton.textColor = '#ffffff';
      }
      
      return () => {
        // Отписываемся от обработчика при размонтировании
        tgWebApp.BackButton.offClick(() => {
          tgWebApp.close();
        });
      };
    }
  }, [state.step, tgWebApp]);

  const handleProductSelect = (product: ProductType) => {
    dispatch({ type: 'SET_PRODUCT', payload: product });
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleSizeSelect = (size: string) => {
    dispatch({ type: 'SET_SIZE', payload: size });
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleShapeSelect = (shape: string) => {
    dispatch({ type: 'SET_SHAPE', payload: shape });
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleMaterialSelect = (material: string) => {
    dispatch({ type: 'SET_MATERIAL', payload: material });
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleColorSelect = (color: string) => {
    dispatch({ type: 'SET_COLOR', payload: color });
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleOptionsSelect = (options: string[]) => {
    dispatch({ type: 'SET_OPTIONS', payload: options });
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleCustomDescription = (description: string, imageUrl?: string) => {
    dispatch({ type: 'SET_CUSTOM_DESCRIPTION', payload: description });
    // Можно добавить обработку изображения, если потребуется в будущем
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleBack = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const goToStep = (step: number) => {
    dispatch({ type: 'GO_TO_STEP', payload: step });
  };

  // Расчет прогресса для прогресс-бара
  const progress = Math.min(100, (state.step / (totalSteps - 1)) * 100);

  // Отображение шага формы
  const renderStep = () => {
    switch (state.step) {
      case 0:
        return <ProductStep onSelect={handleProductSelect} onClose={handleClose} />;
      case 1:
        if (state.product === 'bag') {
          return <SizeStep onSelect={handleSizeSelect} onBack={handleBack} onClose={handleClose} />;
        } else if (state.product === 'custom') {
          return <CustomOrderStep onSubmit={handleCustomDescription} onBack={handleBack} onClose={handleClose} />;
        } else if (state.product === 'coaster') {
          // Для подстаканника сразу переходим к выбору материала
          return <MaterialStep onSelect={handleMaterialSelect} onBack={handleBack} onClose={handleClose} />;
        }
        return null;
      case 2:
        if (state.product === 'custom') {
          return <PreviewStep 
            orderDetails={{
              product: state.product,
              customDescription: state.customDescription
            }}
            onBack={handleBack}
            onClose={handleClose}
          />;
        } else if (state.product === 'coaster') {
          return <ColorStep onSelect={handleColorSelect} onBack={handleBack} onClose={handleClose} />;
        }
        return <ShapeStep onSelect={handleShapeSelect} onBack={handleBack} onClose={handleClose} />;
      case 3:
        if (state.product === 'coaster') {
          return <OptionsStep onSelect={handleOptionsSelect} onBack={handleBack} onClose={handleClose} />;
        }
        return <MaterialStep onSelect={handleMaterialSelect} onBack={handleBack} onClose={handleClose} />;
      case 4:
        if (state.product === 'coaster') {
          return (
            <PreviewStep
              orderDetails={{
                product: state.product,
                material: state.material,
                color: state.color,
                options: state.options
              }}
              onBack={handleBack}
              onClose={handleClose}
            />
          );
        }
        return <ColorStep onSelect={handleColorSelect} onBack={handleBack} onClose={handleClose} />;
      case 5:
        if (state.product === 'coaster') {
          return null;
        }
        return <OptionsStep onSelect={handleOptionsSelect} onBack={handleBack} onClose={handleClose} />;
      case 6:
        return (
          <PreviewStep
            orderDetails={{
              product: state.product,
              size: state.size,
              shape: state.shape,
              material: state.material,
              color: state.color,
              options: state.options
            }}
            onBack={handleBack}
            onClose={handleClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container className="telegram-app">
      <ProgressBar>
        <ProgressFill progress={progress} />
      </ProgressBar>
      
      <MobileStepIndicator>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <StepDot 
            key={index} 
            active={state.step === index}
            completed={state.step > index}
            onClick={() => index < state.step && goToStep(index)}
          />
        ))}
      </MobileStepIndicator>
      
      <MainContent>
        {renderStep()}
      </MainContent>
    </Container>
  );
};

export default OrderForm; 