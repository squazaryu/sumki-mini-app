export type ProductType = 'bag' | 'coaster' | 'custom';
export type Material = 'Акрил' | 'Хрусталь' | 'Swarovski' | string;
export type Option = string;
export type BagShape = 'Круглая' | 'Трапеция' | 'Прямоугольная' | 'Квадратная' | 'Месяц' | 'Сердце' | string;
export type BagSize = 'S' | 'M' | 'L' | string;

export interface ContactInfo {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

export interface OrderDetails {
  product: ProductType;
  size?: string;
  shape?: string;
  material?: string;
  color?: string;
  options?: string[];
  customDescription?: string;
  customPhoto?: string;
  contact?: ContactInfo;
}

export interface PreviewStepProps {
  orderDetails: OrderDetails;
  onBack: () => void;
  onClose?: () => void;
}

export interface StepProps {
  onSelect?: (value: any) => void;
  onBack?: () => void;
  onClose?: () => void;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  phone_number?: string;
}

export interface ProductStepProps {
  onSelect: (product: ProductType) => void;
  onClose?: () => void;
} 