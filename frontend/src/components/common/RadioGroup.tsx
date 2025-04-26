import React from 'react';
import { 
  FormControl, 
  FormLabel, 
  RadioGroup as MuiRadioGroup, 
  FormControlLabel, 
  Radio,
  FormHelperText,
  RadioGroupProps as MuiRadioGroupProps
} from '@mui/material';

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioGroupProps extends Omit<MuiRadioGroupProps, 'onChange'> {
  label: string;
  options: RadioOption[];
  error?: boolean;
  helperText?: string;
  onChange: (value: string) => void;
}

/**
 * RadioGroup component
 * @param props RadioGroup props
 * @returns RadioGroup component
 */
const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  options,
  error,
  helperText,
  onChange,
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl error={error}>
      <FormLabel>{label}</FormLabel>
      <MuiRadioGroup onChange={handleChange} {...props}>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </MuiRadioGroup>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default RadioGroup;
