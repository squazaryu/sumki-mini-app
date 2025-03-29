import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const StyledButton = styled.button<ButtonProps>`
  font-family: ${theme.typography.fontFamily};
  font-size: ${props => 
    props.size === 'small' ? '14px' : 
    props.size === 'large' ? '20px' : 
    '17px'};
  font-weight: 600;
  padding: ${props => 
    props.size === 'small' ? '8px 16px' : 
    props.size === 'large' ? '16px 32px' : 
    '12px 24px'};
  border-radius: ${theme.borderRadius.md};
  border: none;
  cursor: pointer;
  transition: ${theme.transitions.default};
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  ${props => {
    switch (props.variant) {
      case 'secondary':
        return `
          background-color: ${theme.colors.secondary};
          color: white;
          &:hover {
            background-color: ${theme.colors.secondary}E6;
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          color: ${theme.colors.primary};
          border: 2px solid ${theme.colors.primary};
          &:hover {
            background-color: ${theme.colors.primary}0A;
          }
        `;
      default:
        return `
          background-color: ${theme.colors.primary};
          color: white;
          &:hover {
            background-color: ${theme.colors.primary}E6;
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  children,
  onClick,
  disabled = false
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </StyledButton>
  );
}; 