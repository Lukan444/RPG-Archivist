import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Formik, Form } from 'formik';
import { TextField2, SelectField, CheckboxField, SwitchField, RadioGroupField } from '../FormField';

// Create a theme for testing
const theme = createTheme();

// Wrap component with ThemeProvider and Formik
const renderWithFormik = (ui: React.ReactElement, initialValues = {}) => {
  return render(
    <ThemeProvider theme={theme}>
      <Formik initialValues={initialValues} onSubmit={jest.fn()}>
        <Form>{ui}</Form>
      </Formik>
    </ThemeProvider>
  );
};

describe('TextField2', () => {
  it('renders with label and placeholder', () => {
    // Arrange & Act
    renderWithFormik(
      <TextField2 
        name="testField" 
        label="Test Label" 
        placeholder="Test Placeholder" 
      />,
      { testField: '' }
    );
    
    // Assert
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Test Placeholder')).toBeInTheDocument();
  });

  it('renders with initial value', () => {
    // Arrange & Act
    renderWithFormik(
      <TextField2 
        name="testField" 
        label="Test Label" 
      />,
      { testField: 'Initial Value' }
    );
    
    // Assert
    const inputElement = screen.getByLabelText('Test Label') as HTMLInputElement;
    expect(inputElement.value).toBe('Initial Value');
  });

  it('updates value on change', () => {
    // Arrange
    renderWithFormik(
      <TextField2 
        name="testField" 
        label="Test Label" 
      />,
      { testField: '' }
    );
    
    // Act
    const inputElement = screen.getByLabelText('Test Label');
    fireEvent.change(inputElement, { target: { value: 'New Value' } });
    
    // Assert
    expect((inputElement as HTMLInputElement).value).toBe('New Value');
  });

  it('renders with helper text', () => {
    // Arrange & Act
    renderWithFormik(
      <TextField2 
        name="testField" 
        label="Test Label" 
        helperText="Helper Text" 
      />,
      { testField: '' }
    );
    
    // Assert
    expect(screen.getByText('Helper Text')).toBeInTheDocument();
  });

  it('renders as required', () => {
    // Arrange & Act
    renderWithFormik(
      <TextField2 
        name="testField" 
        label="Test Label" 
        required={true} 
      />,
      { testField: '' }
    );
    
    // Assert
    const inputElement = screen.getByLabelText('Test Label *');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('required');
  });

  it('renders as disabled', () => {
    // Arrange & Act
    renderWithFormik(
      <TextField2 
        name="testField" 
        label="Test Label" 
        disabled={true} 
      />,
      { testField: '' }
    );
    
    // Assert
    const inputElement = screen.getByLabelText('Test Label') as HTMLInputElement;
    expect(inputElement.disabled).toBe(true);
  });

  it('renders as multiline', () => {
    // Arrange & Act
    renderWithFormik(
      <TextField2 
        name="testField" 
        label="Test Label" 
        multiline={true}
        rows={3}
      />,
      { testField: '' }
    );
    
    // Assert
    const textareaElement = screen.getByLabelText('Test Label');
    expect(textareaElement.tagName.toLowerCase()).toBe('textarea');
    expect(textareaElement).toHaveAttribute('rows', '3');
  });
});

