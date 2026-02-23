# Admin Setup Guide

## Creating the Admin Account

This system allows only **ONE admin** and **multiple regular users**.

### Option 1: Using API Endpoint (Recommended)

You can create the admin account by making a POST request to the setup endpoint:

**Endpoint:** `POST http://localhost:5000/api/auth/setup-admin`

**Request Body:**
```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "your-secure-password",
  "setupKey": "admin-setup-2024"
}
```

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@restaurant.com",
    "password": "admin123456",
    "setupKey": "admin-setup-2024"
  }'
```

**Using Postman or Thunder Client:**
1. Create a new POST request
2. URL: `http://localhost:5000/api/auth/setup-admin`
3. Body (JSON):
   - name: "Admin"
   - email: "admin@restaurant.com"
   - password: "admin123456"
   - setupKey: "admin-setup-2024"

### Option 2: Using PowerShell

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/setup-admin" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"name":"Admin","email":"admin@restaurant.com","password":"admin123456","setupKey":"admin-setup-2024"}'
```

---

## Important Notes

1. **One Admin Only**: The system prevents creation of multiple admin accounts
2. **Setup Key**: Change the `ADMIN_SETUP_KEY` in your `.env` file for security
3. **First Time Only**: This endpoint only works when no admin exists
4. **Regular Users**: Users can register normally through the `/register` page - they will automatically be assigned the 'user' role

---

## Admin Login

After creating the admin account, login at:
- **URL:** `http://localhost:3000/admin/login`
- **Email:** The email you used during setup
- **Password:** The password you used during setup

---

## Security Recommendations

1. Change the `ADMIN_SETUP_KEY` in your `.env` file immediately
2. Use a strong password for the admin account
3. After creating the admin, you can optionally remove the setup endpoint from the routes

---

## Regular User Registration

Regular users can register at:
- **URL:** `http://localhost:3000/register`
- They will automatically be assigned the 'user' role
- Admin registration is not available through the public registration page
