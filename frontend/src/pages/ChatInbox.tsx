import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Conversation {
    userId: string;
    name: string;
    avatar: string;
    studentId?: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    productId: string;
    productTitle: string;
    productImage?: string;
    isAnonymous: boolean;
    lastSenderId: string;
}

const ChatInbox = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                // Determine API endpoint. In previous steps we didn't explicitly create a JSON endpoint for inbox
                // We refactored `chatController.getInbox`?
                // Step 248: refactored `getInbox` to return JSON.
                const res = await axios.get('/chat');
                setConversations(res.data.conversations || []);
            } catch (err) {
                console.error("Error fetching conversations", err);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    const handleDelete = async (e: React.MouseEvent, conversation: Conversation) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('ERASE COMM LOG? This cannot be undone.')) return;

        try {
            await axios.post(`/chat/delete/${conversation.userId}?productId=${conversation.productId}`);
            setConversations(conversations.filter(c => c.userId !== conversation.userId || c.productId !== conversation.productId));
        } catch (err) {
            console.error("Error deleting conversation", err);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="bg-surface border border-border rounded-lg shadow-2xl overflow-hidden h-[80vh] flex flex-col">
                {/* Comms Header */}
                <div className="bg-bg border-b border-border p-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
                            <i className="fas fa-satellite-dish text-action animate-pulse"></i>
                            SECURE COMMS
                        </h2>
                        <p className="text-[10px] text-text-secondary font-mono tracking-wider">ENCRYPTED P2P MESSAGING RELAY</p>
                    </div>
                    <div className="text-xs text-text-secondary font-mono">
                        NET STATUS: <span className="text-bull">ONLINE</span>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-2">
                    {loading ? (
                        <div className="text-center text-text-secondary py-10 font-mono">ESTABLISHING UPLINK...</div>
                    ) : conversations.length > 0 ? (
                        conversations.map((convo, index) => (
                            <Link
                                key={index}
                                to={`/chat/${convo.userId}?productId=${convo.productId}`}
                                className="block bg-bg border border-border hover:border-action transition p-3 rounded group relative overflow-hidden"
                            >
                                {convo.unreadCount > 0 && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-action animate-pulse"></div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-black rounded border border-border overflow-hidden">
                                                {convo.isAnonymous ? (
                                                    <div className="w-full h-full flex items-center justify-center bg-surface text-text-secondary">
                                                        <i className="fas fa-user-secret text-xl"></i>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={convo.avatar || `https://ui-avatars.com/api/?name=${convo.name}&background=0b0e11&color=fff`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${convo.name}&background=0b0e11&color=fff`;
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            {convo.unreadCount > 0 && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-action rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-bg">
                                                    {convo.unreadCount}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-white font-mono group-hover:text-action transition">
                                                    {convo.name}
                                                </span>
                                                {convo.studentId && (
                                                    <span className="text-[10px] text-text-secondary border border-border px-1 rounded font-mono">
                                                        {convo.studentId}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-text-secondary font-mono ml-2">
                                                    {convo.timestamp ? new Date(convo.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-text-secondary">
                                                {convo.productImage ? (
                                                    <img src={convo.productImage} className="w-4 h-4 rounded object-cover border border-border" />
                                                ) : (
                                                    <i className="fas fa-box text-[10px]"></i>
                                                )}
                                                <span className="font-mono text-[10px] uppercase tracking-wide text-text-secondary/70">
                                                    REF: {convo.productTitle || 'GENERAL'}
                                                </span>
                                            </div>

                                            <p className="text-sm text-text-secondary mt-1 line-clamp-1 font-mono group-hover:text-white transition group-hover:translate-x-1 duration-200">
                                                {convo.lastSenderId && user && convo.lastSenderId.toString() === user._id?.toString() && (
                                                    <span className="text-action select-none">{">> "}</span>
                                                )}
                                                {convo.lastMessage}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <button
                                            onClick={(e) => handleDelete(e, convo)}
                                            className="text-text-secondary hover:text-bear transition text-xs opacity-0 group-hover:opacity-100 p-2"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                        <i className="fas fa-chevron-right text-border group-hover:text-action transition"></i>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary opacity-50">
                            <i className="fas fa-comment-slash text-4xl mb-4"></i>
                            <p className="font-mono text-sm">NO ACTIVE TRANSMISSIONS</p>
                            <p className="text-xs">INITIATE TRAFFIC FROM ASSET TERMINALS</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatInbox;
