# VidGro Admin Panel

A comprehensive admin panel for managing the VidGro mobile application, built with React, TypeScript, and Supabase.

## 🚀 Features

- **User Management**: View, search, and manage user accounts with VIP status tracking
- **Video Management**: Monitor and control video status, promotions, and analytics
- **Analytics Dashboard**: Real-time platform statistics and comprehensive insights
- **Admin Authentication**: Secure role-based access control with permission management
- **System Configuration**: Manage platform settings, environment variables, and parameters
- **Admin Logging**: Track all admin actions and changes with detailed audit trails
- **Bug Report Management**: Track and manage application issues and bug reports
- **Real-time Updates**: Live data synchronization and notifications

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Headless UI, Radix UI
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with custom admin roles

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase project with the required database schema
- Admin credentials

## 🗄 Database Schema

### Core Tables

#### `profiles` - User Accounts
```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  username text NOT NULL,
  coins integer NOT NULL DEFAULT 100,
  is_vip boolean NULL DEFAULT false,
  vip_expires_at timestamp with time zone NULL,
  referral_code text NULL DEFAULT encode(extensions.gen_random_bytes(6), 'base64'::text),
  referred_by uuid NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_email_key UNIQUE (email),
  CONSTRAINT profiles_referral_code_key UNIQUE (referral_code),
  CONSTRAINT profiles_username_key UNIQUE (username),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT profiles_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES profiles (id),
  CONSTRAINT profiles_coins_check CHECK ((coins >= 0))
);
```

#### `videos` - Video Content
```sql
CREATE TABLE public.videos (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  youtube_url text NOT NULL,
  title text NOT NULL,
  views_count integer NOT NULL DEFAULT 0,
  target_views integer NOT NULL,
  duration_seconds integer NOT NULL,
  coin_reward integer NOT NULL,
  coin_cost integer NOT NULL,
  status text NULL DEFAULT 'on_hold'::text,
  hold_until timestamp with time zone NULL DEFAULT (now() + '00:10:00'::interval),
  repromoted_at timestamp with time zone NULL,
  total_watch_time integer NULL DEFAULT 0,
  completion_rate numeric(5, 2) NULL DEFAULT 0.0,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  completed boolean NULL DEFAULT false,
  coins_earned_total integer NULL DEFAULT 0,
  CONSTRAINT videos_pkey PRIMARY KEY (id),
  CONSTRAINT videos_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT videos_duration_seconds_check CHECK ((duration_seconds > 0)),
  CONSTRAINT videos_status_check CHECK (
    (status = ANY (ARRAY['active'::text, 'paused'::text, 'completed'::text, 'on_hold'::text, 'repromoted'::text, 'deleted'::text]))
  ),
  CONSTRAINT videos_target_views_check CHECK ((target_views > 0)),
  CONSTRAINT videos_coin_cost_check CHECK ((coin_cost > 0)),
  CONSTRAINT videos_views_count_check CHECK ((views_count >= 0)),
  CONSTRAINT videos_coin_reward_check CHECK ((coin_reward > 0))
);
```

#### `admin_profiles` - Admin Accounts
```sql
CREATE TABLE public.admin_profiles (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NULL,
  email text NOT NULL,
  role text NOT NULL,
  permissions jsonb NULL DEFAULT '{}'::jsonb,
  is_active boolean NULL DEFAULT true,
  last_login timestamp with time zone NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT admin_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT admin_profiles_email_key UNIQUE (email),
  CONSTRAINT admin_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT admin_profiles_role_check CHECK (
    (role = ANY (ARRAY['super_admin'::text, 'content_moderator'::text, 'analytics_viewer'::text, 'user_support'::text]))
  )
);
```

#### `admin_logs` - Admin Activity Logs
```sql
CREATE TABLE public.admin_logs (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  admin_id text NOT NULL,
  action text NOT NULL,
  target_type text NULL,
  target_id uuid NULL,
  old_values jsonb NULL,
  new_values jsonb NULL,
  ip_address text NULL,
  user_agent text NULL,
  details jsonb NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT admin_logs_pkey PRIMARY KEY (id)
);
```

#### `video_deletions` - Deleted Video Records
```sql
CREATE TABLE public.video_deletions (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  video_id uuid NOT NULL,
  user_id uuid NOT NULL,
  video_title text NOT NULL,
  coin_cost integer NOT NULL,
  refund_amount integer NOT NULL,
  refund_percentage integer NOT NULL,
  deleted_at timestamp with time zone NULL DEFAULT now(),
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT video_deletions_pkey PRIMARY KEY (id),
  CONSTRAINT video_deletions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE
);
```

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd vidgro-admin
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin Configuration
VITE_ADMIN_EMAIL=admin@vidgro.com
VITE_ADMIN_SECRET_KEY=vidgro_admin_secret_2024

