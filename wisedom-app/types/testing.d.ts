import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toHaveClass(...classNames: string[]): R;
      toHaveStyle(style: Record<string, any>): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveValue(value: string | string[] | number): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenCalledTimes(count: number): R;
      toHaveLength(length: number): R;
      toContain(item: any): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(html: string): R;
      toHaveAccessibleDescription(description?: string | RegExp): R;
      toHaveAccessibleName(name?: string | RegExp): R;
      toHaveFocus(): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toBeEmpty(): R;
      toBeEmptyDOMElement(): R;
      toBeInvalid(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toBeInstanceOf(type: any): R;
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R;
      toHaveErrorMessage(text: string | RegExp): R;
      toHaveFormValues(values: { [key: string]: any }): R;
      toMatchSnapshot(): R;
      toThrow(error?: string | RegExp | Error): R;
      toThrowError(error?: string | RegExp | Error): R;
    }
  }
}

export {}; 