# Teranga Technologies — Landing Page

Startup landing page for Teranga Technologies. Static HTML/CSS/JS frontend with a lightweight Express backend for the contact form.

## Stack

- **Frontend** — HTML5, CSS3 (custom properties, Grid, Flexbox), vanilla JS
- **Backend** — Node.js + Express + Nodemailer
- **Languages** — Bilingual EN/FR (runtime i18n, no page reload)

## Project Structure

```
├── index.html       # Main page (all sections)
├── style.css        # All styles
├── main.js          # i18n, mobile menu, contact form logic
├── server.js        # Express server + /api/contact + /api/health
├── package.json
└── Pictures/
    ├── Logo Teranga
    └── Pic1.jpg
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_TO=seckbara23@gmail.com
   PORT=3000
   # ALLOWED_ORIGIN=https://yourdomain.com   # set in production
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open: `http://localhost:3000`

## API

| Method | Path           | Description                        |
|--------|----------------|------------------------------------|
| GET    | `/api/health`  | Health check                       |
| POST   | `/api/contact` | Submit contact form (rate-limited) |

The contact endpoint is rate-limited to 5 requests per IP per 15 minutes.

## Deployment

The server serves static files from the project root. No build step needed. Set `NODE_ENV=production` and `ALLOWED_ORIGIN` in your environment before deploying.
