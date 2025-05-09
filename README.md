# Dashboard Widget System

A modern, type-safe dashboard widget system built with Next.js, React, and TypeScript.

## Features

- 🎯 Type-safe widget system with Zod validation
- 🔄 Real-time widget updates and reordering
- 🎨 Customizable widget layouts and themes
- 📱 Responsive design with mobile support
- 🐛 Comprehensive error tracking with Sentry
- ✅ Full test coverage with Jest and React Testing Library

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dashboard-widgets.git
cd dashboard-widgets
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` and add your Sentry DSN:
```
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

4. Start the development server:
```bash
npm run dev
```

### Running Tests

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
├── app/                    # Next.js app directory
│   └── components/        # React components
├── hooks/                 # Custom React hooks
├── services/             # Business logic and services
├── types/                # TypeScript type definitions
└── __tests__/           # Test files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 