# App Configuration
VITE_APP_NAME=VidGro Admin Panel
VITE_API_BASE_URL=https://your-project.supabase.co

# Environment
NODE_ENV=development
```

### 3. Database Functions Setup

The admin panel requires specific database functions to operate correctly. Run the SQL setup script provided in your Supabase SQL editor to create all necessary functions including:

- `get_admin_dashboard_stats()` - Dashboard statistics
- `get_all_users_with_filters()` - User management with filtering
- `get_all_videos_with_filters()` - Video management with filtering
- `admin_adjust_user_coins()` - Coin adjustment functionality
- `admin_update_video_status()` - Video status management
- Analytics functions for user growth, video performance, and coin economy
- Admin logging and permission checking functions

### 4. Start Development Server

```bash
npm run dev
```

The admin panel will be available at `http://localhost:5173`

## 🔐 Authentication Setup

### Default Admin Account

The system supports admin authentication through the `admin_profiles` table. Create your first admin account:

```sql
INSERT INTO admin_profiles (email, role, permissions, is_active) 
VALUES (
  'admin@vidgro.com', 
  'super_admin', 
  '{"user_management": true, "video_management": true, "analytics": true, "system_config": true}'::jsonb,
  true
);
```

### Admin Roles

1. **super_admin**: Full access to all features
2. **content_moderator**: Video and user management
3. **analytics_viewer**: View-only access to analytics
4. **user_support**: User management and support features

## 📊 API Integration

### Key Features

- **Real-time Dashboard**: Live statistics and metrics
- **Advanced Filtering**: Search and filter users and videos
- **Bulk Operations**: Mass user notifications and actions
- **Analytics**: Comprehensive platform insights
- **Audit Logging**: Complete admin action tracking
- **Permission System**: Role-based access control

### Database Functions

The admin panel uses optimized PostgreSQL functions for:
- Dashboard statistics aggregation
- User and video management with complex filtering
- Analytics data processing
- Admin action logging
- Permission verification

## 🏗 Project Structure

```
vidgro-admin/
├── src/
│   ├── components/
│   │   ├── admin/           # Admin-specific components
│   │   ├── analytics/       # Analytics and reporting
│   │   ├── auth/           # Authentication system
│   │   ├── dashboard/      # Main dashboard
│   │   ├── layout/         # Layout components
│   │   ├── reports/        # Bug reports management
│   │   ├── settings/       # System configuration
│   │   ├── ui/            # Reusable UI components
│   │   ├── users/         # User management
│   │   └── videos/        # Video management
│   ├── lib/
│   │   ├── supabase.ts    # Database client and functions
│   │   ├── envManager.ts  # Environment management
│   │   ├── errorHandler.ts # Error handling system
│   │   └── utils.ts       # Utility functions
│   ├── stores/
│   │   └── adminStore.ts  # State management
│   ├── types/
│   │   └── admin.ts       # TypeScript definitions
│   └── services/
│       └── realtimeService.ts # Real-time updates
├── .env                   # Environment variables
└── README.md             # Documentation
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

Ensure all environment variables are properly configured in your deployment platform:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Service role key (keep secure)
- `VITE_ADMIN_EMAIL`: Default admin email
- `VITE_ADMIN_SECRET_KEY`: Admin authentication secret

## 🔍 Troubleshooting

### Common Issues

1. **Mock data showing instead of real data**
   - Verify environment variables are correctly set
   - Check Supabase URL doesn't contain "placeholder"
   - Ensure database functions are properly installed

2. **Authentication errors**
   - Verify `admin_profiles` table exists and has data
   - Check service role permissions
   - Ensure RLS policies allow admin access

3. **Database function errors**
   - Run the complete SQL setup script
   - Verify all functions exist with correct signatures
   - Check service role has EXECUTE permissions

4. **Performance issues**
   - Ensure database indexes are created
   - Check query performance in Supabase dashboard
   - Monitor function execution times

## 📈 Features Overview

### Dashboard
- Real-time platform statistics
- User growth trends
- Video performance metrics
- Revenue and coin economy tracking

### User Management
- Advanced search and filtering
- VIP status management
- Coin balance adjustments
- User activity tracking
- Bulk notifications

### Video Management
- Status tracking and updates
- Performance analytics
- Refund processing
- Content moderation tools

### Analytics
- User growth analysis
- Video performance insights
- Coin economy metrics
- Custom date range filtering

### System Configuration
- Environment variable management
- Platform settings
- Security configuration
- Backup and restore tools

## 📝 License

This project is proprietary software for VidGro platform.

## 🤝 Support

For technical support:
1. Check the troubleshooting section
2. Verify database schema matches requirements
3. Ensure all environment variables are configured
4. Review Supabase project settings and permissions

---

**Note**: This admin panel is specifically designed for the VidGro mobile application and requires the exact database schema and configuration outlined in this documentation.