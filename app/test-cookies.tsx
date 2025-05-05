import { cookies } from 'next/headers';

export default function TestCookies() {
  const cookieStore = cookies();
  const test = cookieStore.get('test');
  return <div>Test: {test?.value}</div>;
} 