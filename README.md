# 🏋️ FitTracker - Complete Fitness Tracking Application

A comprehensive fitness tracking platform built with Next.js, MongoDB, and AI-powered assistance.

## ✨ Features

### 🎯 Core Functionality

- **User Authentication**: Secure JWT-based auth with bcrypt password hashing
- **Fitness Tracking**: Steps, calories, heart rate, and active minutes
- **Workout Planning**: Create personalized workout plans based on fitness goals
- **Nutrition Tracking**: Log meals, track macros, and generate meal plans
- **Hydration Monitoring**: Track daily water intake with streak tracking
- **Gamification**: Earn points, badges, and level up based on activity
- **AI Assistant**: Chat-based fitness coach for motivation and suggestions
- **Google Fit Integration**: Sync fitness data from Google Fit (simulated)

### 📊 Analytics & Progress

- Visual progress charts and trends
- Weekly/monthly statistics
- Achievement system
- Streak tracking for workouts, nutrition, and hydration
- Interactive workout calendar

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15.5.4 (App Router)
- **UI Components**: Radix UI, Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Context API
- **Forms**: React Hook Form with Zod validation

### Backend

- **Runtime**: Node.js with Next.js API Routes
- **Database**: MongoDB with native driver
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Session Management**: Cookies (js-cookie)

### AI Features

- Rule-based conversational AI
- Workout suggestions
- Hydration reminders
- Motivational messages

## 📦 Installation

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Setup

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd fittracker
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fittrackerDB?retryWrites=true&w=majority

# JWT Secret (Generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here

# NextAuth Secret (Generate a strong random string)
NEXTAUTH_SECRET=your-super-secret-nextauth-key-here

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Environment
NODE_ENV=development

# Google OAuth (Optional - for Google Fit integration)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Generate secure secrets:**

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**

```
http://localhost:3000
```

## 📁 Project Structure

```
fittracker/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── fitness/      # Fitness data endpoints
│   │   ├── nutrition/    # Nutrition tracking endpoints
│   │   ├── workouts/     # Workout management endpoints
│   │   ├── gamification/ # Points, badges, streaks
│   │   ├── hydration/    # Hydration tracking
│   │   └── ai-assistant/ # AI chat endpoints
│   ├── dashboard/        # Dashboard pages
│   │   ├── page.tsx      # Main dashboard
│   │   ├── profile/      # User profile
│   │   ├── fitness/      # Fitness stats
│   │   ├── workouts/     # Workout planner
│   │   ├── nutrition/    # Nutrition tracker
│   │   ├── ai-assistant/ # AI chat interface
│   │   └── ...
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── Sidebar.tsx
│   ├── ProtectedRoute.tsx
│   ├── FitnessStatsCard.tsx
│   ├── GamificationCard.tsx
│   ├── WorkoutCard.tsx
│   ├── WorkoutCalendar.tsx
│   ├── NutritionSummary.tsx
│   ├── MealEntryForm.tsx
│   ├── AIAssistantChat.tsx
│   └── ui/               # UI primitives
├── hooks/
│   ├── useAuth.tsx       # Authentication hook
│   └── use-toast.ts      # Toast notifications
├── lib/
│   ├── mongodb.ts        # Database connection
│   ├── auth.ts           # Auth logic
│   ├── fitness-data.ts   # Fitness data management
│   ├── workouts.ts       # Workout logic
│   ├── nutrition.ts      # Nutrition logic
│   ├── hydration.ts      # Hydration tracking
│   ├── gamification.ts   # Points & badges system
│   ├── ai-assistant.ts   # AI chat logic
│   └── utils.ts          # Utility functions
└── ...
```

## 🚀 Deployment

### MongoDB Setup

1. Create a MongoDB Atlas cluster
2. Whitelist your IP address
3. Create a database user
4. Get connection string and add to `.env`

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

### Environment Variables

Make sure to add all environment variables in your deployment platform:

- `MONGODB_URI`
- `JWT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_API_URL`
- `NODE_ENV=production`

## 📊 Database Collections

The application uses the following MongoDB collections:

- **users** - User accounts and profiles
- **workoutSessions** - Individual workout sessions
- **workoutPlans** - Workout plans
- **foodEntries** - Meal logging
- **nutritionGoals** - User nutrition goals
- **mealPlans** - Generated meal plans
- **hydration** - Daily hydration tracking
- **fitnessMetrics** - Steps, calories, heart rate data
- **fitnessGoals** - Daily fitness goals
- **achievements** - Fitness achievements
- **gamificationProfiles** - User levels, points, badges
- **activityLogs** - Gamification activity logs
- **conversations** - AI assistant chat history

## 🎮 Gamification System

### Points Structure

- Workout completed: 50 points
- Workout bonus (45+ min): 25 points
- Meal logged: 10 points
- Daily nutrition goal: 30 points
- Hydration goal met: 20 points
- Hydration bonus: 15 points
- 7-day streak: 100 points
- 30-day streak: 300 points
- 100-day streak: 1000 points

### Badge Categories

- 🏋️ Workout badges
- 🥗 Nutrition badges
- 💧 Hydration badges
- 🔥 Streak badges
- 🏆 Achievement badges

## 🤖 AI Assistant Features

- **Conversational Interface**: Chat-based interaction
- **Workout Suggestions**: Personalized workout recommendations
- **Hydration Reminders**: Automated water intake reminders
- **Motivation**: Encouraging messages based on progress
- **Context-Aware**: Responds to workout, nutrition, and hydration queries
- **Chat History**: Persisted conversation history

## 🔒 Security Features

- Password hashing with bcryptjs (12 rounds)
- JWT authentication with 7-day expiration
- HTTP-only cookies for token storage
- Input validation on all API routes
- MongoDB injection prevention
- Protected API routes with token verification

## 📱 Responsive Design

- Mobile-first approach
- Responsive navigation (collapsible sidebar)
- Touch-friendly interface
- Optimized for all screen sizes

## 🧪 Testing

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Run tests (if configured)
npm test
```

## 🛣️ Roadmap

- [ ] Real Google Fit OAuth integration
- [ ] Social features (friend challenges)
- [ ] Workout video library
- [ ] Barcode scanner for nutrition
- [ ] Wearable device integration
- [ ] Progress photos
- [ ] Export data (PDF reports)
- [ ] Mobile app (React Native)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Megharaj V Saka**

- GitHub: [@MegharajVsaka](https://github.com/Megharajvsaka)
- Email: megharajjeeva8105@gmail.com

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Radix UI for accessible components
- Recharts for beautiful charts
- MongoDB for the database
- Vercel for hosting

---

**Built with ❤️ and 💪 by [Your Name]**
