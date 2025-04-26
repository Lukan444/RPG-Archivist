import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends MuiButtonProps {
  label?: string;
}

/**
 * Button component
 * @param props Button props
 * @returns Button component
 */
const Button: React.FC<ButtonProps> = ({ 
  label, 
  children, 
  ...props 
}) => {
  return (
    <MuiButton {...props}>
      {label || children}
    </MuiButton>
  );
};

export default Button;
