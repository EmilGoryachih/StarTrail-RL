# StarTrail AI Frontend

This directory contains the Next.js-based frontend for **StarTrail AI**. It provides an intelligent user interface for semantic search and personalized POI recommendations powered by AI.

---

## 🌟 Features

- **AI-Powered Search**: Semantic search that understands natural language queries
- **Personalized Recommendations**: ML-based recommendations tailored to user interests
- **Modern UI**: Beautiful gradient design with glassmorphism effects
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Interactive Maps**: Leaflet-based maps for visualizing POI locations
- **User Profiles**: Comprehensive user management with interests and preferences
- **Favorites System**: Save and manage favorite places

---

## 📁 Structure

```
Frontend/
├── app/                # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── search/            # Semantic search page
│   ├── recommendations/   # Personalized recommendations
│   ├── profile/           # User profile management
│   ├── favorites/         # Saved favorite places
│   ├── feedback/          # User feedback
│   └── results/           # Search results (with map)
├── components/         # Reusable React components
│   ├── ui/                # shadcn/ui components
│   ├── user-menu.tsx      # User dropdown menu
│   └── LanguageSwitcher.tsx # Language selection
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── public/             # Static assets
├── styles/             # Global styles
└── package.json        # Project dependencies
```

---

## 🎨 Design System

StarTrail uses a modern design system with:
- **Primary Colors**: Indigo (#6366f1) to Blue (#3b82f6) gradients
- **Typography**: Inter font family
- **Components**: shadcn/ui component library
- **Styling**: Tailwind CSS with custom theme
- **Effects**: Glassmorphism, backdrop blur, gradient text

---

## 🛠️ Development

1. **Install dependencies** (using `npm`, `pnpm`, or `yarn`):

   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

2. **Run the development server**:

   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

3. **Environment variables**:

   The API proxy is configured in `next.config.mjs` to forward `/api/*` requests to the backend.

4. **Build for production**:

   ```bash
   npm run build
   npm run start
   ```

---

## 🐳 Docker

The project includes a `Dockerfile` for containerized deployment:

```bash
# Build the image
docker build -t startrail-frontend .

# Run the container
docker run -p 3000:3000 startrail-frontend
```

Or use `docker-compose` from the repository root:

```bash
docker-compose up --build
```

The frontend will be available on port **3000**.

---

## 📱 Pages Overview

### Public Pages
- **Home** (`/`): Landing page with feature highlights
- **Login** (`/login`): User authentication
- **Register** (`/register`): Two-step registration with interests selection

### Protected Pages (require authentication)
- **Search** (`/search`): Semantic search with filters
- **Recommendations** (`/recommendations`): AI-generated personalized suggestions
- **Profile** (`/profile`): User profile and preferences management
- **Favorites** (`/favorites`): Saved POIs
- **Results** (`/results`): Search results with map view
- **Feedback** (`/feedback`): User feedback form

---

## 🔌 API Integration

The frontend communicates with the FastAPI backend through the following endpoints:

### Authentication
- `POST /api/token/get-token` - Login
- `POST /api/token/refresh` - Refresh token
- `GET /api/token/current-user` - Get current user

### User Management
- `POST /api/user/register` - Register new user
- `PUT /api/user/update_interests` - Update interests
- `PUT /api/user/update_city` - Update city
- `PUT /api/user/update_about_me` - Update bio
- `PUT /api/user/update_additional_interests` - Update preferences
- `GET /api/user/interests` - Get user interests

### POI Operations
- `GET /api/poi?q=<query>` - Semantic search
- `GET /api/poi/recommendations` - Get recommendations
- `POST /api/user/favorites/{poi_id}` - Add to favorites
- `GET /api/user/favorites` - Get all favorites

---

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI)
- **Maps**: Leaflet + react-leaflet
- **HTTP Client**: Fetch API
- **State Management**: React hooks
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Language**: TypeScript

---

## 🔧 Configuration

### Next.js Config (`next.config.mjs`)
- API proxy to backend (`/api/*` → `http://app:8000/api/*`)
- Image optimization disabled for compatibility
- i18n support for Russian and English

### Tailwind Config (`tailwind.config.ts`)
- Custom color palette with indigo/blue gradients
- Extended spacing and border radius
- Custom animations and utilities

---

## 📝 Notes

- The application uses cookie-based authentication with JWT tokens
- All protected routes check for `access_token` cookie
- Profile data is fetched from the server, not localStorage
- Map markers require leaflet CSS and custom icon configuration
- The UI uses glassmorphism effects for a modern look

---

## 🤝 Contributing

When adding new pages or components:
1. Follow the existing design system
2. Use the StarTrail branding (Sparkles icon, gradient colors)
3. Ensure responsive design
4. Add proper TypeScript types
5. Keep the gradient theme consistent

---
