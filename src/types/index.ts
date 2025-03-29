export type ProductType = 'bag' | 'coaster' | 'custom';

export type BagSize = 'S' | 'M' | 'L';

export type BagShape = 'Круглая' | 'Прямоугольная' | 'Трапеция' | 'Квадратная' | 'Месяц' | 'Сердце';

export type Material = 'Акрил' | 'Хрусталь' | 'Swarovski';

export type Option = 
  | 'Застёжка'
  | 'Подклад'
  | 'Ручка-цепочка'
  | 'Короткая ручка'
  | 'Подсветка'
  | 'Крышка'
  | 'Подставка';

export interface OrderDetails {
  product: ProductType;
  size?: string;
  shape?: string;
  material?: string;
  color?: string;
  options?: string[];
  customDescription?: string;
}

export interface PreviewStepProps {
  orderDetails: OrderDetails;
  onBack: () => void;
  onClose?: () => void;
}

export interface ProductStepProps {
  onSelect: (product: ProductType) => void;
  onClose?: () => void;
}

// Общий интерфейс для всех шагов с кнопками навигации
export interface StepProps {
  onBack: () => void;
  onClose?: () => void;
}

export interface OrderFormState {
  step: number;
  product: ProductType;
  size: string;
  shape: string;
  material: string;
  color: string;
  options: string[];
  customDescription: string;
} 