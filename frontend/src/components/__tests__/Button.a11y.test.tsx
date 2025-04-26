import React from 'react';
import { createA11yTestSuite } from '../../../accessibility-tests/axe/axe-react';
import Button from '../common/Button';

// Create accessibility test suite for Button component
createA11yTestSuite(
  Button,
  'Button',
  [
    { children: 'Primary Button', variant: 'primary' },
    { children: 'Secondary Button', variant: 'secondary' },
    { children: 'Danger Button', variant: 'danger' },
    { children: 'Disabled Button', disabled: true },
    { children: 'Loading Button', loading: true },
    { children: 'Button with Icon', icon: 'plus' },
    { children: 'Full Width Button', fullWidth: true },
  ]
);
