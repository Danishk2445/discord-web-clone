import React, { useState, useEffect } from 'react';
import { MessageSquare, Hash, Send, LogOut, Plus, UserPlus, Users, Link as LinkIcon, Check, X, Mail } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface Server {
  id: number;
  name: string;
  ownerId: number;
}

interface Channel {
  id: number;
  name: string;
  serverId: number;
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  senderUsername?: string;
  channelId: number;
  timestamp: string;
}

interface DMMessage {
  id: number;
  content: string;
  senderId: number;
  senderUsername?: string;
  receiverId: number;
  timestamp: string;
}

interface Friendship {
  id: number;
  senderId: number;
  senderUsername: string;
  receiverId: number;
  receiverUsername: string;
  status: string;
}

interface ServerMember {
  id: number;
  username: string;
}

interface SelectedFriend {
  id: number;
  username: string;
}

interface FormData {
  username: string;
  email: string;
  password: string;
}

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('discordUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState<FormData>({ username: '', email: '', password: '' });
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [newServerName, setNewServerName] = useState<string>('');
  const [newChannelName, setNewChannelName] = useState<string>('');
  const [showNewServer, setShowNewServer] = useState<boolean>(false);
  const [showNewChannel, setShowNewChannel] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [showFriendsModal, setShowFriendsModal] = useState<boolean>(false);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [addFriendUsername, setAddFriendUsername] = useState<string>('');
  const [selectedFriend, setSelectedFriend] = useState<SelectedFriend | null>(null);
  const [dmMessages, setDmMessages] = useState<DMMessage[]>([]);
  const [activeView, setActiveView] = useState<'servers' | 'dms'>('servers');
  const [showMembersList, setShowMembersList] = useState<boolean>(true);
  const [serverMembers, setServerMembers] = useState<ServerMember[]>([]);

  useEffect(() => {
    if (user) {
      fetchServers();
      fetchFriends();
      fetchPendingRequests();
      
      const friendInterval = setInterval(() => {
        fetchFriends();
        fetchPendingRequests();
      }, 3000);
      
      return () => clearInterval(friendInterval);
    }
  }, [user]);

  useEffect(() => {
    if (selectedServer) {
      fetchChannels(selectedServer.id);
      fetchServerMembers(selectedServer.id);
      setActiveView('servers');
    }
  }, [selectedServer]);

  useEffect(() => {
    if (selectedChannel && activeView === 'servers') {
      fetchMessages(selectedChannel.id);
      const interval = setInterval(() => fetchMessages(selectedChannel.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChannel, activeView]);

  useEffect(() => {
    if (selectedFriend && activeView === 'dms') {
      fetchDMMessages(selectedFriend.id);
      const interval = setInterval(() => fetchDMMessages(selectedFriend.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedFriend, activeView]);

  const handleAuth = async (): Promise<void> => {
    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
    try {
      const res = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem('discordUser', JSON.stringify(data));
        setFormData({ username: '', email: '', password: '' });
      } else {
        alert(data.message || 'Authentication failed');
      }
    } catch (err) {
      alert('Connection error');
    }
  };

  const fetchServers = async (): Promise<void> => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/servers/user/${user.id}`);
      const data = await res.json();
      setServers(data);
    } catch (err) {
      console.error('Failed to fetch servers');
    }
  };

  const fetchChannels = async (serverId: number): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/channels/server/${serverId}`);
      const data = await res.json();
      setChannels(data);
    } catch (err) {
      console.error('Failed to fetch channels');
    }
  };

  const fetchMessages = async (channelId: number): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/messages/channel/${channelId}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages');
    }
  };

  const fetchFriends = async (): Promise<void> => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/friends/user/${user.id}`);
      const data = await res.json();
      setFriends(data);
    } catch (err) {
      console.error('Failed to fetch friends');
    }
  };

  const fetchPendingRequests = async (): Promise<void> => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/friends/requests/${user.id}`);
      const data = await res.json();
      setPendingRequests(data);
    } catch (err) {
      console.error('Failed to fetch pending requests');
    }
  };

  const fetchServerMembers = async (serverId: number): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/servers/${serverId}/members`);
      const data = await res.json();
      setServerMembers(data);
    } catch (err) {
      console.error('Failed to fetch server members');
    }
  };

  const fetchDMMessages = async (friendId: number): Promise<void> => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/dm/conversation?userId1=${user.id}&userId2=${friendId}`);
      const data = await res.json();
      setDmMessages(data);
    } catch (err) {
      console.error('Failed to fetch DM messages');
    }
  };

  const createServer = async (): Promise<void> => {
    if (!newServerName.trim() || !user) return;
    try {
      const res = await fetch(`${API_BASE}/servers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newServerName, ownerId: user.id })
      });
      if (res.ok) {
        setNewServerName('');
        setShowNewServer(false);
        fetchServers();
      }
    } catch (err) {
      alert('Failed to create server');
    }
  };

  const createChannel = async (): Promise<void> => {
    if (!newChannelName.trim() || !selectedServer) return;
    try {
      const res = await fetch(`${API_BASE}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newChannelName, serverId: selectedServer.id })
      });
      if (res.ok) {
        setNewChannelName('');
        setShowNewChannel(false);
        fetchChannels(selectedServer.id);
      }
    } catch (err) {
      alert('Failed to create channel');
    }
  };

  const createInvite = async (): Promise<void> => {
    if (!selectedServer || !user) return;
    try {
      const res = await fetch(`${API_BASE}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: selectedServer.id, creatorId: user.id, maxUses: 100 })
      });
      const data = await res.json();
      setInviteCode(data.inviteCode);
    } catch (err) {
      alert('Failed to create invite');
    }
  };

  const joinServerByInvite = async (): Promise<void> => {
    if (!joinCode.trim() || !user) return;
    try {
      const res = await fetch(`${API_BASE}/invites/join/${joinCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        setJoinCode('');
        setShowJoinModal(false);
        fetchServers();
        alert('Successfully joined server!');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to join server');
      }
    } catch (err) {
      alert('Failed to join server');
    }
  };

  const sendFriendRequest = async (): Promise<void> => {
    if (!addFriendUsername.trim() || !user) return;
    try {
      const res = await fetch(`${API_BASE}/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: user.id, receiverUsername: addFriendUsername })
      });
      if (res.ok) {
        setAddFriendUsername('');
        alert('Friend request sent!');
        fetchFriends();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to send request');
      }
    } catch (err) {
      alert('Failed to send friend request');
    }
  };

  const acceptFriendRequest = async (friendshipId: number): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/friends/accept/${friendshipId}`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchFriends();
        fetchPendingRequests();
      }
    } catch (err) {
      alert('Failed to accept request');
    }
  };

  const sendMessage = async (): Promise<void> => {
    if (!messageInput.trim() || !selectedChannel || !user) return;
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageInput,
          senderId: user.id,
          channelId: selectedChannel.id
        })
      });
      if (res.ok) {
        setMessageInput('');
        fetchMessages(selectedChannel.id);
      }
    } catch (err) {
      alert('Failed to send message');
    }
  };

  const sendDM = async (): Promise<void> => {
    if (!messageInput.trim() || !selectedFriend || !user) return;
    try {
      const res = await fetch(`${API_BASE}/dm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageInput,
          senderId: user.id,
          receiverId: selectedFriend.id
        })
      });
      if (res.ok) {
        setMessageInput('');
        fetchDMMessages(selectedFriend.id);
      }
    } catch (err) {
      alert('Failed to send DM');
    }
  };

  const openDMWithFriend = (friend: Friendship): void => {
    if (!user) return;
    const friendId = friend.senderId === user.id ? friend.receiverId : friend.senderId;
    const friendUsername = friend.senderId === user.id ? friend.receiverUsername : friend.senderUsername;
    setSelectedFriend({ id: friendId, username: friendUsername });
    setActiveView('dms');
    setSelectedServer(null);
    setSelectedChannel(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-700 rounded-lg p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <MessageSquare className="w-12 h-12 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-6">
            {authMode === 'login' ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-gray-900 text-white rounded px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {authMode === 'register' && (
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-900 text-white rounded px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-gray-900 text-white rounded px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAuth}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded transition"
            >
              {authMode === 'login' ? 'Login' : 'Register'}
            </button>
          </div>
          <button
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            className="w-full mt-4 text-indigo-400 hover:text-indigo-300 text-sm"
          >
            {authMode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-800">
      {/* Server/DM List */}
      <div className="w-20 bg-gray-900 flex flex-col items-center py-3 space-y-2">
        <button
          onClick={() => {
            setActiveView('dms');
            setSelectedServer(null);
            setSelectedChannel(null);
            setSelectedFriend(null);
          }}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
            activeView === 'dms' && !selectedFriend
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-indigo-500 hover:text-white'
          }`}
        >
          <Mail className="w-6 h-6" />
        </button>
        <div className="w-10 h-px bg-gray-700 my-2"></div>
        {servers.map((server) => (
          <button
            key={server.id}
            onClick={() => setSelectedServer(server)}
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition ${
              selectedServer?.id === server.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-indigo-500 hover:text-white'
            }`}
          >
            {server.name.substring(0, 2).toUpperCase()}
          </button>
        ))}
        <button
          onClick={() => setShowNewServer(true)}
          className="w-12 h-12 rounded-full bg-gray-700 hover:bg-green-600 text-gray-300 hover:text-white flex items-center justify-center transition"
        >
          <Plus className="w-6 h-6" />
        </button>
        <button
          onClick={() => setShowJoinModal(true)}
          className="w-12 h-12 rounded-full bg-gray-700 hover:bg-blue-600 text-gray-300 hover:text-white flex items-center justify-center transition"
          title="Join Server"
        >
          <LinkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Channel/Friend List */}
      <div className="w-60 bg-gray-800 flex flex-col">
        <div className="h-12 px-4 flex items-center justify-between border-b border-gray-900">
          <h2 className="text-white font-semibold truncate">
            {activeView === 'dms' ? 'Direct Messages' : selectedServer?.name || 'Select Server'}
          </h2>
          {selectedServer && activeView === 'servers' && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="text-gray-400 hover:text-white"
              title="Create Invite"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {activeView === 'dms' ? (
            <>
              <button
                onClick={() => setShowFriendsModal(true)}
                className="w-full flex items-center px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white mb-2 transition"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Friend
              </button>
              {pendingRequests.length > 0 && (
                <div className="mb-3">
                  <div className="text-gray-400 text-xs font-semibold px-2 mb-1">
                    PENDING REQUESTS ({pendingRequests.length})
                  </div>
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between px-2 py-1 bg-gray-700 rounded mb-1">
                      <span className="text-white text-sm">{req.senderUsername}</span>
                      <button
                        onClick={() => acceptFriendRequest(req.id)}
                        className="text-green-500 hover:text-green-400"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-gray-400 text-xs font-semibold px-2 mb-1">
                FRIENDS ({friends.length})
              </div>
              {friends.map((friend) => {
                const friendUsername = friend.senderId === user.id ? friend.receiverUsername : friend.senderUsername;
                const friendId = friend.senderId === user.id ? friend.receiverId : friend.senderId;
                return (
                  <button
                    key={friend.id}
                    onClick={() => openDMWithFriend(friend)}
                    className={`w-full flex items-center px-2 py-2 rounded text-left transition ${
                      selectedFriend?.id === friendId
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold mr-2">
                      {friendUsername.substring(0, 2).toUpperCase()}
                    </div>
                    {friendUsername}
                  </button>
                );
              })}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between px-2 mb-1">
                <div className="flex items-center text-gray-400 text-xs font-semibold">
                  <Hash className="w-4 h-4 mr-1" />
                  TEXT CHANNELS
                </div>
                {selectedServer && (
                  <button
                    onClick={() => setShowNewChannel(true)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full flex items-center px-2 py-1 rounded text-left transition ${
                    selectedChannel?.id === channel.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Hash className="w-4 h-4 mr-2" />
                  {channel.name}
                </button>
              ))}
            </>
          )}
        </div>
        <div className="h-14 bg-gray-900 px-2 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <span className="ml-2 text-white text-sm font-semibold">{user.username}</span>
          </div>
          <button
            onClick={() => {
              setUser(null);
              localStorage.removeItem('discordUser');
            }}
            className="text-gray-400 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="h-12 px-4 flex items-center justify-between border-b border-gray-900">
          <div className="flex items-center">
            {activeView === 'dms' ? (
              selectedFriend ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold mr-2">
                    {selectedFriend.username.substring(0, 2).toUpperCase()}
                  </div>
                  <h3 className="text-white font-semibold">{selectedFriend.username}</h3>
                </>
              ) : (
                <h3 className="text-white font-semibold">Select a friend to message</h3>
              )
            ) : (
              <>
                <Hash className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-white font-semibold">
                  {selectedChannel?.name || 'Select a channel'}
                </h3>
              </>
            )}
          </div>
          {selectedServer && activeView === 'servers' && (
            <button
              onClick={() => setShowMembersList(!showMembersList)}
              className="text-gray-400 hover:text-white flex items-center"
              title="Members"
            >
              <Users className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeView === 'dms' ? (
            dmMessages.map((msg) => (
              <div key={msg.id} className="flex">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {msg.senderUsername?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="ml-3">
                  <div className="flex items-baseline">
                    <span className="text-white font-semibold">{msg.senderUsername || 'User'}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{msg.content}</p>
                </div>
              </div>
            ))
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {msg.senderUsername?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="ml-3">
                  <div className="flex items-baseline">
                    <span className="text-white font-semibold">{msg.senderUsername || 'User'}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{msg.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
        {(selectedChannel || selectedFriend) && (
          <div className="p-4">
            <div className="flex items-center bg-gray-700 rounded px-4 py-2">
              <input
                type="text"
                placeholder={activeView === 'dms' ? `Message @${selectedFriend?.username}` : `Message #${selectedChannel?.name}`}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (activeView === 'dms' ? sendDM() : sendMessage())}
                className="flex-1 bg-transparent text-white outline-none"
              />
              <button onClick={activeView === 'dms' ? sendDM : sendMessage} className="text-gray-400 hover:text-white ml-2">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Members Sidebar */}
      {showMembersList && selectedServer && activeView === 'servers' && (
        <div className="w-60 bg-gray-800 border-l border-gray-900 flex flex-col">
          <div className="h-12 px-4 flex items-center border-b border-gray-900">
            <h3 className="text-white font-semibold">Members — {serverMembers.length}</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {serverMembers.map((member) => (
              <div key={member.id} className="flex items-center px-2 py-2 rounded hover:bg-gray-700 transition">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold mr-3">
                  {member.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{member.username}</div>
                  {member.id === selectedServer.ownerId && (
                    <div className="text-xs text-yellow-500">Owner</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showNewServer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 rounded-lg p-6 w-96">
            <h3 className="text-white font-bold text-lg mb-4">Create Server</h3>
            <input
              type="text"
              placeholder="Server name"
              value={newServerName}
              onChange={(e) => setNewServerName(e.target.value)}
              className="w-full bg-gray-900 text-white rounded px-4 py-2 mb-4 outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={createServer}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewServer(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 rounded-lg p-6 w-96">
            <h3 className="text-white font-bold text-lg mb-4">Create Channel</h3>
            <input
              type="text"
              placeholder="Channel name"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              className="w-full bg-gray-900 text-white rounded px-4 py-2 mb-4 outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={createChannel}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewChannel(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 rounded-lg p-6 w-96">
            <h3 className="text-white font-bold text-lg mb-4">Invite People</h3>
            {!inviteCode ? (
              <button
                onClick={createInvite}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded mb-4"
              >
                Generate Invite Link
              </button>
            ) : (
              <div className="mb-4">
                <input
                  type="text"
                  value={inviteCode}
                  readOnly
                  className="w-full bg-gray-900 text-white rounded px-4 py-2 mb-2"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inviteCode);
                    alert('Invite code copied!');
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                >
                  Copy Invite Code
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setShowInviteModal(false);
                setInviteCode('');
              }}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 rounded-lg p-6 w-96">
            <h3 className="text-white font-bold text-lg mb-4">Join Server</h3>
            <input
              type="text"
              placeholder="Enter invite code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="w-full bg-gray-900 text-white rounded px-4 py-2 mb-4 outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={joinServerByInvite}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded"
              >
                Join
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showFriendsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 rounded-lg p-6 w-96">
            <h3 className="text-white font-bold text-lg mb-4">Add Friend</h3>
            <input
              type="text"
              placeholder="Enter username"
              value={addFriendUsername}
              onChange={(e) => setAddFriendUsername(e.target.value)}
              className="w-full bg-gray-900 text-white rounded px-4 py-2 mb-4 outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={sendFriendRequest}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded"
              >
                Send Request
              </button>
              <button
                onClick={() => {
                  setShowFriendsModal(false);
                  setAddFriendUsername('');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App