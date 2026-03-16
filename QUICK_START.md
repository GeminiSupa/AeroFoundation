# Quick Start Guide

## 🚀 Getting Started

This AI School Management System is now connected to Supabase and ready to use!

### What's Been Done

✅ Supabase credentials configured  
✅ Authentication system integrated  
✅ Session persistence implemented  
✅ Login page updated with Supabase auth  
✅ App context handles Supabase sessions  
✅ All dependencies installed  
✅ Build configuration optimized  

### How to Run

1. **Development Mode**
   ```bash
   npm run dev
   ```
   Your app will be available at http://localhost:3000

2. **Production Build**
   ```bash
   npm run build
   ```

### Login

The application supports both **Supabase authentication** and **demo mode**:

#### Demo Mode (Recommended for Quick Testing)
- Enter any email (e.g., `test@example.com`)
- Enter any password
- Select your role: Admin, Teacher, Student, or Parent
- Click "Login"

#### Supabase Mode (For Production)
- Requires Supabase to be fully set up
- Create users in your Supabase dashboard
- Use email/password authentication

### Environment Variables

Your `.env` file contains:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Features by Role

**Admin:**
- User Management
- HR & Staff Management
- Inventory Management
- Classes Management
- Scheduling
- Leave Management
- Finance
- Reports & Analytics
- Audit Logs
- Announcements
- Messages
- AI Tools
- Settings

**Teacher:**
- Dashboard
- Classes & Students
- Lesson Planning
- Leave Requests
- Announcements
- Messages
- Settings

**Student:**
- Dashboard
- To-Do & Assignments
- Grades
- Attendance
- Portfolio
- Leave Requests
- Announcements
- Messages
- Settings

**Parent:**
- Dashboard
- Child Progress
- Fee Payments
- Child Leave Requests
- Announcements
- Messages
- Settings

### Troubleshooting

**Build Errors:**
```bash
npm install
npm run build
```

**Port Already in Use:**
Edit `vite.config.ts` and change the port:
```typescript
server: {
  port: 3001,
}
```

### Next Steps

1. Set up your Supabase database tables (see SETUP.md)
2. Create users in Supabase dashboard
3. Customize the application for your needs
4. Deploy to production

### Support

For detailed setup instructions, see `SETUP.md`.

