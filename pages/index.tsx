import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Welcome to Wisedom</h1>
      <p>Wisedom is your mission control for managing your network and tasks efficiently.</p>
      <Link href="https://app.wisedom.ai">
        <button>Go to Mission Control</button>
      </Link>
    </div>
  );
} 