import { cookies } from 'next/headers';

export default function TestCookies() {
  const cookieStore = cookies() as unknown as { get: (name: string) => { value: string } | undefined };
  const test = cookieStore.get('test');
  return <div>Test: {test?.value}</div>;
} 