# AI Interview Platform

A full-stack AI-powered interview platform that helps users practice and prepare for technical interviews with the help of AI.

## 🚀 Technologies

### Frontend
- React 19 with Vite
- Material-UI (MUI) v7 for UI components
- React Router for navigation
- Axios for API requests
- Framer Motion for animations
- React Speech Recognition for voice input
- Styled Components for styling

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- Google Cloud Text-to-Speech
- LangChain for AI interview capabilities
- OpenAI integration
- PDF parsing for resume analysis

## 🛠️ Project Structure

```
AI-Interview/
├── backendAiInterview/     # Backend server
│   ├── src/                # Source code
│   ├── .env                # Environment variables
│   └── package.json        # Backend dependencies
└── frontendAiInterview/     # Frontend React app
    ├── src/                # Source code
    ├── public/             # Static files
    └── package.json        # Frontend dependencies
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas or local MongoDB instance
- Google Cloud credentials (for TTS)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-Interview
   ```

2. **Backend Setup**
   ```bash
   cd backendAiInterview
   npm install
   cp .env.example .env  # Configure your environment variables
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontendAiInterview
   npm install
   cp .env.example .env  # Configure your environment variables
   ```

## 🚦 Running the Application

1. **Start Backend**
   ```bash
   cd backendAiInterview
   npm start
   ```

2. **Start Frontend**
   ```bash
   cd ../frontendAiInterview
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 🔒 Environment Variables

### Backend (`.env`)
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credentials.json
GOOGLE_API_KEY=your_google_api_key
```

## 📝 Features

- User authentication (Register/Login)
- AI-powered mock interviews
- Voice-based interview responses
- Real-time feedback and scoring
- Resume analysis
- Interview history and analytics

## 👤 Author

**DeshDeepakKant**

- GitHub: [@DeshDeepakKant](https://github.com/DeshDeepakKant/AI-Interviewer)
- LinkedIn: [DeshDeepakKant](https://www.linkedin.com/in/deshdeepakkant/)
- Email: deshdeepakkant@gmail.com
