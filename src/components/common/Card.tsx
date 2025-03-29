import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface CardProps {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  hoverable?: boolean;
  style?: React.CSSProperties;
}

const StyledCard = styled.div<CardProps>`
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: ${props => props.selected ? theme.shadows.lg : theme.shadows.sm};
  border: 2px solid ${props => props.selected ? theme.colors.primary : 'transparent'};
  transition: ${theme.transitions.default};
  cursor: ${props => props.onClick ? 'pointer' : 'default'};
  
  ${props => props.hoverable && `
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.lg};
    }
  `}
  
  &:active {
    transform: ${props => props.onClick ? 'scale(0.99)' : 'none'};
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

export const Card: React.FC<CardProps> = ({
  selected = false,
  onClick,
  children,
  hoverable = true,
  style
}) => {
  return (
    <StyledCard
      selected={selected}
      onClick={onClick}
      hoverable={hoverable}
      style={style}
    >
      <CardContent>
        {children}
      </CardContent>
    </StyledCard>
  );
}; 