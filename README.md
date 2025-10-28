# 🏋️ FitTracker - Complete Fitness Tracking Application

A comprehensive fitness tracking platform built with Next.js, MongoDB, and AI-powered assistance using Groq's Llama 3.3.

## ✨ Features

### 🎯 Core Functionality

- **User Authentication**: Secure JWT-based auth with bcrypt password hashing
- **Fitness Tracking**: Steps, calories, heart rate, and active minutes
- **Workout Planning**: Create personalized workout plans based on fitness goals
- **Nutrition Tracking**: Log meals, track macros, and generate meal plans with AI food suggestions
- **Hydration Monitoring**: Track daily water intake with streak tracking
- **Gamification**: Earn points, badges, and level up based on activity
- **AI Assistant**: Chat-based fitness coach powered by Groq's Llama 3.3 for motivation and suggestions
- **Google Fit Integration**: Sync fitness data from Google Fit (simulated)

### 📊 Analytics & Progress

- Visual progress charts and trends
- Weekly/monthly statistics
- Achievement system
- Streak tracking for workouts, nutrition, and hydration
- Interactive workout calendar
- Real-time macro tracking with progress visualization

### 🤖 AI-Powered Features

- **Intelligent Chat Assistant**: Real-time fitness and nutrition advice using Groq's Llama 3.3-70B
- **Smart Food Suggestions**: AI-powered food recommendations based on remaining macros
- **Personalized Workout Plans**: AI-generated workout routines tailored to your goals
- **Context-Aware Responses**: Remembers conversation history for better assistance
- **Instant Responses**: Lightning-fast AI responses (< 2 seconds)

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15.5.4 (App Router)
- **UI Components**: Radix UI (shadcn/ui), Tailwind CSS
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

### AI & Machine Learning

- **AI Provider**: Groq (Free tier available)
- **Model**: Llama 3.3-70B-Versatile
- **SDK**: groq-sdk ^0.3.3
- **Features**:
  - Chat completions with conversation history
  - Context-aware responses
  - Workout suggestions
  - Hydration reminders
  - Nutritional advice

