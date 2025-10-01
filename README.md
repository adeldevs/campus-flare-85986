# Campus Events Web App

A modern, full-featured college events management platform built with React, Firebase, and Tailwind CSS.

## Features

### 🔐 Authentication
- Google Sign-In for all users
- Role-based access control (Ultimate Admin, Low-Level Admin, User)
- Profile management with avatar upload

### 👥 User Roles

**Ultimate Admin**
- Full control panel to manage all events
- Approve/reject admin applications
- Assign admin privileges
- View all events and registrations

**Low-Level Admin**
- Apply through portal form
- Create and manage own events
- Publish/unpublish events
- Track event registrations

**Normal User**
- View all published events
- Register for events
- Set event reminders
- Manage profile and view registered events

### 📅 Events Management
- Create events with title, description, date, time, location
- Upload event banner images
- Categorize events (seminar, fest, workshop, competition, cultural, sports)
- Filter events by category
- Real-time registration tracking
- Event status management (draft/published)

### 🎨 Design
- Modern, responsive UI with Tailwind CSS
- Vibrant color scheme (indigo & coral)
- Smooth animations and transitions
- Mobile-friendly design
- Beautiful gradient effects

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Firebase (Firestore, Auth, Storage)
- **State Management**: React Context API
- **Routing**: React Router v6
- **Date Handling**: date-fns

## Getting Started

### Prerequisites
- Node.js & npm installed
- Firebase project with Firestore, Authentication, and Storage enabled

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Firebase Setup

The app is pre-configured with Firebase credentials. To use your own Firebase project:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Google Authentication
3. Enable Firestore Database
4. Enable Storage
5. Update `src/lib/firebase.ts` with your Firebase config

### Firestore Security Rules

Make sure to set up appropriate security rules for your Firestore collections:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /events/{eventId} {
      allow read: if true;
      allow create: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'lowLevelAdmin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ultimateAdmin');
      allow update, delete: if request.auth != null && 
        (resource.data.createdBy == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ultimateAdmin');
    }
    
    match /adminRequests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'user';
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ultimateAdmin';
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
    
    match /event-banners/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Project Structure

```
src/
├── components/
│   ├── admin/              # Admin-specific components
│   │   ├── AdminRequestsManager.tsx
│   │   ├── CreateEventDialog.tsx
│   │   └── EventsManager.tsx
│   ├── ui/                 # shadcn UI components
│   ├── EventCard.tsx       # Event display component
│   ├── Navbar.tsx          # Navigation bar
│   └── ProtectedRoute.tsx  # Route protection wrapper
├── contexts/
│   └── AuthContext.tsx     # Authentication context
├── lib/
│   ├── firebase.ts         # Firebase configuration
│   └── utils.ts            # Utility functions
├── pages/
│   ├── AdminDashboard.tsx  # Admin control panel
│   ├── ApplyAdmin.tsx      # Admin application form
│   ├── Auth.tsx            # Sign in page
│   ├── Events.tsx          # Events listing page
│   ├── Home.tsx            # Landing page
│   ├── NotFound.tsx        # 404 page
│   └── Profile.tsx         # User profile page
├── types/
│   └── index.ts            # TypeScript type definitions
├── App.tsx                 # Main app component
└── main.tsx                # App entry point
```

## Default Admin Setup

To set up the first Ultimate Admin:

1. Sign in with Google
2. Manually update your user document in Firestore:
```javascript
// In Firestore console, update your user document:
{
  role: "ultimateAdmin"
}
```

## Features Roadmap

- [ ] Email notifications for event reminders
- [ ] Push notifications via Firebase Cloud Messaging
- [ ] Event calendar view
- [ ] Advanced search and filtering
- [ ] QR code for event check-in
- [ ] Event attendance tracking
- [ ] Export registration data

## License

MIT License - feel free to use this project for your college!

## Support

For issues and questions, please open an issue on the repository.
