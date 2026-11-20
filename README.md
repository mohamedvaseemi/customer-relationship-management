# 📈 CRM & Lead Management

A full-stack customer relationship management system for tracking customers and leads, built with Next.js and PostgreSQL.

**🔗 Live demo:** https://kibon-se-crm.vercel.app/

![Dashboard](./docs/dashboard.png)

## ✨ Features
- Secure authentication with Google sign-in and JWT sessions
- Customer and lead management
- Analytics dashboards with interactive charts
- Razorpay payment integration
- Image uploads handled through Cloudinary
- Responsive interface for desktop and mobile

## 🧰 Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js, React |
| Database | PostgreSQL |
| Auth | Google OAuth, JWT |
| Payments | Razorpay |
| Charts | Recharts |
| Media | Cloudinary |
| Styling | Tailwind CSS, Framer Motion |
| Deployment | Vercel |

## 📸 Screenshots
| Dashboard | Leads | Analytics |
|---|---|---|
| ![](./docs/dashboard.png) | ![](./docs/leads.png) | ![](./docs/analytics.png) |

## 🚀 Run Locally

```bash
git clone https://github.com/mohamedvaseemi/customer-relationship-management.git
cd customer-relationship-management
npm install
cp .env.example .env.local   # fill in your own values
npm run dev
```

Open http://localhost:3000

### Environment variables
```
DATABASE_URL=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_SSL=
PORT=
NODE_ENV=
JWT_SECREt=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
PAYU_MODE=
PAYU_MERCHANT_KEY=
PAYU_MERCHANT_SALT=
GROQ_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## 👤 Author
**Mohamed Vaseem** · [GitHub](https://github.com/mohamedvaseemi) · [Portfolio](https://mohamed-vaseem-portfolio.vercel.app/)
