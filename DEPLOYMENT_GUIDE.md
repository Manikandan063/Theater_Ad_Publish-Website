# Real-World Website Deployment Guide

Your Theatre Advertisement platform is now fully optimized with relative API endpoints seamlessly ready to be launched as a true real-world application. To achieve a perfectly hosted product, we will split the application into **Backend** (Node.js/Express) and **Frontend** (React/Vite).

## 1. Deploy the Backend (Render)

Render.com is excellent for hosting Node.js server applications completely for free.

1. Create a free account at [render.com](https://render.com).
2. Push your entire `Theater_Ad/Backend` folder to a GitHub repository.
3. On Render, click **New +** and select **Web Service**.
4. Connect your GitHub account and select your repository.
5. Setup the service:
   - **Root Directory:** `Backend` (make sure it targets the backend folder!)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
6. Scroll down to **Environment Variables** and add:
   - `PORT`: `5000`
   - `MONGO_URI`: (Your actual MongoDB Atlas connection string)
   - `JWT_SECRET`: (Any secure random string, e.g., `s3cr3t_p@ssw0rd`)
7. Click **Create Web Service**. Render will give you a live URL, e.g., `https://theater-ad-backend.onrender.com`.

## 2. Deploy the Frontend (Vercel)

Vercel is the ultimate premium hosting layer for Vite and React apps.

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Push your `Theater_Ad/Frontend` folder to GitHub.
3. Click **Add New Project** and import your Frontend repository.
4. Open the **Environment Variables** dropdown and add:
   - Name: `VITE_API_URL`
   - Value: `https://theater-ad-backend.onrender.com` (Use the live URL you got from Render from Step 1)
5. Vercel automatically detects Vite configurations, so just click **Deploy**.
6. Within seconds, Vercel will process it and provide a shiny, real-world URL for your live production website!

## What I optimized right now to make this work:
- I removed all the hard-coded `http://localhost:5000` references across all your React pages. 
- Integrated global default headers via `axios.defaults.baseURL`, automatically falling back to your Vite environment variables (`import.meta.env.VITE_API_URL`).
- The application dynamically adapts! When you are coding locally, it functions exactly like before. The moment you define the `VITE_API_URL` on Vercel, it connects immediately to the real-world server!
- Completely corrected CSS alignments, adding `vertical-align` limits alongside strict `white-space` management properties in your `index.css`. This permanently ensures tables and heavy layout grids never squish your "View" or "Actions" tools!
