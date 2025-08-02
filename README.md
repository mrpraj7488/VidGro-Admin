# VidGro Admin Panel

A comprehensive, modern admin dashboard for the VidGro video promotion platform built with React, TypeScript, and Tailwind CSS. This admin panel provides powerful tools for managing users, videos, analytics, and system configurations with a beautiful gaming-inspired UI.

## 🚀 Features

### 🎮 Gaming-Inspired UI
- **Modern Design**: Beautiful gaming-themed interface with violet/purple color scheme
- **Dark Mode**: Full dark mode support with smooth transitions
- **Responsive**: Mobile-first design that works on all devices
- **Animations**: Smooth animations, hover effects, and micro-interactions
- **Gaming Elements**: Glowing effects, gradients, and interactive components

### 👥 User Management
- **User Overview**: Comprehensive user listing with search and filters
- **VIP Management**: Toggle VIP status for users
- **Coin Management**: Adjust user coin balances with reason tracking
- **User Profiles**: Detailed user profile panels with activity history
- **Bulk Operations**: Send bulk notifications to users
- **User Creation**: Create new users with initial settings

### 🎥 Video Management
- **Video Monitoring**: Track all video promotions and their status
- **Status Updates**: Change video status (active, completed, hold, etc.)
- **Performance Metrics**: View completion rates, watch time, and engagement
- **Refund Processing**: Handle video promotion refunds
- **Search & Filter**: Advanced filtering by status, user, and criteria

### 📊 Analytics Dashboard
- **Real-time Stats**: Live dashboard with key performance indicators
- **Interactive Charts**: Beautiful charts using Recharts library
- **User Growth**: Track daily active users and growth trends
- **Revenue Analytics**: Monitor coin transactions and revenue streams
- **Performance Metrics**: Video completion rates and engagement data
- **Export Functionality**: Download analytics data

### 🐛 Bug Report Management
- **Issue Tracking**: Comprehensive bug report system
- **Priority Management**: Categorize bugs by priority and status
- **Assignment System**: Assign bugs to team members
- **Status Updates**: Track bug resolution progress
- **Categories**: Organize bugs by component (UI/UX, Backend, Mobile, etc.)

### 📧 Communication System
- **Support Inbox**: Manage user support tickets
- **Bulk Notifications**: Send notifications to user groups
- **Email Templates**: Manage email notification templates
- **Real-time Updates**: Live updates for new tickets and messages

### ⚙️ System Configuration
- **Environment Variables**: Manage API keys and configuration
- **SMTP Settings**: Configure email server settings
- **System Health**: Monitor system performance and status
- **Backup & Restore**: Database backup and restoration tools
- **General Settings**: Platform-wide configuration options

### 🔐 Security & Authentication
- **Admin Authentication**: Secure login system
- **Role-based Access**: Different permission levels
- **Session Management**: Secure session handling
- **Admin Settings**: Personal admin account management

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and better developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **Recharts**: Beautiful and responsive charts

### UI Components
- **Custom Components**: Reusable UI components with consistent styling
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icon library
- **Framer Motion**: Smooth animations and transitions
- **Class Variance Authority**: Type-safe component variants

### Data Management
- **Supabase Integration**: PostgreSQL database with real-time features
- **Mock Data**: Comprehensive mock data for development
- **Real-time Updates**: Live data synchronization
- **Error Handling**: Robust error handling and recovery
- **Caching**: Efficient data caching strategies

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── admin/           # Admin-specific components
│   ├── analytics/       # Analytics dashboard
│   ├── auth/           # Authentication components
│   ├── common/         # Shared components
│   ├── dashboard/      # Main dashboard
│   ├── inbox/          # Support inbox
│   ├── layout/         # Layout components
│   ├── reports/        # Bug reports
│   ├── settings/       # System settings
│   ├── ui/             # Base UI components
│   ├── users/          # User management
│   └── videos/         # Video management
├── lib/                # Utility libraries
│   ├── envManager.ts   # Environment variable management
│   ├── errorHandler.ts # Error handling system
│   ├── logger.ts       # Logging utility
│   ├── supabase.ts     # Database client
│   └── utils.ts        # General utilities
├── services/           # External services
│   └── realtimeService.ts # Real-time communication
├── stores/             # State management
│   └── adminStore.ts   # Main admin store
├── types/              # TypeScript definitions
│   └── admin.ts        # Admin-related types
└── styles/
    └── index.css       # Global styles and gaming theme
