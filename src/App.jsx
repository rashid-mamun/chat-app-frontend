import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import socketService from './api/socket.service';
import useChatStore from './store/chatStore';
import { ToastContainer } from './components/shared/Toast';

const AuthPage = lazy(() => import('./pages/AuthPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
};

function App() {
  const { isAuthenticated, accessToken } = useAuthStore();
  const { 
    handleIncomingMessage, 
    handleReactionUpdate,
    handleMessageDeleted,
    setTyping, 
    removeTyping, 
    setOnlineStatus, 
    activeChat, 
    fetchConversations, 
    fetchMessages,
    handleChatCleared,
    handleNewGroupInvite,
    handleNewJoinRequest,
    handleGroupMemberUpdate,
    fetchPendingInvites,
    fetchPendingRequests
  } = useChatStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchConversations();
      fetchPendingInvites();
      fetchPendingRequests();
      
      // If we have an active chat restored from persist, fetch its messages
      if (activeChat) {
        fetchMessages(activeChat.type, activeChat.id);
        
        // Also re-join socket rooms
        if (activeChat.type === 'private') {
          socketService.emit('joinPrivateChat', { recipientId: activeChat.id });
        } else {
          socketService.emit('joinGroupChat', { groupId: activeChat.id });
        }
      }
    }
  }, [isAuthenticated, accessToken, fetchConversations, activeChat?.id]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const socket = socketService.connect();
      
      if (socket) {
        const joinCurrentChat = () => {
          if (activeChat) {
            if (activeChat.type === 'private') {
              socket.emit('joinPrivateChat', { recipientId: activeChat.id });
            } else {
              socket.emit('joinGroupChat', { groupId: activeChat.id });
            }
          }
        };

        socket.on('connect', () => {
          joinCurrentChat();
        });

        // Join immediately if already connected
        if (socket.connected) joinCurrentChat();

        const onNewPrivateMessage = (message) => {
          handleIncomingMessage(message);
        };
        const onNewGroupMessage = (message) => {
          handleIncomingMessage(message);
        };
        const onReactionUpdate = (data) => handleReactionUpdate(data);
        const onUserTyping = ({ userId, username }) => {
          if (activeChat) setTyping(activeChat.id, username);
        };
        const onUserStoppedTyping = ({ userId }) => {
          if (activeChat) removeTyping(activeChat.id, userId);
        };
        const onUserStatusChanged = ({ userId, isOnline }) => setOnlineStatus(userId, isOnline);
        const onMessageDeleted = ({ messageId }) => handleMessageDeleted(messageId);
        const onChatCleared = (data) => handleChatCleared(data);

        socket.on('newPrivateMessage', onNewPrivateMessage);
        socket.on('newGroupMessage', onNewGroupMessage);
        socket.on('messageReactionUpdated', onReactionUpdate);
        socket.on('messageDeleted', onMessageDeleted);
        socket.on('chatCleared', onChatCleared);
        socket.on('userTyping', onUserTyping);
        socket.on('userStoppedTyping', onUserStoppedTyping);
        socket.on('userStatusChanged', onUserStatusChanged);
        socket.on('newGroupInvite', handleNewGroupInvite);
        socket.on('newJoinRequest', handleNewJoinRequest);
        socket.on('groupMemberUpdate', handleGroupMemberUpdate);

        return () => {
          socket.off('newPrivateMessage', onNewPrivateMessage);
          socket.off('newGroupMessage', onNewGroupMessage);
          socket.off('messageReactionUpdated', onReactionUpdate);
          socket.off('messageDeleted', onMessageDeleted);
          socket.off('chatCleared', onChatCleared);
          socket.off('userTyping', onUserTyping);
          socket.off('userStoppedTyping', onUserStoppedTyping);
          socket.off('userStatusChanged', onUserStatusChanged);
          socket.off('newGroupInvite', handleNewGroupInvite);
          socket.off('newJoinRequest', handleNewJoinRequest);
          socket.off('groupMemberUpdate', handleGroupMemberUpdate);
        };
      }
    }
  }, [isAuthenticated, accessToken, activeChat, handleIncomingMessage, handleMessageDeleted, handleChatCleared, setTyping, removeTyping, setOnlineStatus]);

  return (
    <>
      <Router>
        <Suspense fallback={
          <div className="h-screen w-full flex items-center justify-center surface-primary">
            <div className="skeleton h-12 w-48 rounded-xl" />
          </div>
        }>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Protected Main Route */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
      
      {/* Global Toast Container */}
      <ToastContainer />
    </>
  );
}

export default App;
