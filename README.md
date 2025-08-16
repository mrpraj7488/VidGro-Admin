# VidGro Admin Panel

A comprehensive admin dashboard for managing the VidGro video promotion platform.

## Features

- **User Management**: View, edit, and manage user accounts with VIP status and coin balances
- **Video Management**: Monitor video promotions, track performance, and manage content
- **Analytics Dashboard**: Real-time insights into platform performance and user engagement
- **Coin Transactions**: Track all coin-related transactions and financial activity
- **Bug Reports**: Manage and respond to user-submitted bug reports
- **System Configuration**: Configure runtime settings and environment variables
- **Database Backup**: Create and manage complete database backups
- **Support Inbox**: Handle user support tickets and communications

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom gaming-themed components
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Authentication**: Supabase Auth

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Configure your Supabase credentials
   - Set admin authentication details

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start API Server** (in separate terminal)
   ```bash
   npm run server
   ```

5. **Access Admin Panel**
   - Frontend: http://localhost:5173
   - API Server: http://localhost:3001

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard views and metrics
│   ├── users/          # User management components
│   ├── videos/         # Video management components
│   ├── analytics/      # Analytics and reporting
│   ├── settings/       # System configuration
│   ├── inbox/          # Support ticket management
│   ├── reports/        # Bug report management
│   ├── layout/         # Layout components (header, sidebar)
│   ├── ui/             # Reusable UI components
│   └── common/         # Common utilities (error boundary)
├── lib/                # Utility libraries
│   ├── supabase.ts     # Supabase client configuration
│   ├── envManager.ts   # Environment variable management
│   ├── logger.ts       # Centralized logging
│   ├── errorHandler.ts # Error handling utilities
│   └── utils.ts        # General utilities
├── services/           # Business logic services
│   ├── backupService.ts    # Database backup operations
│   ├── configService.ts    # Runtime configuration
│   └── realtimeService.ts  # Real-time updates
├── stores/             # State management
│   └── adminStore.ts   # Main admin state store
└── types/              # TypeScript type definitions
    └── admin.ts        # Admin panel types
```

## Authentication

Default admin credentials:
- Email: `admin@vidgro.com`
- Password: `vidgro_admin_secret_2024`

## Database Schema

The application uses Supabase with the following main tables:
- `profiles` - User accounts and profile data
- `videos` - Video promotion records
- `transactions` - Coin transaction history
- `support_tickets` - User support requests
- `bug_reports` - Bug report submissions
- `security_events` - Security audit logs

## API Endpoints

- `/api/client-runtime-config` - Mobile app configuration
- `/api/admin/runtime-config` - Admin configuration management
- `/api/admin/database-backup` - Database backup operations
- `/api/bug-report` - Bug report submission
- `/health` - System health check

## Development

- **Hot Reload**: Vite provides instant hot module replacement
- **Type Safety**: Full TypeScript support with strict type checking
- **Code Quality**: ESLint configuration for consistent code style
- **Responsive Design**: Mobile-first responsive design approach

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist/` directory
3. Deploy both frontend and API server to your hosting platform
4. Configure environment variables in production

## Security

- Row Level Security (RLS) enabled on all database tables
- API key authentication for protected endpoints
- Admin role-based access control
- Secure environment variable management
- Audit logging for all administrative actions

## Support

For technical support or questions about the admin panel, contact the development team.