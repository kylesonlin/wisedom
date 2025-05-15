import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(...classNames: string[]): R;
      toHaveStyle(style: Record<string, any>): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeRequired(): R;
      toBeInvalid(): R;
      toBeValid(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveValue(value?: string | string[] | number): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveDescription(text?: string | RegExp): R;
      toHaveAccessibleDescription(text?: string | RegExp): R;
      toHaveAccessibleName(text?: string | RegExp): R;
      toHaveFocus(): R;
      toBeEmptyDOMElement(): R;
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
      toHaveFormValues(expectedValues: Record<string, any>): R;
      toBeInTheDOM(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(htmlText: string): R;
    }
  }
} 