```

## 🎨 Design System

### Color Palette
- **Primary**: Violet (#8b5cf6) - Main brand color
- **Secondary**: Purple (#7c3aed) - Accent color
- **Success**: Emerald (#10b981) - Success states
- **Warning**: Orange (#f97316) - Warning states
- **Error**: Red (#ef4444) - Error states

### Typography
- **Font**: Inter - Clean, modern sans-serif
- **Weights**: 400, 500, 600, 700, 800, 900
- **Responsive**: Scales appropriately on mobile devices

### Components
- **Gaming Cards**: Glassmorphism effect with subtle borders
- **Interactive Elements**: Hover effects and smooth transitions
- **Buttons**: Gradient backgrounds with shine effects
- **Forms**: Consistent styling with focus states

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (optional for demo mode)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vidgro-admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   - Supabase credentials
   - Admin settings
   - API endpoints
   - Firebase configuration (for notifications)

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Demo Mode
The application includes comprehensive mock data, so you can run it without configuring external services. Simply start the development server and explore all features with sample data.

## 🔧 Configuration

### Environment Variables
Configure the following in your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin Configuration
VITE_ADMIN_EMAIL=admin@vidgro.com
VITE_ADMIN_SECRET_KEY=your_admin_secret_key

# App Configuration
VITE_APP_NAME=VidGro Admin Panel
VITE_API_BASE_URL=https://your-api-domain.com

# Firebase Configuration (for push notifications)
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_CLIENT_EMAIL=your_firebase_client_email
VITE_FIREBASE_PRIVATE_KEY=your_firebase_private_key
VITE_FCM_SERVER_KEY=your_fcm_server_key

# Security
VITE_JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Supabase Setup
If using Supabase, ensure your database has the following tables:
- `profiles` - User profiles and data
- `videos` - Video promotion data
- `transactions` - Coin transaction history
- `admin_logs` - Admin action logging
- `bug_reports` - Bug tracking system

## 📱 Features Overview

### Dashboard
- **Key Metrics**: Total users, active videos, VIP users, monthly revenue
- **Growth Charts**: User growth trends and activity patterns
- **Recent Activity**: Live feed of platform activities
- **Quick Actions**: Fast access to common admin tasks

### User Management
- **User List**: Paginated list with search and filtering
- **Profile Management**: Detailed user profiles with edit capabilities
- **Coin Operations**: Add/remove coins with audit trail
- **VIP Management**: Upgrade/downgrade user status
- **Communication**: Send notifications and messages

### Video Management
- **Video Queue**: All video promotions with status tracking
- **Performance Analytics**: Completion rates, watch time, engagement
- **Status Management**: Approve, reject, or modify video promotions
- **Refund System**: Process refunds with detailed tracking

### Analytics
- **User Analytics**: Growth, retention, and engagement metrics
- **Revenue Analytics**: Coin transactions and revenue streams
- **Video Analytics**: Performance metrics and trends
- **Export Tools**: Download data in various formats

### System Management
- **Environment Config**: Manage API keys and settings
- **Health Monitoring**: System status and performance metrics
- **Backup Tools**: Database backup and restoration
- **Email Configuration**: SMTP settings and templates

## 🛠️ Development

### Code Style
- **ESLint**: Configured with React and TypeScript rules
- **Prettier**: Code formatting (configure as needed)
- **TypeScript**: Strict mode enabled for type safety

### State Management
- **Zustand**: Lightweight state management
- **Local State**: React hooks for component-level state
- **Persistence**: Important data persisted to localStorage

### Error Handling
- **Error Boundaries**: Catch and handle React errors
- **Global Handler**: Centralized error processing
- **User Feedback**: Meaningful error messages
- **Logging**: Comprehensive error logging

### Performance
- **Code Splitting**: Lazy loading for better performance
- **Memoization**: Optimized re-renders
- **Image Optimization**: Efficient image loading
- **Bundle Analysis**: Monitor bundle size

## 🔒 Security

### Authentication
- **Secure Login**: Email/password authentication
- **Session Management**: Secure session handling
- **Auto Logout**: Automatic logout on inactivity
- **Password Security**: Strong password requirements

### Data Protection
- **Input Validation**: All inputs validated and sanitized
- **XSS Protection**: Protection against cross-site scripting
- **CSRF Protection**: Cross-site request forgery prevention
- **Secure Headers**: Security headers implementation

## 🚀 Deployment

### Build Process
```bash
npm run build:clean  # Clean build
npm run build       # Production build
npm run preview     # Preview production build
```

### Environment Setup
- Configure production environment variables
- Set up proper CORS settings
- Configure security headers
- Set up monitoring and logging

### Hosting Options
- **Netlify**: Easy deployment with continuous integration
- **Vercel**: Optimized for React applications
- **AWS S3 + CloudFront**: Scalable static hosting
- **Custom Server**: Deploy to your own infrastructure

## 📊 Monitoring

### Analytics
- **User Behavior**: Track admin user interactions
- **Performance**: Monitor application performance
- **Errors**: Track and analyze errors
- **Usage Patterns**: Understand feature usage

### Health Checks
- **System Status**: Monitor system health
- **Database**: Database connection and performance
- **External APIs**: Third-party service status
- **Resource Usage**: CPU, memory, and storage monitoring

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Use consistent naming conventions
- Write meaningful commit messages
- Add comments for complex logic

## 📄 License

This project is proprietary software for VidGro platform administration.

## 🆘 Support

For technical support or questions:
- **Email**: admin@vidgro.com
- **Documentation**: Check inline code comments
- **Issues**: Use the issue tracker for bugs

---

**VidGro Admin Panel** - Empowering administrators with powerful tools and beautiful interfaces. 🎮✨