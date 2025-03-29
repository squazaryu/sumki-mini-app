import React from 'react';
import { ProductType, ProductStepProps } from '../../types';
import { Card, Typography, Image } from 'antd/lib/index';
import styled from 'styled-components';
import { getAssetPath } from '../../utils';

const { Title, Text } = Typography;

const ContainerWrapper = styled.div`
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  margin-top: 20px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
`;

const ProductCard = styled(Card)`
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  border: ${(props) =>
    props.className?.includes('selected') ? '2px solid #1890ff' : '1px solid #f0f0f0'};
  box-shadow: ${(props) =>
    props.className?.includes('selected')
      ? '0 8px 16px rgba(24, 144, 255, 0.2)'
      : '0 2px 8px rgba(0, 0, 0, 0.05)'};
  
  .ant-card-body {
    padding: 16px;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  padding-top: 100%; /* Создает квадратную форму */
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  
  .ant-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
`;

const CardContent = styled.div`
  padding: 0 4px;
  text-align: center;
`;

const ProductTitle = styled(Title)`
  margin-bottom: 8px !important;
  font-size: 16px !important;
  color: #000000 !important;
  text-align: center;
  
  @media (min-width: 768px) {
    font-size: 18px !important;
  }
`;

const ProductDescription = styled(Text)`
  color: #000000;
  line-height: 1.5;
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  text-align: center;
  
  @media (min-width: 768px) {
    font-size: 14px;
  }
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
`;

const StyledTitle = styled(Title)`
  text-align: center;
  margin-bottom: 24px !important;
  color: #000000 !important;
  font-size: 22px !important;
  
  @media (max-width: 320px) {
    font-size: 20px !important;
  }
`;

const ProductStep: React.FC<ProductStepProps> = ({ onSelect, onClose }) => {
  const [selectedProduct, setSelectedProduct] = React.useState<ProductType | ''>('');

  const handleSelect = (product: ProductType) => {
    setSelectedProduct(product);
    setTimeout(() => onSelect(product), 300);
  };

  const products = [
    {
      type: 'bag' as ProductType,
      title: 'Сумка',
      description: 'Элегантная сумка ручной работы из качественных бусин различных форм и размеров.',
      image: getAssetPath('images/product_type/sumka.jpeg')
    },
    {
      type: 'coaster' as ProductType,
      title: 'Подстаканник',
      description: 'Стильный подстаканник из бусин для, чтобы подчеркнуть ваш стиль.',
      image: getAssetPath('images/product_type/podstakannik.JPEG')
    },
    {
      type: 'custom' as ProductType,
      title: 'Индивидуальный\nзаказ',
      description: 'Индивидуальный заказ украшений по вашему описанию из бусин.',
      image: getAssetPath('images/product_type/nestandartnii.JPEG'),
      titleStyle: { 
        whiteSpace: 'pre-line' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center'
      }
    }
  ];

  return (
    <ContainerWrapper>
      <HeaderContainer>
        <StyledTitle level={4}>Выберите тип изделия</StyledTitle>
      </HeaderContainer>
      
      <ProductGrid>
        {products.map((product) => (
          <ProductCard
            key={product.type}
            hoverable
            onClick={() => handleSelect(product.type)}
            className={`product-card ${selectedProduct === product.type ? 'selected' : ''}`}
          >
            <ImageContainer>
              <Image
                src={product.image}
                alt={product.title}
                preview={false}
                fallback={getAssetPath('images/bag-placeholder.jpg')}
              />
            </ImageContainer>
            <CardContent>
              <ProductTitle 
                level={5} 
                style={product.titleStyle}
              >
                {product.title}
              </ProductTitle>
              <ProductDescription>{product.description}</ProductDescription>
              <SelectedIndicator hidden={selectedProduct !== product.type}>
                Выбрано
              </SelectedIndicator>
            </CardContent>
          </ProductCard>
        ))}
      </ProductGrid>
    </ContainerWrapper>
  );
};

export default ProductStep;
