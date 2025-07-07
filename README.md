# Feedback Platform

A full-stack web application for creating and managing anonymous employee feedback forms with Google authentication and domain-based access control.

## Features

### For HR Teams (Admins)
- 🔐 **Google Sign-In Authentication** - Secure login with Firebase Auth
- 📝 **Dynamic Form Builder** - Create forms with multiple question types:
  - Short answer text
  - Rating scales (1-5)
  - Checkboxes
  - Dropdown selections
  - Multiple choice questions
- 🔒 **Domain/Email Restrictions** - Control access with specific email domains or individual emails
- 📊 **Analytics Dashboard** - View response analytics and insights
- 📋 **Response Management** - View all anonymous responses
- 🔗 **Form Sharing** - Generate and share unique form links

### For Employees
- 🚀 **Easy Access** - Open form links and sign in with Google
- 🔐 **Domain Verification** - Automatic access control based on email domain
- 📝 **Anonymous Submission** - Submit feedback without revealing identity
- ✅ **One-time Submission** - Prevent duplicate submissions
- 🎯 **Thank You Page** - Confirmation after successful submission

## Tech Stack

### Frontend
- **React.js** - Functional components with hooks
- **React Router** - Client-side routing
- **Firebase Authentication** - Google Sign-In
- **Axios** - HTTP client for API calls
- **CSS3** - Modern styling with responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Firebase Admin SDK** - Server-side authentication
- **CORS** - Cross-origin resource sharing

## Project Structure

```
OCNFIDEX-2/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Navbar.js
│   │   │   └── FormBuilder.js
│   │   ├── pages/         # Page components
│   │   │   ├── Login.js
│   │   │   ├── CreateForm.js
│   │   │   ├── FormSubmit.js
│   │   │   ├── ThankYou.js
│   │   │   └── AdminDashboard.js
│   │   ├── firebase.js    # Firebase configuration
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # Mongoose models
│   │   ├── User.js
│   │   ├── Form.js
│   │   └── Response.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── form.js
│   │   └── admin.js
│   ├── middleware/       # Authentication middleware
│   │   └── authMiddleware.js
│   ├── app.js           # Express app setup
│   └── package.json
└── README.md
```

## Database Models

### User
```javascript
{
  uid: String,           // Firebase UID
  email: String,         // User email
  formsSubmitted: [formId] // Track submitted forms
}
```

### Form
```javascript
{
  title: String,
  description: String,
  creatorEmail: String,
  allowedEmails: [String],
  allowedDomains: [String],
  questions: [{
    id: String,
    type: "short" | "rating" | "checkbox" | "dropdown" | "multiple-choice",
    label: String,
    options: [String],
    required: Boolean
  }]
}
```

### Response
```javascript
{
  formId: ObjectId,
  submittedAt: Date,
  answers: {
    [questionId]: Any
  }
}
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Firebase project with Google Authentication enabled

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd OCNFIDEX-2

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Google Authentication
3. Create a web app and get configuration
4. Generate a service account key for backend authentication

### 3. Environment Configuration

#### Backend (.env)
```bash
cd server
cp env.example .env
```

Edit `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/feedback_platform
FIREBASE_ADMIN_KEY={"type":"service_account",...} # Your Firebase service account JSON
ADMIN_EMAIL_WHITELIST=admin@example.com,hr@company.com
PORT=5000
```

#### Frontend (.env)
```bash
cd client
```

Create `client/.env`:
```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ADMIN_EMAILS=admin@example.com,hr@company.com
```

### 4. Start the Application

#### Development Mode
```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm start
```

#### Production Mode
```bash
# Build frontend
cd client
npm run build

# Start backend
cd ../server
npm start
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## API Endpoints

### Authentication
- `GET /api/auth/verify` - Verify user token

### Forms
- `POST /api/form/create` - Create new form (admin only)
- `GET /api/form/:formId` - Get form with access check
- `POST /api/form/:formId/submit` - Submit form response
- `GET /api/form/admin/forms` - Get admin's forms

### Admin
- `GET /api/admin/forms` - Get forms with response counts
- `GET /api/admin/forms/:formId/responses` - Get form responses
- `GET /api/admin/forms/:formId/analytics` - Get form analytics
- `GET /api/admin/dashboard` - Get dashboard overview

## Security Features

- **Firebase Authentication** - Secure Google Sign-In
- **Token Verification** - Server-side token validation
- **Admin Access Control** - Email-based admin permissions
- **Domain Restrictions** - Control form access by email domain
- **Anonymous Responses** - No user identification in responses
- **One-time Submission** - Prevent duplicate submissions

## Usage Guide

### For Admins

1. **Sign In**: Use Google Sign-In with admin email
2. **Create Form**: Navigate to "Create Form" page
3. **Configure Access**: Set allowed emails/domains
4. **Add Questions**: Choose from multiple question types
5. **Share Form**: Copy the generated form link
6. **View Analytics**: Check dashboard for insights

### For Employees

1. **Access Form**: Open the shared form link
2. **Sign In**: Use Google Sign-In
3. **Verify Access**: System checks email domain
4. **Submit Feedback**: Fill out the form anonymously
5. **Confirmation**: See thank you page

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 