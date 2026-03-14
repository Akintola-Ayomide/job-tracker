# Job Tracker Application

A full-stack job application tracking system to help you organize and monitor your job search journey.

This project consists of two main components:
- **Client** (Next.js frontend) - Modern, responsive web interface
- **Server** (NestJS backend) - RESTful API with authentication and database

---

## 📁 Project Structure

```
job-tracker/
├── README.md              # This file
├── server/                # NestJS backend API
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── applications/ # Job applications module
│   │   ├── users/        # User management
│   │   └── ...
│   ├── .env.example
│   ├── package.json
│   └── README.md         # Server-specific documentation
│
└── (client files in root) # Next.js frontend
    ├── app/
    ├── components/
    ├── lib/
    ├── package.json
    └── ... (see original README)
```

**Note**: The frontend files remain in the root directory. Only the backend has been separated into the `server` folder.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Neon PostgreSQL database (or any PostgreSQL instance)
- Google OAuth credentials (optional, for social login)
- Email service credentials (Gmail, SendGrid, or Resend)

### 1. Set Up the Server

```bash
cd server
pnpm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your database URL, JWT secret, etc.

# Run the server
pnpm run start:dev
```

Server will run on `http://localhost:3001`

**📖 For detailed server setup instructions**, see [server/README.md](./server/README.md)

### 2. Set Up the Client

The client setup remains the same as the original project. Since the backend is now separate, you'll need to configure the API URL.

```bash
# In the root directory (where package.json for client is)
pnpm install

# Create .env.local for client config
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Run the client
pnpm run dev
```

Client will run on `http://localhost:3000`

---

## ✨ Features

### Current Features

- ✅ **User Authentication**
  - Email/password registration and login
  - Google OAuth 2.0 integration
  - JWT-based session management
  - Password reset via email

- ✅ **Job Application Management**
  - Create, read, update, delete applications
  - Track application status (applied, interview, offer, rejected, accepted)
  - Add notes, salary info, and location
  - User-isolated data (users only see their own applications)

- ✅ **Analytics Dashboard**
  - Visualize applications by status
  - Track total applications, interviews, offers
  - Interactive charts (Recharts)

- ✅ **Modern UI**
  - Dark/light mode toggle
  - Responsive design (mobile, tablet, desktop)
  - Smooth animations with Framer Motion
  - Clean, professional aesthetics

### Architecture

- **Frontend**: Next.js 15, TypeScript, TailwindCSS, Zustand, RadixUI
- **Backend**: NestJS, TypeORM, PostgreSQL (Neon), Passport.js
- **Authentication**: JWT + OAuth2.0 (Google)
- **Database**: PostgreSQL with TypeORM entities
- **Security**: bcrypt, rate limiting, CORS, input validation

---

## 📚 Documentation

- **[Server README](./server/README.md)** - Comprehensive backend documentation
  - Setup instructions
  - API endpoint reference
  - Database schema
  - Authentication flows
  - Deployment guide

- **[Future Recommendations](./plan.md)** - Planned enhancements and feature roadmap

---

## 🛠️ Development

### Running Both Client and Server

You'll need two terminal windows:

**Terminal 1 - Server**:
```bash
cd server
pnpm run start:dev
```

**Terminal 2 - Client**:
```bash
# In root directory
pnpm run dev
```

### Build for Production

**Server**:
```bash
cd server
pnpm run build
pnpm run start:prod
```

**Client**:
```bash
pnpm run build
pnpm start
```

---

## 🔒 Environment Variables

### Server (server/.env)

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=...
EMAIL_USER=...
FRONTEND_URL=http://localhost:3000
PORT=3001
```

### Client (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 📖 API Reference

See **[server/README.md](./server/README.md)** for full API documentation.

### Quick Reference

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/applications` - Get all applications
- `POST /api/applications` - Create application
- `PATCH /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application
- `GET /api/applications/statistics` - Get statistics

---

## 🧪 Testing

### Backend Tests

```bash
cd server
pnpm run test         # Unit tests
pnpm run test:e2e     # End-to-end tests
pnpm run test:cov     # Coverage
```

### Frontend Tests

```bash
# In root directory
pnpm run test
```

---

## 🚀 Deployment

### Deploy Server

**Railway / Render / Heroku**:
1. Connect your GitHub repository
2. Select `server` folder as root
3. Add environment variables
4. Deploy

**Environment Requirements**:
- Node.js 18+
- PostgreSQL database (Neon recommended)

### Deploy Client

**Vercel (Recommended)**:
```bash
vercel
```

Or connect via GitHub integration.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT

---

## 🙏 Acknowledgments

- NestJS for the amazing backend framework
- Next.js team for the incredible developer experience
- Neon for serverless PostgreSQL
- All open-source contributors

---

## 📞 Support

For issues and questions:
- Check the [Server README](./server/README.md) for backend-specific issues
- Review the [Future Recommendations](./plan.md) for planned features
- Open an issue on GitHub

---

**Happy job hunting! 🎉**
