# FocusFlow Frontend

React frontend for the FocusFlow goal tracking application.

## Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

The application will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

## Features

- **User Authentication**: Register and login functionality
- **Goal Management**: Create, edit, and delete goals
- **Milestone Tracking**: Add milestones to goals and mark them as complete
- **Dashboard**: Overview of goals and progress statistics
- **Responsive Design**: Modern UI that works on all devices

## Components

- **Navbar**: Navigation and authentication status
- **Dashboard**: Main page with goals overview and statistics
- **GoalList**: Display and manage all goals
- **GoalForm**: Form to create new goals
- **MilestoneList**: Display and manage milestones for each goal
- **Login/Register**: Authentication forms

## API Integration

The frontend communicates with the Flask backend API at `http://localhost:5000`. The proxy is configured in `package.json` to handle CORS during development.

## Styling

Uses custom CSS with modern design principles:

- Gradient backgrounds
- Card-based layouts
- Smooth animations and transitions
- Responsive grid system
- Modern color scheme

## State Management

Uses React hooks for local state management:

- `useState` for component state
- `useEffect` for side effects and API calls
- Local storage for authentication persistence
