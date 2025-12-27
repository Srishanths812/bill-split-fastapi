# API Services Documentation

## Overview
This services folder contains a centralized API service layer that handles all communication with the FastAPI backend. This replaces scattered `fetch` calls throughout the application with a clean, maintainable interface.

## File Structure
- `api.js` - Main API service file with all backend endpoints

## Usage

### Importing the API Service
```javascript
import { api } from "../services/api";
```

### API Endpoints

#### Authentication APIs (`api.auth`)
- `signup(signupData)` - Register a new user
- `login(loginData)` - Login user
- `forgotPassword(email)` - Request password reset

#### Profile APIs (`api.profile`)
- `getDetails(username)` - Get user profile details
- `updateDetails(updateData)` - Update profile information
- `checkPassword(password)` - Verify current password
- `deleteAccount(username)` - Delete user account

#### Search & Friends APIs (`api.search`)
- `search(searchKey)` - Search for users
- `addFriend(friendUsername)` - Send friend request
- `getFriendsRequest()` - Get pending friend requests
- `acceptFriendRequest(username)` - Accept a friend request
- `rejectFriendRequest(username)` - Decline a friend request
- `getFriendsList()` - Get list of friends
- `deleteFriend(friendUsername)` - Remove a friend

#### Group APIs (`api.group`)
- `createGroup(groupData)` - Create a new group
- `getGroups()` - Get all groups
- `getGroupInfo(groupId)` - Get detailed group information
- `getMainPageGroups(username)` - Get groups for dashboard
- `addGroupMember(groupId, memberId)` - Add member to group
- `deleteGroup(groupId)` - Delete a group
- `removeGroupMember(groupId, username)` - Remove member from group

#### Expense APIs (`api.expense`)
- `addExpense(expenseData)` - Add a new expense
- `getExpenses(groupId)` - Get expenses for a group
- `deleteExpense(expenseId)` - Delete an expense
- `settleExpense(expenseId)` - Mark expense as settled

#### Main/Dashboard APIs (`api.main`)
- `getMainData()` - Get main dashboard data with auth check

## Example Usage

### Login Example
```javascript
import { api } from "../services/api";
import toast from "react-hot-toast";

const handleLogin = async (username, password) => {
  try {
    const data = await api.auth.login({ username, password });
    if (data.success) {
      localStorage.setItem("Token", data.token);
      localStorage.setItem("Username", data.username);
      // Navigate to dashboard
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error("An error occurred");
  }
};
```

### Add Friend Example
```javascript
const handleAddFriend = async (friendName) => {
  try {
    const data = await api.search.addFriend(friendName);
    if (data.success) {
      toast.success("Friend request sent!");
    } else {
      toast.error("User already your friend");
    }
  } catch (error) {
    toast.error("Error adding friend");
  }
};
```

## Backend URL Configuration
The API service uses `import.meta.env.VITE_backend_url` for the backend URL.

Add this to your `.env` file:
```
VITE_backend_url=http://localhost:8000
```

## Error Handling
All API calls use a centralized error handler that throws errors for non-200 responses. Ensure all API calls are wrapped in try-catch blocks.

## Features
- **Centralized Header Management** - Automatically adds Content-Type and Authorization headers
- **Error Handling** - Consistent error responses and status checking
- **localStorage Integration** - Automatically manages user authentication tokens
- **Clean Interface** - Organized API calls by functionality

## Benefits
1. **Maintainability** - Single source of truth for API endpoints
2. **Consistency** - Uniform error handling and request formatting
3. **Reusability** - Easy to share API calls across components
4. **Testability** - Simple to mock and test API layers
5. **Scalability** - Easy to add new endpoints or modify existing ones
