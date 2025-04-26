import React from 'react';
import { useField } from 'formik';
import {
  TextField,
  TextFieldProps,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Switch,
  FormGroup,
  Radio,
  RadioGroup,
  FormLabel,
  Autocomplete,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import { adaptSelectChangeHandler } from '../../utils/eventHandlers';

// Base form field props
interface BaseFormFieldProps {
  name: string;
  label: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

// Text field props
interface TextFormFieldProps extends BaseFormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local' | 'time' | 'url' | 'tel' | 'search';
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  InputProps?: TextFieldProps['InputProps'];
}

// Select field props
interface SelectFormFieldProps extends BaseFormFieldProps {
  options: Array<{ value: string | number; label: string }>;
  multiple?: boolean;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
}

// Checkbox field props
interface CheckboxFormFieldProps extends BaseFormFieldProps {
  color?: 'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning';
}

// Switch field props
interface SwitchFormFieldProps extends BaseFormFieldProps {
  color?: 'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning';
}

// Radio group field props
interface RadioGroupFormFieldProps extends BaseFormFieldProps {
  options: Array<{ value: string | number; label: string }>;
  row?: boolean;
  color?: 'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning';
}

// Autocomplete field props
interface AutocompleteFormFieldProps extends BaseFormFieldProps {
  options: Array<{ value: string; label: string }>;
  multiple?: boolean;
  freeSolo?: boolean;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  placeholder?: string;
}

// Text Field Component
export const TextField2 = ({
  name,
  label,
  helperText,
  required = false,
  disabled = false,
  type = 'text',
  multiline = false,
  rows = 1,
  placeholder,
  fullWidth = true,
  variant = 'outlined',
  size = 'medium',
  InputProps,
  ...props
}: TextFormFieldProps) => {
  const [field, meta] = useField(name);
  const hasError = meta.touched && !!meta.error;

  return (
    <TextField
      {...field}
      id={name}
      label={label}
      type={type}
      multiline={multiline}
      rows={rows}
      placeholder={placeholder}
      helperText={hasError ? meta.error : helperText}
      error={hasError}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      variant={variant}
      size={size}
      InputProps={InputProps}
      {...props}
    />
  );
};

// Select Field Component
export const SelectField = ({
  name,
  label,
  helperText,
  required = false,
  disabled = false,
  options,
  multiple = false,
  fullWidth = true,
  variant = 'outlined',
  size = 'medium',
  ...props
}: SelectFormFieldProps) => {
  const [field, meta, helpers] = useField(name);
  const hasError = meta.touched && !!meta.error;

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    helpers.setValue(event.target.value);
  };

  // Adapter for Material UI's SelectChangeEvent
  const adaptedHandleChange = adaptSelectChangeHandler(handleChange);

  return (
    <FormControl
      variant={variant}
      fullWidth={fullWidth}
      error={hasError}
      required={required}
      disabled={disabled}
      size={size}
      {...props}
    >
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        {...field}
        labelId={`${name}-label`}
        id={name}
        label={label}
        multiple={multiple}
        onChange={adaptedHandleChange}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{hasError ? meta.error : helperText}</FormHelperText>
    </FormControl>
  );
};

// Checkbox Field Component
export const CheckboxField = ({
  name,
  label,
  helperText,
  required = false,
  disabled = false,
  color = 'primary',
  ...props
}: CheckboxFormFieldProps) => {
  const [field, meta, helpers] = useField(name);
  const hasError = meta.touched && !!meta.error;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    helpers.setValue(event.target.checked);
  };

  return (
    <FormControl error={hasError} required={required} disabled={disabled} {...props}>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={field.value}
              onChange={handleChange}
              name={name}
              color={color}
            />
          }
          label={label}
        />
      </FormGroup>
      {(hasError || helperText) && (
        <FormHelperText>{hasError ? meta.error : helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

// Switch Field Component
export const SwitchField = ({
  name,
  label,
  helperText,
  required = false,
  disabled = false,
  color = 'primary',
  ...props
}: SwitchFormFieldProps) => {
  const [field, meta, helpers] = useField(name);
  const hasError = meta.touched && !!meta.error;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    helpers.setValue(event.target.checked);
  };

  return (
    <FormControl error={hasError} required={required} disabled={disabled} {...props}>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={field.value}
              onChange={handleChange}
              name={name}
              color={color}
            />
          }
          label={label}
        />
      </FormGroup>
      {(hasError || helperText) && (
        <FormHelperText>{hasError ? meta.error : helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

// Radio Group Field Component
export const RadioGroupField = ({
  name,
  label,
  helperText,
  required = false,
  disabled = false,
  options,
  row = false,
  color = 'primary',
  ...props
}: RadioGroupFormFieldProps) => {
  const [field, meta, helpers] = useField(name);
  const hasError = meta.touched && !!meta.error;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    helpers.setValue(event.target.value);
  };

  return (
    <FormControl error={hasError} required={required} disabled={disabled} {...props}>
      <FormLabel id={`${name}-label`}>{label}</FormLabel>
      <RadioGroup
        aria-labelledby={`${name}-label`}
        name={name}
        value={field.value}
        onChange={handleChange}
        row={row}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio color={color} />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {(hasError || helperText) && (
        <FormHelperText>{hasError ? meta.error : helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

// Autocomplete Field Component
export const AutocompleteField = ({
  name,
  label,
  helperText,
  required = false,
  disabled = false,
  options,
  multiple = false,
  freeSolo = false,
  fullWidth = true,
  variant = 'outlined',
  size = 'medium',
  placeholder,
  ...props
}: AutocompleteFormFieldProps) => {
  const [field, meta, helpers] = useField(name);
  const hasError = meta.touched && !!meta.error;

  const handleChange = (_event: React.SyntheticEvent, value: any) => {
    helpers.setValue(value);
  };

  return (
    <Autocomplete
      id={name}
      options={options}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }
        return option.label || '';
      }}
      value={field.value}
      onChange={handleChange}
      multiple={multiple}
      freeSolo={freeSolo}
      disabled={disabled}
      fullWidth={fullWidth}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            label={typeof option === 'string' ? option : option.label}
            {...getTagProps({ index })}
            size="small"
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          label={label}
          placeholder={placeholder}
          helperText={hasError ? meta.error : helperText}
          error={hasError}
          required={required}
          variant={variant}
          size={size}
        />
      )}
      {...props}
    />
  );
};
