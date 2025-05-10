import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      // Jest DOM matchers
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveClass(className: string): R;
      toHaveAttribute(attr: string, value?: string): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeRequired(): R;
      toBeInvalid(): R;
      toBeValid(): R;
      toHaveFocus(): R;
      toHaveStyle(style: Record<string, any>): R;
      toHaveValue(value: string | string[] | number): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveDescription(text: string | RegExp): R;
      toHaveAccessibleName(name: string | RegExp): R;
      toHaveAccessibleDescription(description: string | RegExp): R;
      toHaveRole(role: string): R;

      // Jest matchers
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toHaveLength(expected: number): R;
      toBeGreaterThan(expected: number): R;
      toBeLessThan(expected: number): R;
      toBeGreaterThanOrEqual(expected: number): R;
      toBeLessThanOrEqual(expected: number): R;
      toBeDefined(): R;
      toBeUndefined(): R;
      toBeNull(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toContain(expected: any): R;
      toContainEqual(expected: any): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledTimes(expected: number): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenLastCalledWith(...args: any[]): R;
      toHaveBeenNthCalledWith(nth: number, ...args: any[]): R;
      toHaveReturned(): R;
      toHaveReturnedTimes(expected: number): R;
      toHaveReturnedWith(expected: any): R;
      toHaveLastReturnedWith(expected: any): R;
      toHaveNthReturnedWith(nth: number, expected: any): R;
      toThrow(expected?: string | Error | RegExp | ErrorConstructor): R;
      toThrowError(expected?: string | Error | RegExp | ErrorConstructor): R;
      toMatch(expected: string | RegExp): R;
      toMatchObject(expected: object): R;
      toMatchSnapshot(propertyMatchers?: object, snapshotName?: string): R;
      toMatchInlineSnapshot(propertyMatchers?: object, inlineSnapshot?: string): R;
      rejects: {
        toBe(expected: any): Promise<R>;
        toEqual(expected: any): Promise<R>;
        toThrow(expected?: string | Error | RegExp | ErrorConstructor): Promise<R>;
        toThrowError(expected?: string | Error | RegExp | ErrorConstructor): Promise<R>;
      };
    }

    interface Expect {
      stringContaining(str: string): any;
      objectContaining(obj: object): any;
      arrayContaining(arr: any[]): any;
      stringMatching(str: string | RegExp): any;
      anything(): any;
      any(constructor: any): any;
      assertions(expected: number): void;
      extend(matchers: Record<string, any>): void;
    }
  }
}

export {}; 