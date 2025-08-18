# FocusFlow Backend

Flask API backend for the FocusFlow goal tracking application.

## Setup

1. **Create Virtual Environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Set Environment Variables**

   ```bash
   # Optional: Set a custom secret key
   export SECRET_KEY="your-secret-key-here"

   # Optional: Set custom database URL
   export DATABASE_URL="sqlite:///focusflow.db"
   ```

4. **Initialize Database**
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

## Running the Application

### Development Mode

```bash
flask run
```

### Production Mode

```bash
gunicorn wsgi:app
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /auth/register` - Create new user account
- `POST /auth/login` - User login

### Goals

- `GET /goals/` - Get all goals for authenticated user
- `POST /goals/` - Create new goal
- `GET /goals/<id>` - Get specific goal
- `PUT /goals/<id>` - Update goal
- `DELETE /goals/<id>` - Delete goal

### Milestones

- `GET /goals/<goal_id>/milestones` - Get milestones for a goal
- `POST /goals/<goal_id>/milestones` - Create new milestone
- `PUT /goals/milestones/<id>` - Update milestone
- `DELETE /goals/milestones/<id>` - Delete milestone

## Database Models

- **User**: username, password (hashed)
- **Goal**: title, description, user_id, timestamps
- **Milestone**: title, completed status, goal_id, timestamps

## Authentication

Currently uses a simple token-based system where the user ID is used as a token. In production, this should be replaced with JWT tokens.
