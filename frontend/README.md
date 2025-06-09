# FinLock Frontend

Next.js React frontend for the FinLock fintech application.

## Features

- Modern React with Next.js 14
- Tailwind CSS for styling
- TypeScript for type safety
- Responsive design
- Real-time updates
- Form validation
- State management

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Start development server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Project Structure

```
src/
├── app/           # Next.js app directory
├── components/    # Reusable components
├── lib/          # Utility functions
├── hooks/        # Custom React hooks
├── types/        # TypeScript type definitions
└── styles/       # Global styles
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=FinLock
```
