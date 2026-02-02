# CharamSukh - Story Reading Platform

A full-featured story reading platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring text-to-speech audio capabilities, user authentication, and role-based access control.

## 🌟 Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with role management
- **Story Reading**: Rich text stories with responsive design
- **Audio Narration**: Text-to-speech functionality with playback controls
- **Multi-Role System**: Users, Authors, and Admins with different permissions
- **Responsive Design**: Mobile-first approach with dark/light mode

### User Features
- Browse and search stories by category, tags, or content
- Bookmark favorite stories
- Reading progress tracking
- Audio playback with speed control
- Comment and like stories
- Personal dashboard with reading statistics

### Author Features
- Create and publish stories with rich text editor
- Story management dashboard
- Generate AI audio narration
- View story analytics (reads, likes, comments)
- Edit and delete own stories

### Admin Features
- User and author management
- Story moderation (approve/reject)
- Platform analytics
- Content management
- User suspension/activation

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **FontAwesome** - Icons
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Security & Performance
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection
- **Input Validation** - Data sanitization

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/charamsukh.git
   cd charamsukh
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Environment Setup**
   ```bash
   # In the server directory
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Start the development servers**
   
   **Backend (Terminal 1):**
   ```bash
   cd server
   npm run dev
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
charamsukh/
├── public/                 # Static files
├── src/                   # Frontend source
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── server/               # Backend source
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   └── server.js         # Server entry point
├── package.json          # Frontend dependencies
└── README.md            # Project documentation
```

## 🔐 Authentication

The platform uses JWT-based authentication with three user roles:

### Demo Accounts
- **User**: `user@demo.com` / `password123`
- **Author**: `author@demo.com` / `password123`
- **Admin**: `admin@demo.com` / `password123`

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

#### Stories
- `GET /api/stories` - Get all stories (with filters)
- `GET /api/stories/:id` - Get single story
- `POST /api/stories` - Create story (Author only)
- `PUT /api/stories/:id` - Update story (Author only)
- `DELETE /api/stories/:id` - Delete story (Author/Admin)
- `POST /api/stories/:id/like` - Like/unlike story
- `POST /api/stories/:id/comment` - Add comment

#### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user status
- `GET /api/admin/stories/pending` - Get pending stories
- `PUT /api/admin/stories/:id/moderate` - Moderate story

## 🎨 UI/UX Features

### Design System
- **Modern & Clean**: Minimalist design with focus on readability
- **Responsive**: Mobile-first approach with breakpoints for all devices
- **Dark/Light Mode**: User preference with system detection
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Smooth Animations**: CSS transitions and hover effects

### Key Components
- **Navigation**: Sticky header with role-based menu items
- **Story Cards**: Hover effects with category badges and audio indicators
- **Audio Player**: Custom controls with progress bar and speed adjustment
- **Dashboards**: Role-specific interfaces with statistics and management tools
- **Forms**: Validation with real-time feedback

## 🔊 Audio Features

### Text-to-Speech Integration
- **AI Narration**: Automatic audio generation for stories
- **Playback Controls**: Play, pause, seek, and speed control
- **Progress Tracking**: Visual progress bar with time indicators
- **Multiple Speeds**: 0.5x to 2x playback speed options
- **Highlight Sync**: Text highlighting during audio playback (planned)

## 📊 Analytics & Monitoring

### User Analytics
- Reading time tracking
- Story completion rates
- Favorite genres
- Listening habits

### Author Analytics
- Story performance metrics
- Reader engagement
- Audio play statistics
- Comment and like tracking

### Admin Analytics
- Platform usage statistics
- User growth metrics
- Content moderation stats
- Audio generation usage

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcryptjs with salt rounds
- **Input Validation** and sanitization
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for secure cross-origin requests
- **Security Headers** via Helmet middleware
- **Role-Based Access Control** (RBAC)

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Configure environment variables

### Backend Deployment (Heroku/Railway)
1. Set up MongoDB Atlas or cloud database
2. Configure environment variables
3. Deploy the server directory

### Environment Variables
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=your_frontend_url
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **MongoDB** for the flexible database solution
- **FontAwesome** for the comprehensive icon library
- **Vite** for the fast build tool

## 📞 Support

For support, email support@charamsukh.com or join our Discord community.

---

**Made with ❤️ by the CharamSukh Team**