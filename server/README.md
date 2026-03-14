# Job Tracker - Backend Server

NestJS backend server for the Job Application Tracker with PostgreSQL database, JWT authentication, Google OAuth, and password reset functionality.

## 🎯 Features

- ✅ **User Authentication**
  - Email/Password registration and login
  - Google OAuth 2.0 integration
  - JWT token-based authentication
  - Password reset via email
  - Secure password hashing with bcrypt

- ✅ **Job Application Management**
  - CRUD operations for job applications
  - User-isolated data (users only see their own applications)
  - Statistics calculation by status
  - Filtering and sorting support

- ✅ **Security**
  - Rate limiting to prevent brute force attacks
  - CORS configuration
  - Input validation with class-validator
  - SQL injection protection via TypeORM
  - Helmet security headers

## 🛠️ Tech Stack

- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **[TypeORM](https://typeorm.io/)** - ORM for TypeScript and JavaScript
- **[PostgreSQL](https://www.postgresql.org/)** (Neon) - Database
- **[Passport.js](http://www.passportjs.org/)** - Authentication middleware
- **[JWT](https://jwt.io/)** - JSON Web Tokens
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js/)** - Password hashing
- **[Nodemailer](https://nodemailer.com/)** - Email sending

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Neon PostgreSQL database account
- Google Cloud Console project (for OAuth)
- Email service credentials (Gmail, SendGrid, or Resend)

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
cd server
pnpm install
```

### 2. Set Up Neon Database

1. Create a free account at [Neon](https://neon.tech/)
2. Create a new project
3. Copy your connection string (it looks like: `postgresql://user:password@host/database?sslmode=require`)

### 3. Set Up Google OAuth (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
7. Copy your Client ID and Client Secret

### 4. Set Up Email Service

**Option A: Gmail (Easiest for Development)**

1. Enable 2-factor authentication on your Gmail account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Create a new app password
4. Use this password in your .env file

**Option B: SendGrid**

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Update .env to use SendGrid SMTP

**Option C: Resend**  

1. Sign up at [Resend](https://resend.com/)
2. Get your API key
3. Update .env accordingly

### 5. Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://your-username:your-password@your-host/your-database?sslmode=require

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-from-console
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@jobtracker.com

# Frontend URL (for CORS and OAuth redirects)
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 6. Run Development Server

```bash
pnpm run start:dev
```

The server will start on `http://localhost:3001`

### 7. Build for Production

```bash
pnpm run build
pnpm run start:prod
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login with email/password | No |
| GET | `/api/auth/google` | Initiate Google OAuth | No |
| GET | `/api/auth/google/callback` | Google OAuth callback | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |
| GET | `/api/auth/me` | Get current user info | Yes |

### Job Applications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/applications` | Get all user's applications | Yes |
| GET | `/api/applications/:id` | Get single application | Yes |
| POST | `/api/applications` | Create new application | Yes |
| PATCH | `/api/applications/:id` | Update application | Yes |
| DELETE | `/api/applications/:id` | Delete application | Yes |
| GET | `/api/applications/statistics` | Get user's statistics | Yes |

### Request/Response Examples

#### Register

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### Create Application

```bash
POST /api/applications
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "company": "Tech Corp",
  "role": "Senior Developer",
  "status": "applied",
  "dateApplied": "2026-02-08",
  "salary": "$120,000",
  "location": "Remote",
  "notes": "Applied through LinkedIn"
}
```

## 🗄️ Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR | Unique email |
| password | VARCHAR | Hashed password (nullable for OAuth users) |
| name | VARCHAR | User's full name |
| googleId | VARCHAR | Google OAuth ID (nullable) |
| emailVerified | BOOLEAN | Email verification status |
| resetPasswordToken | VARCHAR | Reset token (nullable) |
| resetPasswordExpires | TIMESTAMP | Token expiration (nullable) |
| createdAt | TIMESTAMP | Account creation date |
| updatedAt | TIMESTAMP | Last update date |

### Job Applications Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| company | VARCHAR | Company name |
| role | VARCHAR | Job title/role |
| status | ENUM | Application status |
| dateApplied | TIMESTAMP | Application date |
| notes | TEXT | Additional notes |
| salary | VARCHAR | Salary information |
| location | VARCHAR | Job location |
| userId | UUID | Foreign key to users |
| createdAt | TIMESTAMP | Record creation date |
| updatedAt | TIMESTAMP | Last update date |

**Application Status Enum:** `applied`, `interview`, `offer`, `rejected`, `accepted`

## 🔒 Security Features

1. **Password Security**
   - Passwords hashed with bcrypt (10 salt rounds)
   - Minimum 8 characters required
   - Passwords never returned in API responses

2. **JWT Authentication**
   - Short-lived access tokens (15 minutes)
   - Tokens include user ID and email
   - Bearer token authentication

3. **Rate Limiting**
   - 10 requests per minute per IP
   - Prevents brute force attacks

4. **Input Validation**
   - All DTOs use class-validator
   - Whitelist and forbidNonWhitelisted enabled
   - Email format validation

5. **User Isolation**
   - Applications filtered by authenticated user
   - Unauthorized access returns 403 Forbidden

6. **CORS**
   - Restricted to frontend URL only
   - Credentials enabled for cookie-based auth

## 🧪 Testing

Run the test suite:

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Coverage
pnpm run test:cov
```

## 🚀 Deployment

### Deploy to Railway

1. Create account at [Railway](https://railway.app/)
2. Create new project
3. Add Neon PostgreSQL database
4. Add environment variables
5. Deploy from GitHub

### Deploy to Render

1. Create account at [Render](https://render.com/)
2. Create new Web Service
3. Connect your repository
4. Add environment variables
5. Set build command: `pnpm install && pnpm run build`
6. Set start command: `pnpm run start:prod`

### Deploy to Heroku

```bash
# Install Heroku CLI
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
heroku config:set JWT_SECRET=your-secret
# ... set other env vars
git push heroku main
```

## 📚 Project Structure

```
server/
├── src/
│   ├── auth/
│   │   ├── dto/                    # Data transfer objects
│   │   ├── guards/                 # Auth guards
│   │   ├── strategies/             # Passport strategies
│   │   ├── auth.controller.ts      # Auth endpoints
│   │   ├── auth.service.ts         # Auth logic
│   │   └── auth.module.ts          # Auth module
│   ├── users/
│   │   ├── entities/
│   │   │   └── user.entity.ts      # User database model
│   │   └── users.module.ts
│   ├── applications/
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── job-application.entity.ts
│   │   ├── applications.controller.ts
│   │   ├── applications.service.ts
│   │   └── applications.module.ts
│   ├── app.module.ts               # Root module
│   └── main.ts                     # Application entry
├── .env                            # Environment variables
├── .env.example                    # Environment template
├── package.json
└── tsconfig.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📝 License

MIT

## 🐛 Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Ensure SSL mode is set (`?sslmode=require`)
- Check Neon dashboard for IP allowlist settings

### Google OAuth Not Working

- Verify redirect URI matches exactly (including protocol and port)
- Check that OAuth consent screen is configured
- Ensure client ID and secret are correct

### Email Not Sending

- For Gmail: Ensure 2FA is enabled and you're using an app password
- Check spam folder
- Verify SMTP credentials and port settings

### TypeORM Synchronize Warning

- In production, set `synchronize: false` in `app.module.ts`
- Use migrations instead: `pnpm run migration:generate`

---

**Made with ❤️ using NestJS**
