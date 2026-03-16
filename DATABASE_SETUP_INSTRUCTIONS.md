# 🎯 Database Setup Instructions

## ⚠️ IMPORTANT: Run This SQL Query

Your dashboard isn't updating because **RLS policies are missing** for INSERT/UPDATE/DELETE operations.

### **Quick Fix (2 minutes):**

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Select your project
   - Click **"SQL Editor"** (left sidebar)

2. **Run the Fix**
   - Click "New Query" button
   - Open file: `COMPLETE_DATABASE_FIX.sql`
   - Copy **ALL** the SQL code
   - Paste into SQL Editor
   - Click **"Run"** button

3. **Verify Success**
   - Look for green "Success" message
   - No red errors = you're good!

4. **Refresh Your App**
   - Close browser tab completely
   - Reopen and login
   - Add a user
   - **Dashboard updates!** ✅

---

## 📋 What Files to Run (In Order)

### **Run ONLY these SQL files in Supabase:**

1. **First Time Setup:**
   - ✅ `database_setup.sql` (creates all tables)
   - ✅ `DATABASE_FIX.sql` (removes blocking triggers)
   - ✅ `COMPLETE_DATABASE_FIX.sql` (adds RLS policies) ← **RUN THIS NOW!**

2. **Optional (if needed):**
   - ⏳ `database_schema_expanded.sql` (extra tables)

### **DO NOT run these:**
   - ❌ `RLS_POLICY_FIX.sql` (duplicate, already in COMPLETE_DATABASE_FIX.sql)

---

## ✅ After Running SQL - Verify

**Test checklist:**

1. ✅ Add user → Dashboard updates immediately
2. ✅ Add student → Student count increases
3. ✅ Add parent → Parent count increases
4. ✅ Link parent-child → Works correctly
5. ✅ Delete user → Dashboard updates

**All working?** ✅ You're done!

---

## 🔍 If Still Not Working

See: `HOW_TO_FIX_DASHBOARD_NOT_UPDATING.md`

---

**Run the SQL file now and your dashboard will work!** 🚀

