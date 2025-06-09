# FinLock Backend

Node.js/Express backend API for the FinLock fintech application.

## Features

- RESTful API with Express.js
- PostgreSQL database with migrations
- Redis caching
- JWT authentication
- Lithic card services integration
- Input validation and sanitization
- Error handling and logging

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Run database migrations:
```bash
npm run migrate
```

4. Start development server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run migrate` - Run database migrations

## API Documentation

The API follows RESTful conventions and returns JSON responses.

### Authentication Required
Most endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Error Responses
All errors follow this format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```
