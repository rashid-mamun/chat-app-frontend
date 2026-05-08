# Chat App Frontend — Real-Time Chat UI

A fully-featured, production-ready **React 18 + Vite** frontend for real-time chat applications. Built with modern tooling, responsive design, and Socket.IO integration. Supports private messaging, group chats, file uploads, 2FA authentication, message search, presence tracking, dark/light themes, and a polished user experience.

![React](https://img.shields.io/badge/React-18+-blue) ![Vite](https://img.shields.io/badge/Vite-4+-purple) ![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8+-green) ![Zustand](https://img.shields.io/badge/Zustand-5+-orange) ![PWA](https://img.shields.io/badge/PWA-Ready-brightgreen)

---

## 🎯 Features at a Glance

### Core Messaging UI
- ✅ Real-time private 1-on-1 messaging via WebSockets
- ✅ Real-time group chat with member management
- ✅ Message reactions (👍 ❤️ 😂 😮 😢 🔥) with emoji picker
- ✅ Read receipts (✓ sent, ✓✓ read) with visual indicators
- ✅ Typing indicators (see who's typing in real-time)
- ✅ Message editing and soft-deletion with audit trail
- ✅ Message pinning (visual indicators in chat window)
- ✅ Message forwarding to other chats
- ✅ Reply-to functionality with quote preview
- ✅ Message search with filters and pagination
- ✅ Highlight specific messages when navigating from search results

### Authentication & Security
- ✅ Register/login forms with real-time validation
- ✅ Two-Factor Authentication (TOTP) with Google Authenticator
- ✅ Password reset via email token flow
- ✅ Secure token storage (localStorage for access/refresh tokens)
- ✅ Automatic token refresh before expiry
- ✅ Protected routes (ProtectedRoute wrapper)
- ✅ Logout with token invalidation

### Presence & Real-Time
- ✅ Online/offline status indicators (green dot on avatars)
- ✅ Last seen timestamps for users
- ✅ Typing indicators (real-time updates)
- ✅ User presence broadcasts on connect/disconnect
- ✅ Automatic presence sync on app load

### File Management
- ✅ File upload modal with drag-and-drop support
- ✅ Image preview in messages (inline rendering)
- ✅ File attachment handling (download links)
- ✅ File metadata display (name, size)
- ✅ File type validation (images, docs, etc.)

### Group Management
- ✅ Create groups with initial members
- ✅ Add/remove members (admin only)
- ✅ Promote/demote admins (admin only)
- ✅ Join public groups
- ✅ Request to join private groups
- ✅ Pending invites notification
- ✅ Pending join requests manager (for admins)
- ✅ Group info panel with member list

### User Experience
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark & light theme toggle with localStorage persistence
- ✅ Toast notifications (success, error, info, warning)
- ✅ Loading skeletons for async operations
- ✅ Smooth animations and transitions
- ✅ Infinite scroll for message history
- ✅ Auto-scroll to bottom when new messages arrive
- ✅ Sidebar with conversation list and search
- ✅ Muted chat indicators (🔇 no notifications)
- ✅ Unread message counters

### Progressive Web App
- ✅ PWA with service worker registration
- ✅ Install as app on mobile devices
- ✅ Offline support (basic caching)

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 18+ | JavaScript runtime |
| **Framework** | React 18 | UI component library |
| **Build Tool** | Vite 4 | Lightning-fast dev server & bundler |
| **HTTP Client** | Axios | REST API requests with interceptors |
| **Real-Time** | Socket.IO 4.8 | WebSocket client for real-time messaging |
| **State Management** | Zustand 5 | Lightweight state store (3 stores: auth, chat, ui) |
| **Routing** | React Router 6 | Client-side routing (auth, chat pages) |
| **Icons** | Lucide React | 1000+ SVG icons (Messages, Users, Settings, etc.) |
| **Emoji Picker** | emoji-picker-react 4.19 | Rich emoji selection for reactions |
| **Date Formatting** | date-fns 4.1 | Human-friendly timestamps (e.g., "2 hours ago") |
| **PWA** | vite-plugin-pwa | Service worker & app manifest |
| **CSS** | CSS Modules + Vanilla CSS | Scoped styling with custom properties (themes) |
| **Code Quality** | ESLint + React plugins | Linting and best-practice enforcement |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 16 (tested on 18+)
- **npm** or **yarn**
- **Backend Server** running at `http://localhost:5000` (or configured via env vars)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/rashid-mamun/chat-app-frontend.git
cd chat-app-frontend
npm install
```

### 2. Set Up Environment Variables

Create a `.env` or `.env.local` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000

# Optional: Override for production
# VITE_API_URL=https://api.example.com/api/v1
# VITE_SOCKET_URL=https://api.example.com
```

**Note:** Vite uses `VITE_` prefix for environment variables exposed to the browser.

### 3. Start Development Server

```bash
npm run dev

# App will be available at: http://localhost:5173
```

The app will automatically reload on file changes (HMR — Hot Module Replacement).

### 4. Verify Connection

Open `http://localhost:5173` in your browser. You should see the login page. Ensure the backend is running at `http://localhost:5000`.

---

## 📁 Project Structure

```
chat-app-frontend/
│
├── src/
│   ├── pages/                      # Full-page components (routed)
│   │   ├── AuthPage.jsx            # Login, register, 2FA, forgot password
│   │   ├── ChatPage.jsx            # Main chat UI with modals
│   │   └── ResetPasswordPage.jsx   # Password reset flow
│   │
│   ├── components/
│   │   ├── auth/                   # Authentication UI components
│   │   │   ├── LoginForm.jsx       # Email/password login form
│   │   │   ├── RegisterForm.jsx    # New user registration form
│   │   │   ├── ForgotPasswordForm.jsx   # Password reset request
│   │   │   └── TwoFactorInput.jsx  # TOTP verification (6-digit code)
│   │   │
│   │   ├── chat/                   # Chat messaging components
│   │   │   ├── ConversationList.jsx    # Sidebar with chat list
│   │   │   ├── ConversationItem.jsx    # Single chat row (name, preview, unread)
│   │   │   ├── MessageList.jsx         # Scrollable message feed with reactions
│   │   │   ├── MessageBubble.jsx       # Single message with metadata
│   │   │   ├── MessageContextMenu.jsx  # Right-click menu (reply, forward, delete)
│   │   │   ├── DateSeparator.jsx       # Visual date divider between messages
│   │   │   ├── ForwardModal.jsx        # Modal to select chat for forwarding
│   │   │   ├── InviteList.jsx          # Pending invites + join requests display
│   │   │   └── RequestManager.jsx      # Admin join-request approval UI
│   │   │
│   │   ├── layout/                 # Layout components
│   │   │   ├── AppShell.jsx        # Main app layout (sidebar + chat window + info panel)
│   │   │   ├── Sidebar.jsx         # Conversation list + buttons (new chat, new group, search)
│   │   │   ├── ChatWindow.jsx      # Message list + input box
│   │   │   ├── InfoPanel.jsx       # Group/user details panel (members, settings)
│   │   │   └── NotificationCenter.jsx  # Notification queue display
│   │   │
│   │   ├── modals/                 # Modal dialogs (popovers for actions)
│   │   │   ├── NewChatModal.jsx    # Start private chat (search users)
│   │   │   ├── NewGroupModal.jsx   # Create group (name + member selection)
│   │   │   ├── AddMemberModal.jsx  # Add member to group
│   │   │   ├── ProfileModal.jsx    # User profile edit (username, avatar, bio)
│   │   │   ├── SearchModal.jsx     # Global message search with filters
│   │   │   ├── JoinGroupModal.jsx  # Join group by code/preview
│   │   │   └── ConfirmModal.jsx    # Generic yes/no confirmation dialog
│   │   │
│   │   └── shared/                 # Reusable UI building blocks
│   │       ├── Avatar.jsx          # User avatar (initials or image)
│   │       ├── Button.jsx          # Customizable button (variants, loading, icons)
│   │       ├── Badge.jsx           # Status/role badges (admin, online, count)
│   │       ├── Input.jsx           # Text input with icons, validation errors
│   │       ├── Toast.jsx           # Toast notification container
│   │       ├── Spinner.jsx         # Loading spinner component
│   │       ├── ThemeToggle.jsx     # Dark/light theme toggle button
│   │       └── ErrorBoundary.jsx   # React error boundary wrapper
│   │
│   ├── store/                      # Zustand state management
│   │   ├── authStore.js            # Auth state (user, tokens, login, logout)
│   │   ├── chatStore.js            # Chat state (messages, conversations, typing, reactions)
│   │   └── uiStore.js              # UI state (modals, sidebar, theme, toasts)
│   │
│   ├── api/                        # REST & Socket.IO clients
│   │   ├── axiosInstance.js        # Axios setup with auth interceptor
│   │   ├── auth.api.js             # Auth endpoints (register, login, 2FA, profile)
│   │   ├── chat.api.js             # Chat endpoints (messages, search, file upload)
│   │   ├── group.api.js            # Group endpoints (create, members, admin)
│   │   ├── user.api.js             # User endpoints (search, list)
│   │   ├── upload.api.js           # File upload endpoint
│   │   └── socket.service.js       # Socket.IO singleton (connect, emit, on)
│   │
│   ├── utils/                      # Utility functions
│   │   ├── formatters.js           # Text formatting (time, truncate, etc)
│   │   ├── validators.js           # Client-side validation rules
│   │   └── constants.js            # App constants (colors, limits, etc)
│   │
│   ├── styles/                     # Global and theme styles
│   │   ├── theme.css               # CSS variables for dark/light themes
│   │   └── globals.css             # Reset, typography, animations
│   │
│   ├── assets/                     # Static images, icons, fonts
│   │
│   ├── App.jsx                     # Root component (router + socket setup)
│   ├── App.css                     # Global app styles
│   ├── index.css                   # Tailwind imports and base styles
│   ├── main.jsx                    # React entry point (DOM render)
│   └── vite-env.d.ts               # Vite types
│
├── public/                         # Static files (index.html, manifest.json, icons)
│   ├── index.html                  # Main HTML file
│   ├── manifest.json               # PWA manifest
│   └── icons/                      # PWA icons for different sizes
│
├── vite.config.js                  # Vite build configuration (PWA plugin)
├── .eslintrc.cjs                   # ESLint rules
├── .env                            # Local env variables (NOT committed)
├── .env.example                    # Template for env variables
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

---

## 📡 API Integration

The frontend communicates with the backend via:

1. **REST API** (Axios) for authentication, user data, and file uploads
2. **Socket.IO** for real-time messaging and presence

### Base URLs
```javascript
// In .env:
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

### Request Example
```javascript
// REST API (auth.api.js)
const response = await authApi.login({ email, password });

// Socket.IO (socket.service.js)
socketService.emit('sendPrivateMessage', { recipientId, content });
socketService.on('newPrivateMessage', (message) => { ... });
```

### Auth Flow
1. **Login** → `/auth/login` (REST) → receive `accessToken` + `refreshToken`
2. **Store tokens** → `authStore` + localStorage
3. **Attach to requests** → Axios interceptor adds `Authorization: Bearer <token>`
4. **Refresh expired** → Axios interceptor exchanges refresh token automatically
5. **Socket connection** → Pass token in `auth` param during `io()` connection

---

## 🎨 Components & Pages

### Pages

#### `AuthPage`
Handles user authentication:
- **Login Form** — Email + password with "Forgot Password?" link
- **Register Form** — New user account creation
- **Forgot Password Form** — Email-based password reset
- **2FA Input** — TOTP code verification (6-digit)
- **Theme Toggle** — Top-right dark/light mode switcher

#### `ChatPage`
Main chat interface:
- **AppShell** — Layout wrapper (sidebar, chat window, info panel)
- **Modal portals** — Render active modal (create group, search, etc)

#### `ResetPasswordPage`
Password reset confirmation page:
- Parse token from URL
- Display reset form with new password input
- Redirect to login on success

### Layout Components

#### `AppShell`
Main layout container:
- Sidebar on left (conversations list)
- Chat window on center (messages)
- Info panel on right (group/user details)
- Mobile-responsive (sidebar collapses)

#### `Sidebar`
Left navigation:
- User profile header (avatar, name, logout button)
- Search conversations
- "New Chat" + "New Group" buttons
- Conversation list (scrollable)
- Pending invites badge

#### `ChatWindow`
Center message area:
- Message list (infinite scroll)
- Input box with file upload
- Emoji reactions picker
- Typing indicators

#### `InfoPanel`
Right details panel:
- Group/user name and avatar
- Member list (for groups)
- Group settings (for admins)
- Leave/delete options
- Info icon toggle

### Chat Components

#### `ConversationList`
Scrollable list of chats:
- Search filter
- Sorts by latest message
- Shows unread badges
- Mute indicator (🔇)

#### `ConversationItem`
Single chat row:
- Avatar with online dot
- Name + last message preview
- Time of last message
- Unread count (or "99+")
- Group badge (👥) for groups

#### `MessageList`
Message feed with:
- Auto-scroll to bottom
- Date separators between days
- Message grouping (consecutive from same user)
- Highlight target message (from search)
- Right-click context menu

#### `MessageBubble`
Individual message:
- Sender name (if not own, not grouped)
- Message content + file (if any)
- Reply preview (quote)
- Reactions with counts
- Time + read status (for own messages)
- Deleted indicator (🚫)

#### `MessageContextMenu`
Right-click menu options:
- **Reply** — Quote the message
- **Copy** — Copy to clipboard
- **React** — Add emoji reaction
- **Delete** — Soft-delete (for own messages)
- **Forward** — Send to another chat

---

## 🔌 State Management (Zustand)

### `authStore.js`
```javascript
{
  user,              // User object from backend
  accessToken,       // JWT access token
  refreshToken,      // JWT refresh token
  isAuthenticated,   // Boolean
  setAuthData(),     // On login
  updateUser(),      // Update profile
  logout()           // Clear state + localStorage
}
```

### `chatStore.js`
```javascript
{
  // Conversations
  conversations,         // Array of private + group chats
  activeChat,            // Currently open chat { type, id, entity }
  messages,              // Messages in active chat
  
  // Presence
  onlineUsers,           // Set of online user IDs
  typingUsers,           // { chatId: [username1, username2] }
  
  // Message State
  replyingTo,            // Message object being replied to
  targetMessageId,       // ID to highlight/scroll to
  
  // Pending
  pendingInvites,        // Array of group invites
  pendingJoinRequests,   // Array of join requests (for admin)
  
  // Search
  searchResults,         // Message search results
  searchQuery,           // Current search term
  
  // Methods
  fetchConversations(),
  fetchMessages(),
  sendMessage(),
  addReaction(),
  deleteMessage(),
  setActiveChat(),
  setReplyingTo(),
  // ... many more
}
```

### `uiStore.js`
```javascript
{
  // Theme
  theme,              // 'dark' | 'light'
  toggleTheme(),
  
  // Layout
  isSidebarOpen,
  isInfoPanelOpen,
  toggleSidebar(),
  
  // Modals
  activeModal,        // Name of open modal (or null)
  modalData,          // Extra data for modal
  openModal(),
  closeModal(),
  
  // Notifications
  toasts,             // Array of toast notifications
  addToast(),
  removeToast()
}
```

---

## 🔌 Socket.IO Events

The frontend emits and listens to Socket.IO events for real-time communication.

### Events Sent by Frontend

```javascript
// Join chat rooms
socket.emit('joinPrivateChat', { recipientId: '...' });
socket.emit('joinGroupChat', { groupId: '...' });

// Send messages
socket.emit('sendPrivateMessage', { 
  recipientId: '...',
  content: '...',
  fileUrl: '...',  // optional
  replyTo: '...'   // optional message ID
});

socket.emit('sendGroupMessage', {
  groupId: '...',
  content: '...',
  fileUrl: '...',
  replyTo: '...'
});

// Reactions
socket.emit('addReaction', { 
  messageId: '...',
  reaction: '👍' | '❤️' | '😂' | '😮' | '😢' | '🔥'
});

// Typing indicators
socket.emit('typing', { chatType: 'private' | 'group', recipientId?: '...', groupId?: '...' });
socket.emit('stopTyping', { chatType: 'private' | 'group', recipientId?: '...', groupId?: '...' });

// Mark as read
socket.emit('markMessageAsRead', { messageId: '...' });

// Group actions
socket.emit('groupAction', {
  type: 'invite' | 'joinRequest' | 'memberUpdate',
  groupId: '...',
  targetUserId: '...',
  details: { ... }
});
```

### Events Received by Frontend

```javascript
// Confirmation
socket.on('joinedPrivateChat', ({ room, recipientId }) => { ... });
socket.on('joinedGroupChat', ({ groupId }) => { ... });

// Messages
socket.on('newPrivateMessage', (message) => { ... });
socket.on('newGroupMessage', (message) => { ... });
socket.on('messageRead', ({ messageId, readBy }) => { ... });
socket.on('messageDeleted', ({ messageId }) => { ... });
socket.on('chatCleared', (data) => { ... });

// Reactions
socket.on('messageReactionUpdated', ({ messageId, reactions }) => { ... });

// Typing
socket.on('userTyping', ({ userId, username }) => { ... });
socket.on('userStoppedTyping', ({ userId }) => { ... });

// Presence
socket.on('userStatusChanged', ({ userId, isOnline }) => { ... });

// Group notifications
socket.on('newGroupInvite', (invite) => { ... });
socket.on('newJoinRequest', (request) => { ... });
socket.on('groupMemberUpdate', (data) => { ... });

// Errors
socket.on('error', ({ message }) => { ... });
```

---

## 🎨 Theming

The app supports dark and light themes using CSS variables.

### Switching Themes
```javascript
// In any component:
import useUiStore from '../store/uiStore';

const { theme, toggleTheme } = useUiStore();

// Toggle:
<button onClick={toggleTheme}>
  {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
</button>
```

### CSS Variables
```css
/* In styles/theme.css */
:root[data-theme="dark"] {
  --bg-primary: #0d0d0d;
  --bg-secondary: #1a1a1a;
  --bg-elevated: #2a2a2a;
  --text-primary: #e0e0e0;
  --accent: #6c63ff;
  /* ... more vars */
}

:root[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  /* ... more vars */
}
```

Use in components:
```jsx
<div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
  Content
</div>
```

---

## 📦 Building for Production

### Build the app
```bash
npm run build

# Output goes to: dist/
```

### Preview the production build locally
```bash
npm run preview

# Open browser to: http://localhost:4173
```

### Environment for Production
```env
VITE_API_URL=https://api.example.com/api/v1
VITE_SOCKET_URL=https://api.example.com
```

---

## 🧪 Code Quality

### Linting
```bash
# Check for ESLint issues
npm run lint

# ESLint config in: .eslintrc.cjs
# Rules: React best practices, hooks, and React Refresh support
```

### Debugging Tips
1. **React DevTools** — Install browser extension for component inspection
2. **Socket.IO DevTools** — Monitor real-time events in network tab
3. **Zustand DevTools** — Log store changes (add middleware if needed)
4. **Console logs** — Remove before committing (should be minimal in frontend)

---

## 🔐 Security

- **Token Storage** — Access + refresh tokens in localStorage (consider secure httpOnly cookies for production)
- **CORS** — Configured on backend; frontend sends credentials
- **Input Validation** — Client-side validation before API calls
- **XSS Prevention** — React auto-escapes JSX, DOMPurify for user-generated content if needed
- **HTTPS** — Use in production only
- **CSP Headers** — Set on backend; frontend respects them

---


## 📝 Contributing

Pull requests are welcome! Please:
1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## 📄 License

MIT © [Rashid Mamun](https://github.com/rashid-mamun)

---

