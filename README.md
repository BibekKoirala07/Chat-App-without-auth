# Chat Application - Single & Group Chat

This is a **MERN (MongoDB, Express, React, Node.js)** based chat application that allows users to engage in both **single** and **group** chats in real-time. It uses **Socket.IO** for real-time communication, making it seamless for users to interact.

## Features

- **Single Chat:** Users can have one-on-one conversations with other users in real-time.
- **Group Chat:** Create and manage group chats where multiple users can chat simultaneously.
- **Real-Time Communication:** Built with **Socket.IO** to ensure instant message delivery.
- **Unique Username Handling:** If a user tries to use a name that already exists, it is fetched from the database and reused, even if it was used by a previous user.

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (for running the backend and the client)
- **MongoDB** (for the database)
- **npm** (for managing dependencies)

## Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/chat-app.git
   cd chat-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:

   ```bash
   DB_URI=<your-mongo-db-uri>
   PORT=5000
   SOCKET_PORT=3001
   ```

4. Start the backend:
   ```bash
   npm start
   ```

The backend server will be running on `http://localhost:5000`.

## Frontend Setup

1. Navigate to the `client` directory:

   ```bash
   cd client
   ```

2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Start the frontend:
   ```bash
   npm start
   ```

The frontend will be running on `http://localhost:3000`.

## Socket.IO Integration

- **Socket.IO** is used to enable real-time communication between the users. Both the backend and frontend have Socket.IO clients set up to handle real-time message updates.

## Handling Duplicate Usernames

When users join the chat, they are prompted to choose a unique name. However, if the name they select already exists in the database, the app automatically fetches that name and uses it—even if it was previously used by a different user.

## UI/UX

The **UI** has been designed to ensure that users can easily switch between friends and groups, search for users and groups, and send messages with minimal effort. Here’s an overview of the layout:

1. **Login Page:** Users can enter their name (if it’s not already taken) and join the chat.
2. **Main Chat Page:**
   - **Friends Section:** Shows a list of friends that the user can chat with.
   - **Groups Section:** Displays a list of groups the user is part of.
   - **Search Bar:** Allows users to search for friends and groups by name.
   - **Message Area:** Where messages are displayed in real-time.
   - **Create Group Modal:** Users can create new groups by selecting multiple friends.

### UI Components

- **Message Area:** Real-time display of messages. The user can send a message by typing in the input box and hitting enter.
- **Active Users:** Shows users currently online (available via the backend using Socket.IO).
- **User Profile Pictures:** Displayed as circular avatars for easy identification.
- **Notifications:** A small notification badge appears next to group names if there are unread messages.

## Conclusion

This application demonstrates the power of real-time chat using **MERN** and **Socket.IO**. It can be further expanded with features like message history, notifications, media sharing, and more.
