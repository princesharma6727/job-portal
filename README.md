# RizeOS Job & Networking Portal

A full-stack web application inspired by LinkedIn, Upwork, and AngelList with AI-powered features and Web3 integration.

## 🚀 Features

### Core Features
- **User Authentication & Profiles**: JWT-based auth with comprehensive user profiles
- **Job Posting & Discovery**: Create, browse, and filter job listings
- **Social Feed**: Share career updates and connect with professionals
- **AI-Powered Matching**: Smart job-candidate matching using NLP
- **Web3 Integration**: MetaMask wallet connection

### AI Enhancements
- **Job ↔ Applicant Matching**: NLP-based match scoring
- **Resume Skill Extraction**: Auto-extract skills from profiles
- **Smart Suggestions**: Personalized job and connection recommendations

### Web3 Features
- **Wallet Integration**: MetaMask connection


## 🛠 Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Blockchain**: Ethereum (MetaMask)
- **AI/ML**: Natural.js, Compromise.js
- **Deployment**: Vercel/Netlify

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd rizeos-job-portal
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Environment Setup**
```bash
cp .env.example .env
# Fill in your environment variables
```

4. **Start development servers**
```bash
npm run dev
```

## 🔄 Hot Reloading Development

The project is configured with hot reloading for both client and server:

### Quick Start
```bash
# Option 1: Use the development script
./dev.sh

# Option 2: Use npm directly
npm run dev
```

### What's Included
- **Client Hot Reloading**: React Fast Refresh enabled
- **Server Hot Reloading**: Nodemon automatically restarts server on file changes
- **Concurrent Development**: Both client and server run simultaneously
- **File Watching**: Changes to `.js`, `.jsx`, `.json` files trigger reloads

### Development URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

### Hot Reloading Features
- ✅ **Client**: React components update instantly
- ✅ **Server**: API routes restart automatically
- ✅ **Database**: Changes persist between reloads
- ✅ **Environment**: Development variables loaded automatically

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_WALLET_ADDRESS=your_admin_wallet_address
ETHERSCAN_API_KEY=your_etherscan_api_key
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repo to Vercel
2. Set build command: `npm run build`
3. Set output directory: `client/build`

### Backend (Render/Railway)
1. Deploy to your preferred platform
2. Set environment variables
3. Set start command: `npm start`

## 📱 Usage

1. **Register/Login**: Create an account or sign in
2. **Connect Wallet**: Link your MetaMask wallet
3. **Complete Profile**: Add skills, bio, and LinkedIn URL
4. **Post Jobs**: Create job listings
5. **Discover**: Browse jobs and connect with professionals
6. **AI Features**: Get personalized recommendations

## 🎯 Project Structure

```
rizeos-job-portal/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── contracts/              # Smart contracts
├── docs/                   # Documentation
└── README.md
```

## 🏆 Evaluation Criteria

- **Core Functionality & APIs**: 30%
- **Web3 Integration**: 20%
- **AI Features**: 20%
- **UI/UX Design**: 10%
- **Code Quality**: 10%
- **Documentation & Demo**: 10%

## 📞 Support

For questions or issues, please contact the development team.

---

Built with ❤️ for RizeOS Core Team Internship 