# 🚀 Deployment Guide - UAE Budget Tracker

Complete guide to deploy your full-stack Budget Tracker application.

**Repository**: https://github.com/Justin-B-Shajan/UAE-Budget-tracker.git

---

## 📋 What You'll Deploy

- **Frontend**: React + Vite app → Vercel
- **Backend**: Node.js + Express API → Railway
- **Database**: SQLite (included with backend)

---

## Part 1: Deploy Backend to Railway

### Step 1: Sign Up for Railway
1. Go to https://railway.app
2. Click "Login" and sign in with GitHub
3. Authorize Railway to access your GitHub account

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `UAE-Budget-tracker`
4. Railway will detect your project

### Step 3: Configure Backend Service
1. Railway will auto-detect the Node.js app
2. Click on the service that was created
3. Go to **Settings** tab
4. Set **Root Directory**: `server`
5. Set **Start Command**: `npm start`

### Step 4: Add Environment Variables
1. Go to **Variables** tab
2. Add these variables:
   ```
   PORT=3001
   NODE_ENV=production
   DB_PATH=./data/budget.db
   ```

### Step 5: Deploy
1. Railway will automatically deploy
2. Wait for deployment to complete (~2-3 minutes)
3. Go to **Settings** → **Networking**
4. Click **Generate Domain**
5. **Copy your backend URL** (something like: `https://your-app.up.railway.app`)
   - ⚠️ **SAVE THIS URL** - you'll need it for the frontend!

### Step 6: Test Backend
1. Open your backend URL in browser
2. You should see: `{"message":"Budget Tracker API","version":"1.0.0",...}`
3. Test health endpoint: `https://your-app.up.railway.app/api/health`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Sign Up for Vercel
1. Go to https://vercel.com
2. Click **"Sign Up"** and use GitHub
3. Authorize Vercel to access your GitHub

### Step 2: Import Project
1. Click **"Add New"** → **"Project"**
2. Find and **Import** your repository: `UAE-Budget-tracker`
3. Vercel will detect it's a Vite project

### Step 3: Configure Build Settings
1. **Framework Preset**: Vite
2. **Root Directory**: `./` (leave as default)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

### Step 4: Add Environment Variable
1. Before deploying, click **"Environment Variables"**
2. Add this variable:
   ```
   Name: VITE_API_URL
   Value: https://your-backend-url.up.railway.app/api
   ```
   ⚠️ Replace with your actual Railway backend URL from Part 1, Step 5
   ⚠️ Make sure to add `/api` at the end!

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. You'll get a URL like: `https://your-app.vercel.app`
4. **Your app is live!** 🎉

---

## 🧪 Testing Your Deployment

### Test Backend
```bash
# Health check
curl https://your-backend.up.railway.app/api/health

# Get expenses
curl https://your-backend.up.railway.app/api/expenses
```

### Test Frontend
1. Open your Vercel URL in browser
2. Try adding an expense
3. Refresh the page - data should persist!
4. Download an invoice to verify everything works

---

## 🔧 Troubleshooting

### Frontend can't connect to Backend
**Problem**: Expenses not saving, CORS errors in console

**Solution**:
1. Check `VITE_API_URL` in Vercel dashboard
2. Make sure it ends with `/api`
3. Make sure backend URL is correct (from Railway)
4. Redeploy frontend after fixing

### Backend not starting
**Problem**: Railway deployment failed

**Solution**:
1. Check Railway logs for errors
2. Verify Root Directory is set to `server`
3. Make sure `package.json` exists in server folder
4. Check environment variables are set

### Database not persisting
**Problem**: Data disappears after backend restart

**Solution**:
1. This is expected with Railway's free tier (ephemeral storage)
2. For persistent data, upgrade Railway plan or use external database
3. SQLite file will persist between deployments on paid plan

---

## 🔄 Updating Your App

### Update Frontend
1. Push changes to GitHub
2. Vercel auto-deploys from `main` branch
3. Check deployment status in Vercel dashboard

### Update Backend
1. Push changes to GitHub
2. Railway auto-deploys from `main` branch
3. Check deployment logs in Railway dashboard

---

## 💰 Costs

- **Railway**: Free tier includes $5/month credit (enough for small apps)
- **Vercel**: Free tier is generous (unlimited bandwidth)
- **Total**: $0/month for hobby projects! 🎉

---

## 📱 Share Your App

Once deployed, share these URLs:
- **Live App**: `https://your-app.vercel.app`
- **API Docs**: `https://your-backend.up.railway.app`

---

## 🎯 Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Deploy frontend to Vercel
3. ✅ Test the live app
4. 📧 Share with friends!

**Need help?** Check the Railway and Vercel documentation or reach out to their support!

---

## 🔐 Security Notes

- Never commit `.env` files (already in `.gitignore`)
- Keep your Railway/Vercel dashboard credentials safe
- Backend API is public - add authentication if needed

---

**Happy Deploying! 🚀**