## 📦 Installation

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Groq API key (Free at https://console.groq.com)
- npm or yarn

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/Megharajvsaka/fittracker.git
cd fittracker
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fittrackerDB?retryWrites=true&w=majority

# JWT Secret (Generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Groq AI API Key (Get from https://console.groq.com/keys)
GROQ_API_KEY=gsk_your_groq_api_key_here

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Environment
NODE_ENV=development
```

**Generate secure secrets:**

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Get Groq API Key (FREE):**

1. Visit https://console.groq.com/keys
2. Sign up with Google/GitHub (30 seconds)
3. Click "Create API Key"
4. Copy and paste into `.env.local`

5. **Run the development server**

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
│   │   └── ai-assistant/ # AI chat endpoints (Groq-powered)
│   ├── dashboard/        # Dashboard pages
│   │   ├── page.tsx      # Main dashboard
│   │   ├── profile/      # User profile
│   │   ├── fitness/      # Fitness stats
│   │   ├── workouts/     # Workout planner
│   │   ├── nutrition/    # Nutrition tracker with AI suggestions
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
│   ├── FoodSuggester.tsx      # NEW: AI-powered food suggestions
│   ├── AIAssistantChat.tsx    # AI chat interface
│   └── ui/               # UI primitives (shadcn/ui)
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
│   ├── ai-assistant.ts   # AI chat logic (Groq integration)
│   ├── constants/
│   │   └── foods.ts      # Food database
│   ├── utils/
│   │   └── nutritionUtils.ts  # Nutrition calculations
│   └── utils.ts          # Utility functions
└── ...
```

## 🚀 Deployment

### MongoDB Setup

1. Create a MongoDB Atlas cluster
2. Whitelist your IP address (or allow all for development: 0.0.0.0/0)
3. Create a database user
4. Get connection string and add to `.env.local`

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

### Environment Variables (Production)

Add these in your Vercel/deployment platform:

- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Strong random secret for JWT
- `GROQ_API_KEY` - Your Groq API key
- `NEXT_PUBLIC_API_URL` - Your production URL
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

- 🏋️ Workout badges (First Workout, Week Warrior, Monthly Champion)
- 🥗 Nutrition badges (Nutrition Starter, Meal Planner)
- 💧 Hydration badges (Hydration Hero, Water Warrior)
- 🔥 Streak badges (7-day, 30-day, 100-day streaks)
- 🏆 Achievement badges

### Leveling System

- 20 levels total
- Points required increase progressively
- Visual level progress bars
- Unlockable achievements at each level

## 🤖 AI Assistant Features

### Powered by Groq's Llama 3.3-70B

- **Conversational Interface**: Natural chat-based interaction
- **Intelligent Responses**: Context-aware answers to fitness and nutrition questions
- **Workout Suggestions**: Personalized workout recommendations based on goals
- **Hydration Reminders**: Smart water intake reminders
- **Nutrition Advice**: Meal planning and macro tracking assistance
- **Motivation**: Encouraging messages based on progress
- **Chat History**: Persistent conversation history (last 10 messages for context)
- **Lightning Fast**: Responses in under 2 seconds thanks to Groq's infrastructure

### AI-Powered Food Suggestions

- **Smart Matching**: Analyzes remaining daily macros
- **Scoring System**: Ranks foods by how well they fit your needs
- **One-Click Add**: Instantly add suggested foods to your log
- **Visual Feedback**: Match scores and macro breakdowns
- **Real-time Updates**: Suggestions adapt as you log food

### Free Tier Benefits (Groq)

- ✅ 30 requests per minute
- ✅ 6,000 tokens per minute
- ✅ No credit card required
- ✅ Perfect for personal projects

## 🔒 Security Features

- Password hashing with bcryptjs (12 rounds)
- JWT authentication with 7-day expiration
- HTTP-only cookies for token storage
- Input validation on all API routes
- MongoDB injection prevention
- Protected API routes with token verification
- Environment variable protection
- API key security (Groq)

## 📱 Responsive Design

- Mobile-first approach
- Responsive navigation (collapsible sidebar)
- Touch-friendly interface
- Optimized for all screen sizes (mobile, tablet, desktop)
- Dark theme throughout

## 🧪 Testing

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build test
npm run build
```

## 🛣️ Roadmap

### Phase 1 (Completed) ✅

- [x] User authentication
- [x] Fitness tracking
- [x] Workout planning
- [x] Nutrition tracking
- [x] Gamification system
- [x] AI assistant with Groq
- [x] AI food suggestions

### Phase 2 (In Progress) 🚧

- [ ] Real Google Fit OAuth integration
- [ ] Enhanced workout video demonstrations
- [ ] Barcode scanner for nutrition
- [ ] Progress photos upload
- [ ] Export data (PDF reports)

### Phase 3 (Future) 🔮

- [ ] Social features (friend challenges, leaderboards)
- [ ] Wearable device integration (Fitbit, Apple Watch)
- [ ] Mobile app (React Native)
- [ ] Meal photo recognition
- [ ] Advanced analytics dashboard
- [ ] Personal trainer marketplace

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Keep components modular and reusable
- Write meaningful commit messages
- Test on multiple screen sizes

## 👨‍💻 Author

**Megharaj V Saka**

- GitHub: [@Megharajvsaka](https://github.com/Megharajvsaka)
- Email: megharajjeeva8105@gmail.com
- LinkedIn: [Megharaj V Saka](www.linkedin.com/in/megharajvs)

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Groq** for free, blazing-fast AI inference
- **Meta AI** for the Llama 3.3 model
- **Radix UI** for accessible components
- **Recharts** for beautiful charts
- **MongoDB** for the database
- **Vercel** for hosting
- **shadcn/ui** for the component library
- **Tailwind CSS** for utility-first styling

## 📈 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **AI Response Time**: < 2 seconds average
- **Page Load Time**: < 1 second
- **Bundle Size**: Optimized with Next.js 15

## 🌟 Key Differentiators

1. **Free AI Integration**: Unlike competitors, uses free Groq API
2. **Real-time Suggestions**: Smart food recommendations based on macros
3. **Comprehensive Gamification**: Points, badges, levels, and streaks
4. **Modern Tech Stack**: Latest Next.js 15 with App Router
5. **Fast & Responsive**: Lightning-fast performance on all devices

## 📞 Support

For issues, questions, or suggestions:

1. Open a GitHub issue
2. Email: megharajjeeva8105@gmail.com
3. Check existing issues for solutions

## ⭐ Show Your Support

If you like this project, please give it a ⭐ on GitHub!

---

**Built with ❤️ and 💪 by Megharaj V Saka**

_Empowering your fitness journey with AI_
