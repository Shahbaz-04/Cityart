# Deployment Guide - Cityart Printer

## Step 1: MongoDB Atlas Setup (Database)
1. जाएं: https://www.mongodb.com/cloud/atlas
2. Free account बनाएं
3. New Project बनाएं
4. Cluster बनाएं (M0 - Free)
5. Database User बनाएं (username/password)
6. Connection String कॉपी करें: `mongodb+srv://username:password@cluster.mongodb.net/cityart?retryWrites=true&w=majority`

## Step 2: Backend Deploy (Render)
1. जाएं: https://render.com
2. GitHub से sign up करें
3. New Web Service बनाएं
4. GitHub repo connect करें
5. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Environment Variables add करें:
   - `MONGODB_URI`: MongoDB Atlas connection string
   - `JWT_SECRET`: long random string (जैसे: abc123xyz789...)
   - `NODE_ENV`: production

## Step 3: Frontend Deploy (Netlify)
1. जाएं: https://app.netlify.com
2. GitHub से sign up करें
3. "Connect to Git" पर क्लिक करें
4. Repository select करें
5. Settings:
   - Base Directory: `frontend`
   - Build Command: `npm run build`
   - Publish Directory: `frontend/build`
6. Build और Deploy होगा

## Step 4: Update Frontend API URL
1. Backend का deployed URL नोट करें (जैसे: https://cityart-backend.onrender.com)
2. `frontend/src/api.js` में update करें:
   ```javascript
   const API_BASE = process.env.REACT_APP_API_URL || 'https://cityart-backend.onrender.com';
   ```
3. Netlify Environment Variables में add करें:
   - `REACT_APP_API_URL`: backend का URL

## Step 5: Deploy करने के बाद
- Frontend: https://your-site.netlify.app
- Backend: https://your-backend.onrender.com
- Admin: https://your-site.netlify.app/admin (username: admin, password: admin123)
