import Cookies from 'js-cookie';

export const getCSRFToken = (): string | undefined => {
  return Cookies.get('csrf-token');
};

export const setCSRFToken = (token: string): void => {
  Cookies.set('csrf-token', token, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
};

export const addCSRFTokenToHeaders = (headers: Headers): Headers => {
  const token = getCSRFToken();
  if (token) {
    headers.set('X-CSRF-Token', token);
  }
  return headers;
};

export const withCSRFToken = async <T>(
  fetchFn: (headers: Headers) => Promise<T>
): Promise<T> => {
  const headers = new Headers();
  return fetchFn(addCSRFTokenToHeaders(headers));
}; 