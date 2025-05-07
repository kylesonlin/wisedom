# Dashboard Application

A modern, customizable dashboard application built with Next.js, TypeScript, and Supabase.

## Features

- Customizable widget layout
- Drag and drop widget reordering
- Real-time data updates
- AI-powered action suggestions
- Relationship strength tracking
- Contact management
- Project tracking

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your configuration values.

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

## Development

### Project Structure

```
├── app/
│   ├── components/
│   │   └── new-dashboard/
│   │       └── DashboardLayout.tsx
│   ├── hooks/
│   │   └── useWidgets.ts
│   └── page.tsx
├── public/
└── ...
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 