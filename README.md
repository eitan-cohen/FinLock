# FinLock - Secure Fintech Application

FinLock is a comprehensive fintech application that provides secure financial services with advanced card management, transaction monitoring, and user authentication features.

## 🏗️ Architecture

This repository contains:
- **Backend**: Node.js/Express API server with PostgreSQL database
- **Frontend**: Next.js React application with modern UI

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Redis server
- Lithic API credentials (for card services)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

4. Run database migrations:
```bash
npm run migrate
```

5. Start the backend server:
```bash
npm run dev
```

The backend will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your API endpoints
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📋 Features

### Core Features
- **User Authentication**: Secure login/signup with JWT tokens
- **Card Management**: Create, view, and manage virtual/physical cards
- **Transaction Monitoring**: Real-time transaction tracking and history
- **Account Management**: User profile and account settings
- **Security**: Advanced security features and fraud detection

### Technical Features
- **RESTful API**: Well-structured backend API
- **Real-time Updates**: WebSocket support for live data
- **Database**: PostgreSQL with proper migrations
- **Caching**: Redis for improved performance
- **Modern UI**: Responsive design with Tailwind CSS

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Cards
- `GET /api/cards` - Get user cards
- `POST /api/cards` - Create new card
- `GET /api/cards/:id` - Get card details
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

### Transactions
- `GET /api/transactions` - Get transaction history
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions` - Create transaction

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `cards` - Card information and settings
- `transactions` - Transaction records
- `sessions` - User session management

## 🔧 Configuration

### Backend Environment Variables
```env
DATABASE_URL=postgresql://username:password@localhost:5432/finlock
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
LITHIC_API_KEY=your-lithic-api-key
PORT=3000
```

### Frontend Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=FinLock
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Deployment

### Backend Deployment
1. Set production environment variables
2. Run database migrations: `npm run migrate`
3. Build the application: `npm run build`
4. Start the server: `npm start`

### Frontend Deployment
1. Set production environment variables
2. Build the application: `npm run build`
3. Start the server: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.

## 🔗 Links

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [API Documentation](./docs/api.md)
