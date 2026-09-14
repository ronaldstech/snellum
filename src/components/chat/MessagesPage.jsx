import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Flame } from 'lucide-react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import '../../styles/chat.css';

/**
 * MessagesPage — responsive two-pane messaging hub.
 *
 *  - Desktop (≥900px): chat list rail (left) + active conversation (right)
 *    side by side, matching the Flutter split-pane chat UI. An empty state
 *    shows when nothing is selected.
 *  - Tablet / Mobile (<900px): single pane — the list first, then the
 *    full-width ChatWindow (with a back arrow) once a chat is tapped.
 *
 * Deep-linking: the parent hands us `pendingChat` the moment Messages is
 * opened. It only ever fires on mount (changing tab to Likes unmounts this
 * page, so a re-tap produces a fresh mount with a fresh deep-link). We open
 * it straight away and tell the parent we've taken ownership so its copy can
 * be cleared for the next mount.
 */
export default function MessagesPage({
  currentUserId,
  onNavigateToDiscover,
  onStartMatch,
  pendingChat,
  onConsumePendingChat,
  onUpgrade,
}) {
  const [selectedChat, setSelectedChat] = useState(pendingChat || null);

  // Handshake: the parent clears its deep-link now that we own the selected
  // chat, so re-entering Messages later won't re-open a stale conversation.
  useEffect(() => {
    if (pendingChat) onConsumePendingChat?.(pendingChat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingChat]);

  const handleCloseChat = useCallback(() => setSelectedChat(null), []);

  return (
    <div className={`messages-page-layout ${selectedChat ? 'has-chat' : ''}`}>
      <ChatList
        currentUserId={currentUserId}
        onSelectChat={setSelectedChat}
        onNavigateToDiscover={onNavigateToDiscover}
        onStartMatch={onStartMatch}
      />

      <div className="messages-pane">
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            currentUser={{ uid: currentUserId }}
            onBack={handleCloseChat}
            onUpgrade={onUpgrade}
          />
        ) : (
          <div className="chat-empty-pane animate-fade-in">
            <div className="chat-empty-pane-icon">
              <MessageCircle size={36} />
            </div>
            <h3>Select a conversation</h3>
            <p>
              Pick a chat from the list on the left, or find a brand-new match
              to start messaging.
            </p>
            <button type="button" className="btn-primary" onClick={onNavigateToDiscover}>
              <Flame size={16} /> Discover Matches
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
