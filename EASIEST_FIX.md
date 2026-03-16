# 🎯 EASIEST WAY TO FIX LOGIN

## The Problem

After running SQL fixes, `admin@test.com` can't login.

## The Solution (30 seconds!)

### **Method 1: Reset Password (EASIEST)**

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Search for `admin@test.com`
3. If user exists:
   - Click on the user
   - Click **"Reset Password"**
   - New password will be sent to email
   - **OR** just delete and recreate

4. If user doesn't exist:
   - Click **"Add User"**
   - Email: `admin@test.com`
   - Password: `admin123`
   - ✅ **Auto Confirm User** (CHECK THIS!)
   - Click **"Create User"**

---

### **Method 2: Use Different Credentials**

Maybe you used different credentials initially?

Try these common test credentials:

```
admin@school.edu / admin123
admin@test.com / admin123
admin@test.com / admin

admin@test.com / Admin123
admin / admin
test@test.com / test
```

---

### **Method 3: Check What User Exists**

Run this in **SQL Editor**:

```sql
-- Check what users exist
SELECT email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Check what emails are allowed
SELECT email, role 
FROM public.allowed_users;

-- Check profiles
SELECT email, role, full_name 
FROM public.profiles;
```

Then use **whatever email exists** to login!

---

## ⚡ **FASTEST FIX:**

Just create a NEW user with a password you know:

1. **Dashboard** → **Auth** → **Users** → **Add User**
2. Email: `admin@yourschool.com` (or anything)
3. Password: `password123` (remember this!)
4. ✅ Auto Confirm
5. Login with these credentials ✅

---

**Once you can login, everything else will work!** 🚀

