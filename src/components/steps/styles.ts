import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const StepContainer = styled.div`
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.background};
  min-height: 100vh;
`;

export const StepTitle = styled.h2`
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.h2.fontSize};
  font-weight: ${theme.typography.h2.fontWeight};
  line-height: ${theme.typography.h2.lineHeight};
  letter-spacing: ${theme.typography.h2.letterSpacing};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xl};
`; 