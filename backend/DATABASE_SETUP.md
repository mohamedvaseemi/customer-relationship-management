# PostgreSQL Database Setup Script for CRM

This guide will help you set up the PostgreSQL database for the CRM application.

## Step 1: Install PostgreSQL

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### macOS (using Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

### Windows:
Download and install from: https://www.postgresql.org/download/windows/

## Step 2: Access PostgreSQL

```bash
# Switch to postgres user (Linux)
sudo -u postgres psql

# Or connect directly (macOS/Windows)
psql -U postgres
```

## Step 3: Create Database

```sql
-- Create database
CREATE DATABASE crm_database;

-- Connect to the database
\c crm_database

-- Verify connection
SELECT current_database();
```

## Step 4: Run Schema

### Option 1: From psql prompt
```sql
\i /path/to/backend/config/schema.sql
```

### Option 2: From command line
```bash
psql -U postgres -d crm_database -f backend/config/schema.sql
```

### Option 3: Copy and paste
Open the `backend/config/schema.sql` file and copy all the SQL statements, then paste them into your PostgreSQL client.

## Step 5: Verify Tables

```sql
-- List all tables
\dt

-- You should see:
-- activities
-- companies
-- contacts
-- deals
-- leads
-- users
```

## Step 6: Create Initial User (Optional)

If you want to create a test user directly in the database:

```sql
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@crm.com', '$2a$10$rQ.xKj5P8YGJXVZxKj5P8eKj5P8YGJXVZxKj5P8YGJXVZxKj5P8e', 'admin');
```

**Note:** It's better to use the registration page in the application to create users.

## Step 7: Configure Backend

Edit `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=crm_database
JWT_SECRET=your_secret_key_here
```

## Step 8: Test Connection

Start the backend server:

```bash
cd backend
npm run dev
```

You should see:
```
✅ PostgreSQL database connected successfully
🚀 Server is running on port 5000
```

## Common Issues

### Issue: Connection refused
**Solution:** Make sure PostgreSQL is running
```bash
# Linux
sudo systemctl status postgresql
sudo systemctl start postgresql

# macOS
brew services list
brew services start postgresql
```

### Issue: Authentication failed
**Solution:** Update pg_hba.conf to allow password authentication
```bash
# Find pg_hba.conf
psql -U postgres -c "SHOW hba_file"

# Edit the file and change 'peer' to 'md5' for local connections
```

### Issue: Database does not exist
**Solution:** Create the database first
```bash
createdb -U postgres crm_database
```

## Useful PostgreSQL Commands

```sql
-- List all databases
\l

-- List all tables in current database
\dt

-- Describe a table structure
\d table_name

-- List all users
\du

-- Change password
ALTER USER postgres PASSWORD 'new_password';

-- Drop database (WARNING: This deletes everything!)
DROP DATABASE crm_database;

-- Quit psql
\q
```

## Database Backup and Restore

### Backup
```bash
pg_dump -U postgres crm_database > backup.sql
```

### Restore
```bash
psql -U postgres crm_database < backup.sql
```

---

For more information, visit: https://www.postgresql.org/docs/
