'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    FiSend, FiPaperclip, FiMoreVertical, FiSearch,
    FiUser, FiMessageCircle, FiSmile, FiCheck, FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './chat.css';

export default function ChatPage() {
    const { user, token, loading: authLoading } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef(null);

    const loadRooms = useCallback(async () => {
        if (!token) return;
        try {
            setLoadingRooms(true);
            const response = await fetch('/api/chat', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setRooms(data.rooms || []);
                if (data.rooms?.length > 0 && !activeRoom) {
                    setActiveRoom(data.rooms[0]);
                }
            }
        } catch (error) {
            console.error('Failed to load chat rooms:', error);
        } finally {
            setLoadingRooms(false);
        }
    }, [token, activeRoom]);

    const loadMessages = useCallback(async (roomId) => {
        if (!token || !roomId) return;
        try {
            setLoadingMessages(true);
            const response = await fetch(`/api/chat?room_id=${roomId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    }, [token]);

    useEffect(() => {
        if (!authLoading && token) {
            loadRooms();
        }
    }, [authLoading, token, loadRooms]);

    useEffect(() => {
        if (activeRoom) {
            loadMessages(activeRoom.id);
        }
    }, [activeRoom, loadMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeRoom) return;

        const content = newMessage;
        setNewMessage('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ room_id: activeRoom.id, content })
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, data.message]);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    if (authLoading) return <div className="loading-container"><div className="loader"></div></div>;

    return (
        <div className="chat-container">
            {/* Rooms Sidebar */}
            <div className="rooms-sidebar">
                <div className="chat-header">
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Intelligent Comms</h2>
                    <FiSearch className="text-muted" style={{ cursor: 'pointer' }} />
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loadingRooms ? (
                        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>Syncing participants...</div>
                    ) : (
                        rooms.map(room => (
                            <div 
                                key={room.id} 
                                className={`room-item ${activeRoom?.id === room.id ? 'active' : ''}`}
                                onClick={() => setActiveRoom(room)}
                            >
                                <div className="room-avatar">
                                    {room.participant_name.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="font-bold text-sm">{room.participant_name}</div>
                                    <div className="text-xs opacity-50 truncated">Last updated operational status...</div>
                                </div>
                                <div className="text-xs opacity-50">12:45 PM</div>
                            </div>
                        ))
                    )}
                    {rooms.length === 0 && !loadingRooms && (
                        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No active comms channels.</div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="chat-main">
                {activeRoom ? (
                    <>
                        <div className="chat-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div className="room-avatar" style={{ width: '38px', height: '38px' }}>
                                    {activeRoom.participant_name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{activeRoom.participant_name}</div>
                                    <div className="text-xs text-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                                        Active Channel
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <FiMoreVertical className="text-muted" style={{ cursor: 'pointer' }} />
                            </div>
                        </div>

                        <div className="messages-list" ref={scrollRef}>
                            {loadingMessages ? (
                                <div style={{ textAlign: 'center', opacity: 0.5 }}>Decoding communication logs...</div>
                            ) : (
                                messages.map(msg => (
                                    <div 
                                        key={msg.id} 
                                        className={`message-bubble ${msg.sender_id === user.id ? 'message-mine' : 'message-theirs'}`}
                                    >
                                        <div>{msg.content}</div>
                                        <span className="message-time">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                            {messages.length === 0 && !loadingMessages && (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, flexDirection: 'column' }}>
                                    <FiMessageCircle size={48} style={{ marginBottom: '1rem' }} />
                                    <p>Establish a strategic communication line.</p>
                                </div>
                            )}
                        </div>

                        <div className="chat-input-area">
                            <form onSubmit={handleSendMessage} className="chat-input-wrapper">
                                <button type="button" className="btn-icon" style={{ padding: '0.4rem' }}><FiPaperclip /></button>
                                <input 
                                    type="text" 
                                    className="chat-input"
                                    placeholder="Execute communication..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="button" className="btn-icon" style={{ padding: '0.4rem' }}><FiSmile /></button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0 1.2rem', height: 'auto', borderRadius: '10px' }}>
                                    <FiSend style={{ marginRight: '8px' }} /> Transmit
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, flexDirection: 'column' }}>
                        <FiMessageCircle size={64} style={{ marginBottom: '1rem' }} />
                        <h3>Select Strategic Channel</h3>
                        <p>Initiate secure communication with your operational team.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
