# MAHALEELA FASHION — Production Deployment Guide

This package contains everything required to deploy the complete, full-stack **MAHALEELA FASHION** website and administrative atelier system.

---

## Package Contents

- **`dist/`**: Compiled high-performance production frontend bundle (React 18 + Tailwind CSS + Lucide Icons).
- **`server/`**: Express API engine with JSON database (`server/db/store.json`), real Google Identity OAuth 2.0 JWT verification, media upload handlers, order dispatch, shipping label generator, and tracking timeline.
- **`public/`**: Monogram logo (`logo.png`) and core brand assets.
- **`src/`**: Full TypeScript React source code for customizations.
- **`Dockerfile`**: Multi-stage production container for Docker, Railway, Render, or Kubernetes.
- **`package.json`**: Dependencies and production start scripts (`npm start`).

---

## 🚀 Quick Deployment Options

### Option 1: Netlify (Fastest & Easiest — Live in 10 Seconds)

#### Method A: Instant Drag & Drop Deploy (Zero Configuration)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop) in your browser.
2. Drag and drop the **`mahaleela-fashion-netlify-drop.zip`** file directly into the dropzone on the page (or unpack it and drop the folder).
3. Netlify will deploy your site in ~10 seconds and give you an instant live URL (e.g., `https://relaxed-fashion-xyz.netlify.app`).
4. In **Site Configuration &rarr; Change site name**, you can customize it to `mahaleelafashion.netlify.app` or connect your custom domain (`mahaleelafashion.com`).

#### Method B: Netlify Git Repository (With Serverless API Functions)
1. Push this project to GitHub/GitLab.
2. In Netlify, click **Add new site** &rarr; **Import an existing project**.
3. Select your repository. Netlify automatically reads `netlify.toml`:
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
   - **Build command**: `npm run build`
4. Click **Deploy**. Netlify builds both your storefront and your serverless `/api/*` functions.

---

### Option 2: Render.com (Cloud Web Service)

1. Sign up for free at [render.com](https://render.com).
2. Click **New +** &rarr; **Web Service**.
3. Upload your code or connect your GitHub repository.
4. Set the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Click **Deploy Web Service**.
6. Render will automatically assign a live HTTPS URL (e.g., `https://mahaleela-fashion.onrender.com`).

---

### Option 2: Railway.app (Instant 1-Click Cloud Hosting)

1. Sign up at [railway.app](https://railway.app).
2. Click **New Project** &rarr; **Deploy from GitHub repo** (or upload this directory via Railway CLI).
3. Railway will detect the `Dockerfile` or `package.json` automatically.
4. Click **Generate Domain** in the service settings to get your live HTTPS link.

---

### Option 3: Standard Linux Cloud VPS (DigitalOcean, AWS EC2, Hetzner, Hostinger, Linode)

1. **Upload the Zip to your VPS**:
   ```bash
   scp mahaleela-fashion-deploy.zip user@YOUR_SERVER_IP:/var/www/
   ```

2. **Connect via SSH and Unpack**:
   ```bash
   ssh user@YOUR_SERVER_IP
   cd /var/www
   unzip mahaleela-fashion-deploy.zip -d mahaleela-fashion
   cd mahaleela-fashion
   ```

3. **Install Dependencies & Build**:
   ```bash
   npm install
   npm run build
   ```

4. **Run in Background with PM2 (Auto-restart on reboot)**:
   ```bash
   npm install -g pm2
   pm2 start server/server.js --name "mahaleela"
   pm2 startup
   pm2 save
   ```

5. **Nginx Reverse Proxy Configuration (Port 80/443 &rarr; 5000)**:
   Create `/etc/nginx/sites-available/mahaleela`:
   ```nginx
   server {
       server_name mahaleelafashion.com www.mahaleelafashion.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           client_max_body_size 50M;
       }
   }
   ```
   Enable site and reload Nginx:
   ```bash
   ln -s /etc/nginx/sites-available/mahaleela /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

6. **Free SSL Certificate via Let's Encrypt**:
   ```bash
   sudo certbot --nginx -d mahaleelafashion.com -d www.mahaleelafashion.com
   ```

---

### Option 4: Docker Deployment (Single Command Anywhere)

1. Build the Docker image:
   ```bash
   docker build -t mahaleela-fashion .
   ```

2. Run the container:
   ```bash
   docker run -d -p 5000:5000 --restart always --name mahaleela mahaleela-fashion
   ```
3. Visit `http://YOUR_SERVER_IP:5000`.

---

## ⚙️ Post-Deployment Configuration

### 1. Activating Real Google Sign-In on Your Live Domain

1. Open the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Select or create your OAuth 2.0 Web Application client.
3. Under **Authorized JavaScript origins**, add:
   - Your local test domain: `http://localhost:5000`
   - Your live production domain: `https://mahaleelafashion.com` (or your Render/Railway URL)
4. Copy your **Client ID** (ends with `.apps.googleusercontent.com`).
5. Open your live website, go to **Admin CMS &rarr; Site Settings** (`/admin/settings`), paste your Client ID into the **Google Cloud OAuth 2.0 Client ID** field, and click **Save Settings Live**.
6. The official Google Sign-In button will instantly be active across your storefront!

---

### 2. Admin CMS Access

- Default administrator credentials:
  - Access Admin Panel at: `https://your-domain.com/admin`
  - Admin email: `admin@mahaleela.com`
  - Contact Phone: `8892919723`
- Inside the Admin Panel, you can:
  - Add & edit collections and products (9:16 vertical catalog format)
  - Upload photos directly from device without links
  - Customize the MAHALEELA EXCLUSIVE storefront title, subtitle, and banner image
  - Generate and print logistics shipping labels with barcodes
  - Track customer orders and advance the live delivery timeline
