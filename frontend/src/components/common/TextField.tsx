import React from 'react';
import { TextField as MuiTextField, StandardTextFieldProps } from '@mui/material';

export interface TextFieldProps extends StandardTextFieldProps {
  label: string;
}

/**
 * TextField component
 * @param props TextField props
 * @returns TextField component
 */
const TextField: React.FC<TextFieldProps> = (props) => {
  return <MuiTextField {...props} />;
};

export default TextField;
