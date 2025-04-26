import React from 'react';
import { createA11yTestSuite } from '../../../accessibility-tests/axe/axe-react';
import TextField from '../common/TextField';
import SelectField from '../common/SelectField';
import Checkbox from '../common/Checkbox';
import RadioGroup from '../common/RadioGroup';

// Create accessibility test suite for TextField component
createA11yTestSuite(
  TextField,
  'TextField',
  [
    { label: 'Username', id: 'username', name: 'username' },
    { label: 'Email', id: 'email', name: 'email', type: 'email' },
    { label: 'Password', id: 'password', name: 'password', type: 'password' },
    { label: 'Description', id: 'description', name: 'description', multiline: true },
    { label: 'Required Field', id: 'required', name: 'required', required: true },
    { label: 'Disabled Field', id: 'disabled', name: 'disabled', disabled: true },
    { label: 'Field with Error', id: 'error', name: 'error', error: 'This field has an error' },
    { label: 'Field with Helper Text', id: 'helper', name: 'helper', helperText: 'This is helper text' },
  ]
);

// Create accessibility test suite for SelectField component
createA11yTestSuite(
  SelectField,
  'SelectField',
  [
    {
      label: 'Select Option',
      id: 'select',
      name: 'select',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
    },
    {
      label: 'Required Select',
      id: 'required-select',
      name: 'required-select',
      required: true,
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ],
    },
    {
      label: 'Disabled Select',
      id: 'disabled-select',
      name: 'disabled-select',
      disabled: true,
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ],
    },
    {
      label: 'Select with Error',
      id: 'error-select',
      name: 'error-select',
      error: 'This field has an error',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ],
    },
  ]
);

// Create accessibility test suite for Checkbox component
createA11yTestSuite(
  Checkbox,
  'Checkbox',
  [
    { label: 'Checkbox', id: 'checkbox', name: 'checkbox' },
    { label: 'Checked Checkbox', id: 'checked', name: 'checked', checked: true },
    { label: 'Disabled Checkbox', id: 'disabled', name: 'disabled', disabled: true },
    { label: 'Required Checkbox', id: 'required', name: 'required', required: true },
    { label: 'Checkbox with Error', id: 'error', name: 'error', error: 'This field has an error' },
  ]
);

// Create accessibility test suite for RadioGroup component
createA11yTestSuite(
  RadioGroup,
  'RadioGroup',
  [
    {
      label: 'Radio Group',
      id: 'radio-group',
      name: 'radio-group',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
    },
    {
      label: 'Required Radio Group',
      id: 'required-radio',
      name: 'required-radio',
      required: true,
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ],
    },
    {
      label: 'Disabled Radio Group',
      id: 'disabled-radio',
      name: 'disabled-radio',
      disabled: true,
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ],
    },
    {
      label: 'Radio Group with Error',
      id: 'error-radio',
      name: 'error-radio',
      error: 'This field has an error',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ],
    },
  ]
);
