import React from 'react';
import { 
  FormControlLabel, 
  Checkbox as MuiCheckbox, 
  CheckboxProps as MuiCheckboxProps,
  FormHelperText,
  FormControl
} from '@mui/material';

export interface CheckboxProps extends MuiCheckboxProps {
  label: string;
  error?: boolean;
  helperText?: string;
}

/**
 * Checkbox component
 * @param props Checkbox props
 * @returns Checkbox component
 */
const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  error, 
  helperText, 
  ...props 
}) => {
  return (
    <FormControl error={error}>
      <FormControlLabel
        control={<MuiCheckbox {...props} />}
        label={label}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default Checkbox;
