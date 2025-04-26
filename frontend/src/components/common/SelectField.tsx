import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  SelectProps as MuiSelectProps
} from '@mui/material';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps extends Omit<MuiSelectProps, 'onChange'> {
  label: string;
  options: SelectOption[];
  error?: boolean;
  helperText?: string;
  onChange: (value: string) => void;
}

/**
 * SelectField component
 * @param props SelectField props
 * @returns SelectField component
 */
const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  error,
  helperText,
  onChange,
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    onChange(event.target.value as string);
  };

  const labelId = `${label.toLowerCase().replace(/\s+/g, '-')}-label`;

  return (
    <FormControl fullWidth error={error}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        label={label}
        onChange={handleChange as any}
        {...props}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default SelectField;
