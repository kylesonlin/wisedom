import { z } from 'zod';
import { toast } from '@/utils/toast';

type ValidationSchema = z.ZodType<any, any>;

interface ValidationOptions {
  onSuccess?: (data: any) => void;
  onError?: (errors: z.ZodError) => void;
  showToast?: boolean;
}

export function createFormValidator<T extends ValidationSchema>(
  schema: T,
  options: ValidationOptions = {}
) {
  return async (data: unknown): Promise<z.infer<T> | null> => {
    try {
      const validatedData = await schema.parseAsync(data);
      options.onSuccess?.(validatedData);
      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        if (options.showToast) {
          toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: errors[0]?.message || 'Please check your input',
          });
        }

        options.onError?.(error);
      }
      return null;
    }
  };
}

export function createFormFieldValidator<T extends ValidationSchema>(
  schema: T,
  options: ValidationOptions = {}
) {
  return async (value: unknown): Promise<z.infer<T> | null> => {
    try {
      const validatedValue = await schema.parseAsync(value);
      options.onSuccess?.(validatedValue);
      return validatedValue;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors[0]?.message;
        
        if (options.showToast && message) {
          toast({
            variant: 'destructive',
            title: 'Invalid Input',
            description: message,
          });
        }

        options.onError?.(error);
      }
      return null;
    }
  };
}

export function createFormArrayValidator<T extends ValidationSchema>(
  schema: T,
  options: ValidationOptions = {}
) {
  return async (values: unknown[]): Promise<z.infer<T>[] | null> => {
    try {
      const validatedValues = await Promise.all(
        values.map((value) => schema.parseAsync(value))
      );
      options.onSuccess?.(validatedValues);
      return validatedValues;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          index: parseInt(err.path[0] as string),
          message: err.message,
        }));

        if (options.showToast) {
          toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: errors[0]?.message || 'Please check your input',
          });
        }

        options.onError?.(error);
      }
      return null;
    }
  };
} 