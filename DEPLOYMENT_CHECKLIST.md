# 🚀 Deployment Checklist - Cityart Printer

## ✅ Step 1: Setup MongoDB Atlas (10 minutes)
- [ ] Go to https://www.mongodb.com/cloud/atlas
- [ ] Create free account
- [ ] Verify email address
- [ ] Create new project named "Cityart"
- [ ] Create M0 (Free) Cluster
- [ ] Wait for cluster to initialize (5-10 minutes)
- [ ] Click "Connect" → "Drivers"
- [ ] Copy connection string: `mongodb+srv://...`
- [ ] Replace `<password>` with your database password
- [ ] Keep the string safe - you'll need it for backend

## ✅ Step 2: Setup Backend on Render (15 minutes)
- [ ] Go to https://render.com
- [ ] Sign up with GitHub
- [ ] Click "New" → "Web Service"
- [ ] Select your GitHub repository
- [ ] Fill settings:
  - Name: `cityart-backend` (or any name)
  - Root Directory: `backend`
  - Runtime: `Node`
  - Build Command: `npm install`
  - Start Command: `npm start`
- [ ] Add Environment Variables:
  - `MONGO_URI`: (paste MongoDB Atlas connection string)
  - `JWT_SECRET`: (generate random string: `openssl rand -hex 32`)
  - `NODE_ENV`: `production`
- [ ] Deploy
- [ ] Copy the deployed URL (e.g., `https://cityart-backend.onrender.com`)
- [ ] Wait for first deploy to complete (2-5 minutes)

## ✅ Step 3: Setup Frontend on Netlify (10 minutes)
- [ ] Go to https://app.netlify.com
- [ ] Sign up with GitHub
- [ ] Click "Add new site" → "Import existing project"
- [ ] Select your GitHub repository
- [ ] Fill settings:
  - Base Directory: `frontend`
  - Build Command: `npm run build`
  - Publish Directory: `frontend/build`
- [ ] Add Environment Variable:
  - `REACT_APP_API_URL`: (paste backend URL from Render)
- [ ] Deploy
- [ ] Copy the frontend URL (e.g., `https://yoursite.netlify.app`)

## ✅ Step 4: Test Deployment
- [ ] Visit frontend URL in browser
- [ ] Test add to cart
- [ ] Test checkout
- [ ] Test admin login (admin/admin123)
- [ ] Test product creation in admin
- [ ] Test order status view

## 📝 Important Notes

### If MongoDB not connecting:
1. Whitelist your IP in Atlas (Security → Network Access → Add Current IP)
2. Check connection string has correct password
3. Database name should be after `...mongodb.net/`

### If Frontend API failing:
1. Check REACT_APP_API_URL is set correctly
2. Make sure backend domain is `https://` not `http://`
3. Check backend endpoint is responding: `{backend-url}/api/status`

### If Pages not loading:
1. Check netlify.toml is in project root
2. Make sure build folder exists
3. Check browser console for errors

## 🔐 Security Checklist
- [ ] JWT_SECRET is a long random string (not hardcoded)
- [ ] MongoDB password is strong
- [ ] .env file is in .gitignore
- [ ] No sensitive data in git history

## 📱 Live URLs After Deployment
- Frontend: `https://your-domain.netlify.app`
- Backend: `https://your-backend.onrender.com`
- Admin: `https://your-domain.netlify.app/admin`

**First Time Admin Login:**
- Username: `admin`
- Password: `admin123`

---

Need help? Check deployment logs:
- **Render**: Dashboard → Your Service → Logs
- **Netlify**: Dashboard → Deploy Logs
