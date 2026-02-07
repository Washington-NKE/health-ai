# Healthcare AI Assistant 🏥

> **Intelligent Healthcare Management System with AI-Powered Chat**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)](https://www.prisma.io/)

A comprehensive healthcare management platform featuring role-based dashboards, appointment scheduling, medical records management, and an AI-powered chat assistant using Google Gemini 2.5 Flash.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Neon account)
- Google AI API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd healthcare-ai-assistant

# Install dependencies
npm install --legacy-peer-deps

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Setup database
npx prisma generate
npx prisma db push

# Seed with test data
npm run seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` 🎉

### Test Login Credentials

```
Patient Account:
Email:    patient@demo.com
Password: Health123!

Doctor Account:
Email:    dr.smith@metro.com
Password: Health123!
```

> **Create Admin**: Register and update role in database

## 📖 Full Documentation

**➡️ [VIEW COMPLETE PROJECT DOCUMENTATION](./PROJECT_DOCUMENTATION.md)**

The comprehensive documentation includes:

- ✅ Complete feature list
- ✅ API routes reference
- ✅ Database schema details
- ✅ AI tools documentation
- ✅ Deployment guide
- ✅ Improvement recommendations

## 🎯 Key Features

| Feature                    | Status                           |
| -------------------------- | -------------------------------- |
| **Multi-Role System**      | ✅ Patient, Doctor, Admin, Staff |
| **AI Chat Assistant**      | ✅ Google Gemini 2.5 Flash       |
| **Appointment Management** | ✅ Full scheduling system        |
| **Medical Records**        | ✅ Prescriptions, Lab Results    |
| **Billing System**         | ✅ Invoice tracking              |
| **Admin Dashboard**        | ✅ Complete management portal    |

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Google Gemini 2.5 Flash via Vercel AI SDK
- **UI**: Shadcn/ui Components

## 📁 Project Structure

```
├── app/                  # Next.js app router
│   ├── admin/           # Admin portal
│   ├── patient/         # Patient portal
│   ├── doctor/          # Doctor portal
│   ├── api/             # API routes
│   └── chat/            # AI chat interface
├── components/          # React components
├── lib/                 # Utilities & configs
│   ├── ai/             # AI tools
│   ├── auth.ts         # Authentication
│   └── prisma.ts       # Database client
├── prisma/             # Database schema
└── types/              # TypeScript types
```

## 🔧 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with test data
npx prisma studio    # Open Prisma Studio (DB GUI)
npx prisma generate  # Regenerate Prisma Client
```

## 🔐 Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

# AI
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-key"
```

## 🐛 Known Issues

See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) for current issues and fixes.

**Quick Fix for TypeScript Errors**:

```bash
npx prisma generate
rm -rf .next
npm run dev
```

## 📊 Project Status

- **Version**: 0.1.0 (Beta)
- **Core Features**: 100% Complete
- **AI Chat**: ✅ Operational (quota limits apply)
- **Production Ready**: 85%

### What's Working ✅

- Complete authentication system
- All role-based dashboards
- Appointment booking & management
- Medical records (prescriptions, lab results)
- Billing tracking
- AI chat with 10+ tools
- Admin CRUD operations

### What's Next 🚧

- Email notifications
- Payment gateway integration
- Advanced reports
- File uploads
- Mobile optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 👨‍💻 Developer

**Washington Mwangi**  
_Munyaka AI_

---

## 📚 Additional Resources

- [Full Documentation](./PROJECT_DOCUMENTATION.md) - Complete project guide
- [Known Issues](./KNOWN_ISSUES.md) - Current bugs and fixes
- [API Documentation](./PROJECT_DOCUMENTATION.md#api-routes-documentation) - API routes reference
- [Deployment Guide](./PROJECT_DOCUMENTATION.md#deployment-recommendations) - Production deployment

---

**Ready to build? Start with:**

```bash
npm install --legacy-peer-deps && npm run dev
```

**Need help?** Check the [full documentation](./PROJECT_DOCUMENTATION.md) or open an issue!

---

_Last Updated: February 8, 2026_
