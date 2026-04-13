import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ChatRoom = () => {
  const { userId: otherUserId } = useParams();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [title, setTitle] = useState('Chat');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [isAnonymousContext, setIsAnonymousContext] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !otherUserId) return;

    // Initialize socket dynamically 
    socketRef.current = io('http://localhost:5000');

    // Join room
    socketRef.current.emit('join', user._id);

    // Fetch Room Data
    const fetchRoomData = async () => {
      try {

        const res = await axios.get(`/chat/start/${otherUserId}?productId=${productId || ''}`);

        setMessages(res.data.messages || []);
        setOtherUser(res.data.otherUser);
        setTitle(res.data.title || 'Chat');
        setIsAnonymousContext(res.data.isAnonymousContext); // Ensure backend sends this
      } catch (err) {
        console.error("Error fetching chat room", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();

    const messageHandler = (msg) => {

      if ((msg.sender === otherUserId || msg.sender === user._id) && (
      !msg.productId || msg.productId === productId)) {
        // We need to format it like a Message object
        setMessages((prev) => [...prev, {
          _id: Date.now().toString(),
          sender: msg.sender === user._id ? { _id: user._id, name: user.name } : { _id: otherUserId, name: 'Remote' },
          content: msg.content,
          timestamp: new Date().toISOString()
        }]);
      }
    };

    socketRef.current.on('message', messageHandler);

    return () => {
      socketRef.current.off('message', messageHandler);
      socketRef.current.disconnect();
    };
  }, [user, otherUserId, productId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !otherUserId || !socketRef.current) return;

    socketRef.current.emit('chatMessage', {
      sender: user._id,
      receiver: otherUserId,
      content: newMessage,
      productId: productId
    });


    setNewMessage('');
  };

  if (loading) return <div className="text-center text-text-secondary py-20 font-mono">ESTABLISHING SECURE CONNECTION...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl h-[85vh] flex flex-col">
            {/* Terminal Window Frame */}
            <div className="bg-surface border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col flex-grow relative">

                {/* Room Header */}
                <div className="bg-black/50 border-b border-border p-3 flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <Link to="/chat" className="text-text-secondary hover:text-white transition">
                            <i className="fas fa-chevron-left"></i>
                        </Link>

                        {!otherUser ?
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                                {title}
                            </h3> :

            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-black border border-border overflow-hidden relative">
                                    {isAnonymousContext ?
                <div className="w-full h-full flex items-center justify-center bg-bg text-text-secondary">
                                            <i className="fas fa-user-secret"></i>
                                        </div> :

                <img
                  src={otherUser.avatar || `https://ui-avatars.com/api/?name=${otherUser.name}&background=0b0e11&color=fff`}
                  className="w-full h-full object-cover" />

                }
                                    {/* Online Status Dot */}
                                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-bull rounded-full border border-black transform translate-x-1/3 translate-y-1/3"></div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white font-mono leading-none">
                                        {title.toUpperCase()}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[8px] text-bull font-mono border border-bull/20 px-1 rounded bg-bull/5">SECURE_LINK_ESTABLISHED</span>
                                        <span className="text-[8px] text-text-secondary font-mono">ID: {otherUser._id.toString().substring(0, 6)}</span>
                                    </div>
                                </div>
                            </div>
            }
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] text-text-secondary font-mono">ENCRYPTION: AES-256</span>
                            <span className="text-[8px] text-text-secondary font-mono">SIGNAL: <span className="text-bull">STRONG</span></span>
                        </div>
                    </div>
                </div>

                {/* Chat Messages Area */}
                <div className="chat-messages flex-grow overflow-y-auto p-4 space-y-4 bg-bg relative">
                    {/* Background Grid */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#2d3748 1px, transparent 1px), linear-gradient(90deg, #2d3748 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}>
                    </div>

                    {messages.map((msg, index) => {
            const isMe = msg.sender._id?.toString() === user?._id?.toString() || msg.sender.toString() === user?._id?.toString();
            return (
              <div key={index} className={`relative z-10 flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className="max-w-[70%]">
                                    {/* Sender Label */}
                                    <div className={`text-[8px] font-mono mb-1 ${isMe ? 'text-right text-action' : 'text-left text-bear'}`}>
                                        {isMe ? 'YOU' : 'REMOTE_NODE'}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`px-3 py-2 rounded text-xs font-mono leading-relaxed border ${isMe ?
                  'bg-action/10 text-white border-action/30 rounded-tr-none' :
                  'bg-surface text-text-secondary border-border rounded-tl-none'}`}>
                                        {msg.content}
                                    </div>

                                    {/* Timestamp */}
                                    <div className={`text-[8px] text-text-secondary/50 mt-1 font-mono ${isMe ? 'text-right' : 'text-left'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>);

          })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Area */}
                <div className="bg-surface border-t border-border p-3 z-10">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <div className="flex-grow relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-action font-mono text-xs">{">"}</span>
                            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full bg-bg border border-border rounded py-2 pl-6 pr-3 text-sm text-white focus:border-action focus:ring-1 focus:ring-action outline-none font-mono placeholder-text-secondary/30 transition shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]"
                placeholder="TRANSMIT MESSAGE..."
                required
                autoComplete="off" />
              
                        </div>
                        <button type="submit"
            className="bg-action hover:bg-blue-600 text-white p-2 rounded border border-action/50 transition shadow-[0_0_10px_rgba(41,98,255,0.2)]">
                            <i className="fas fa-paper-plane text-xs"></i>
                        </button>
                    </form>
                </div>

                {/* Scanline Overlay */}
                <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
            </div>
        </div>);

};

export default ChatRoom;