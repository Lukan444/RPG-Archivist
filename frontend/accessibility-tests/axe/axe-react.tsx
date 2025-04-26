import React from 'react';
import ReactDOM from 'react-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

// Add jest-axe matcher
expect.extend(toHaveNoViolations);

/**
 * Test a React component for accessibility violations
 * @param Component The React component to test
 * @param props Props to pass to the component
 * @returns Promise that resolves with the axe results
 */
export async function testComponentA11y(Component: React.ComponentType<any>, props: any = {}): Promise<any> {
  const { container } = render(<Component {...props} />);
  const results = await axe(container);
  return results;
}

/**
 * Test a React component for accessibility violations and log the results
 * @param Component The React component to test
 * @param props Props to pass to the component
 * @param componentName Name of the component for logging
 */
export async function logComponentA11y(Component: React.ComponentType<any>, props: any = {}, componentName: string): Promise<any> {
  const results = await testComponentA11y(Component, props);

  if (results.violations.length === 0) {
    console.log(`✅ ${componentName} has no accessibility violations`);
  } else {
    console.error(`❌ ${componentName} has ${results.violations.length} accessibility violations:`);
    results.violations.forEach((violation: any) => {
      console.error(`- ${violation.id}: ${violation.description}`);
      console.error(`  Impact: ${violation.impact}`);
      console.error(`  Help: ${violation.help}`);
      console.error(`  Help URL: ${violation.helpUrl}`);
      console.error(`  Nodes: ${violation.nodes.length}`);
    });
  }

  return results;
}

/**
 * Create a test suite for a React component's accessibility
 * @param Component The React component to test
 * @param componentName Name of the component for the test suite
 * @param propsVariations Different prop variations to test
 */
export function createA11yTestSuite(
  Component: React.ComponentType<any>,
  componentName: string,
  propsVariations: any[] = [{}]
) {
  describe(`${componentName} accessibility`, () => {
    propsVariations.forEach((props, index) => {
      const testName = propsVariations.length > 1
        ? `should have no accessibility violations with props variation ${index + 1}`
        : 'should have no accessibility violations';

      it(testName, async () => {
        const results = await testComponentA11y(Component, props);
        expect(results).toHaveNoViolations();
      });
    });
  });
}
