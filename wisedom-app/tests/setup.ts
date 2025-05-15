import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

// Mock Supabase client
vi.mock('@/utils/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock rate limiter
vi.mock('@/utils/rate-limiter', () => ({
  rateLimiter: {
    isAllowed: vi.fn().mockReturnValue(true),
    getRemainingTokens: vi.fn().mockReturnValue(100),
  },
}));

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
}); 