describe('SelectField', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  it('renders with label and options', () => {
    // Arrange & Act
    renderWithFormik(
      <SelectField 
        name="testSelect" 
        label="Test Select" 
        options={options} 
      />,
      { testSelect: '' }
    );
    
    // Assert
    expect(screen.getByLabelText('Test Select')).toBeInTheDocument();
    
    // Open the select dropdown
    fireEvent.mouseDown(screen.getByLabelText('Test Select'));
    
    // Check if options are rendered
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('renders with initial value', () => {
    // Arrange & Act
    renderWithFormik(
      <SelectField 
        name="testSelect" 
        label="Test Select" 
        options={options} 
      />,
      { testSelect: 'option2' }
    );
    
    // Assert
    expect(screen.getByLabelText('Test Select')).toHaveTextContent('Option 2');
  });

  it('renders with helper text', () => {
    // Arrange & Act
    renderWithFormik(
      <SelectField 
        name="testSelect" 
        label="Test Select" 
        options={options}
        helperText="Helper Text" 
      />,
      { testSelect: '' }
    );
    
    // Assert
    expect(screen.getByText('Helper Text')).toBeInTheDocument();
  });
});

describe('CheckboxField', () => {
  it('renders with label', () => {
    // Arrange & Act
    renderWithFormik(
      <CheckboxField 
        name="testCheckbox" 
        label="Test Checkbox" 
      />,
      { testCheckbox: false }
    );
    
    // Assert
    expect(screen.getByLabelText('Test Checkbox')).toBeInTheDocument();
  });

  it('renders with initial value checked', () => {
    // Arrange & Act
    renderWithFormik(
      <CheckboxField 
        name="testCheckbox" 
        label="Test Checkbox" 
      />,
      { testCheckbox: true }
    );
    
    // Assert
    const checkboxElement = screen.getByLabelText('Test Checkbox') as HTMLInputElement;
    expect(checkboxElement.checked).toBe(true);
  });

  it('updates value on change', () => {
    // Arrange
    renderWithFormik(
      <CheckboxField 
        name="testCheckbox" 
        label="Test Checkbox" 
      />,
      { testCheckbox: false }
    );
    
    // Act
    const checkboxElement = screen.getByLabelText('Test Checkbox');
    fireEvent.click(checkboxElement);
    
    // Assert
    expect((checkboxElement as HTMLInputElement).checked).toBe(true);
  });

  it('renders with helper text', () => {
    // Arrange & Act
    renderWithFormik(
      <CheckboxField 
        name="testCheckbox" 
        label="Test Checkbox" 
        helperText="Helper Text" 
      />,
      { testCheckbox: false }
    );
    
    // Assert
    expect(screen.getByText('Helper Text')).toBeInTheDocument();
  });
});

describe('SwitchField', () => {
  it('renders with label', () => {
    // Arrange & Act
    renderWithFormik(
      <SwitchField 
        name="testSwitch" 
        label="Test Switch" 
      />,
      { testSwitch: false }
    );
    
    // Assert
    expect(screen.getByLabelText('Test Switch')).toBeInTheDocument();
  });

  it('renders with initial value checked', () => {
    // Arrange & Act
    renderWithFormik(
      <SwitchField 
        name="testSwitch" 
        label="Test Switch" 
      />,
      { testSwitch: true }
    );
    
    // Assert
    const switchElement = screen.getByLabelText('Test Switch') as HTMLInputElement;
    expect(switchElement.checked).toBe(true);
  });

  it('updates value on change', () => {
    // Arrange
    renderWithFormik(
      <SwitchField 
        name="testSwitch" 
        label="Test Switch" 
      />,
      { testSwitch: false }
    );
    
    // Act
    const switchElement = screen.getByLabelText('Test Switch');
    fireEvent.click(switchElement);
    
    // Assert
    expect((switchElement as HTMLInputElement).checked).toBe(true);
  });
});

describe('RadioGroupField', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  it('renders with label and options', () => {
    // Arrange & Act
    renderWithFormik(
      <RadioGroupField 
        name="testRadio" 
        label="Test Radio" 
        options={options} 
      />,
      { testRadio: '' }
    );
    
    // Assert
    expect(screen.getByText('Test Radio')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
  });

  it('renders with initial value selected', () => {
    // Arrange & Act
    renderWithFormik(
      <RadioGroupField 
        name="testRadio" 
        label="Test Radio" 
        options={options} 
      />,
      { testRadio: 'option2' }
    );
    
    // Assert
    const radioElement = screen.getByLabelText('Option 2') as HTMLInputElement;
    expect(radioElement.checked).toBe(true);
  });

  it('updates value on change', () => {
    // Arrange
    renderWithFormik(
      <RadioGroupField 
        name="testRadio" 
        label="Test Radio" 
        options={options} 
      />,
      { testRadio: 'option1' }
    );
    
    // Act
    const radioElement = screen.getByLabelText('Option 2');
    fireEvent.click(radioElement);
    
    // Assert
    expect((radioElement as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('Option 1') as HTMLInputElement).checked).toBe(false);
  });

  it('renders with helper text', () => {
    // Arrange & Act
    renderWithFormik(
      <RadioGroupField 
        name="testRadio" 
        label="Test Radio" 
        options={options}
        helperText="Helper Text" 
      />,
      { testRadio: '' }
    );
    
    // Assert
    expect(screen.getByText('Helper Text')).toBeInTheDocument();
  });
});
