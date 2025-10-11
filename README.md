# MyHealthLink - One Link for Your Health

A secure, mobile-first platform to store, organize, and share your health information via a single link or QR code.

## Features

- **User Authentication**: Secure registration and login with OTP verification
- **Profile Management**: Complete health profile with medical information
- **Document Storage**: Upload and organize medical documents
- **Health Tracking**: Monitor health metrics and set reminders
- **Shareable Links**: Generate secure links and QR codes for sharing
- **Emergency Access**: Quick access to critical health information

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- npm or yarn

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/my-health-link

# JWT Secret (change this to a secure random string in production)
JWT_SECRET=yourreally_very_secret_key_change_this_in_production

# Node Environment
NODE_ENV=development

# Email Configuration (for OTP and notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables (see Environment Setup above)

4. Test your email configuration:
   ```bash
   node test-email.js
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **UI Components**: Lucide React icons, React Hook Form
- **State Management**: TanStack Query
- **Notifications**: React Hot Toast

## Project Structure

```
app/
├── api/                 # API routes
│   ├── auth/           # Authentication endpoints
│   ├── documents/      # Document management
│   └── user/          # User profile management
├── dashboard/          # Dashboard page
├── documents/          # Documents page
├── login/             # Login page
├── profile/           # Profile management page
├── register/          # Registration page
└── verify-otp/       # OTP verification page

lib/
├── models/           # MongoDB models
├── auth.js          # Authentication utilities
└── mongodb.js       # Database connection
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-otp` - Email OTP verification
- `POST /api/auth/resend-otp` - Resend verification code
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/validate-reset-token` - Validate reset token

### User Management
- `GET /api/user` - Get user profile
- `PUT /api/user` - Update user profile

### Documents
- `GET /api/documents` - Get user documents
- `POST /api/documents` - Upload document

## Development

The project uses Next.js with Turbopack for fast development builds.

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Troubleshooting

### Email Issues

If users are not receiving verification emails:

1. **Test Email Configuration**:
   ```bash
   node test-email.js
   ```

2. **Check Environment Variables**:
   - Ensure all SMTP variables are set in `.env.local`
   - For Gmail, use App Passwords instead of regular passwords
   - Verify SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS are correct

3. **Common Gmail Setup**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Check Console Logs**:
   - Look for email sending errors in the server console
   - Check for SMTP authentication failures

### Database Issues

If MongoDB connection fails:
- Ensure MongoDB is running
- Check MONGODB_URI in `.env.local`
- Verify database permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
