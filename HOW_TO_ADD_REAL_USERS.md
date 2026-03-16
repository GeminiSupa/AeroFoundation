# How to Add Real Users to Your School Management System

## Quick Start - Add Real Users in 3 Steps

### Step 1: Add Email to Allowed Users
**In Supabase Dashboard:**
1. Go to **Table Editor**
2. Select **`allowed_users`** table
3. Click **Insert** → **Insert row**
4. Add:
   - **email**: `your@email.com`
   - **role**: `admin` or `teacher` or `student` or `parent`
5. Click **Save**

### Step 2: Create Auth User
**In Supabase Dashboard:**
1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Fill in:
   - **Email**: Same as Step 1
   - **Password**: Choose a password
   - **Auto Confirm User**: ✅ (CHECK THIS!)
4. Click **Create user**

### Step 3: Done! ✅
The profile is automatically created. Now you can:
- Login with the email and password
- See the user in your Admin panel
- The user can access the system

---

## Using the Admin Panel (Recommended)

**If you're logged in as admin:**

1. Go to **Users** page in admin panel
2. Click **Add User** button
3. Fill in the form:
   - Full Name
   - Email
   - Role (admin/teacher/student/parent)
   - Password
   - Phone (optional)
4. Click **Add User**

**The system will:**
- ✅ Add email to allowed_users automatically
- ✅ Create auth user
- ✅ Create profile
- ✅ User can login immediately

---

## Test Users (Already Set Up)

These test users are pre-configured:

| Email | Password | Role | Status |
|-------|----------|------|--------|
| admin@test.com | admin123 | admin | Ready |
| teacher@test.com | teacher123 | teacher | Ready |
| student@test.com | student123 | student | Ready |
| parent@test.com | parent123 | parent | Ready |

**To use these:**
1. Go to Supabase Authentication → Users
2. Click "Add user" for each
3. Use the credentials above
4. ✅ Check "Auto Confirm User"

---

## Troubleshooting

### "Email not authorized" error
**Solution:** Add the email to `allowed_users` table first

### User can't login
**Solution:** 
1. Check user exists in Authentication → Users
2. Make sure "Auto Confirm User" was checked
3. Try resetting password

### Profile not created
**Solution:**
1. Check triggers in SQL Editor:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```
2. If missing, re-run `database_setup.sql`

---

## Adding Multiple Users at Once

### Using SQL (Fast Method)

```sql
-- Add multiple emails to allowed_users
INSERT INTO allowed_users (email, role) VALUES
  ('john@school.com', 'student'),
  ('jane@school.com', 'teacher'),
  ('parent1@school.com', 'parent')
ON CONFLICT (email) DO NOTHING;
```

Then create auth users manually in Authentication → Users.

---

## What Happens When You Add a User?

1. **Email added to allowed_users** → User can now sign up
2. **Auth user created** → User can authenticate
3. **Trigger fires** → Profile automatically created
4. **RLS policies** → User can only see their own data
5. **Ready to use** → User can login and access system

---

## Pro Tips

1. **Always check "Auto Confirm User"** when creating users manually
2. **Use the admin panel** for easier user management
3. **Add phone numbers** for better contact info
4. **Set strong passwords** or let users change on first login
5. **Test with one user first** before adding many

---

## Need More Help?

- Check `SETUP_COMPLETE.md` for full setup guide
- Check `database_setup.sql` for schema details
- Check Supabase documentation for auth setup

