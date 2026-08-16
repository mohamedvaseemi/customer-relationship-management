"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
    FiHash, FiSend, FiPlus, FiSmile, 
    FiUsers, FiLock, FiX, FiCheck
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import '@/styles/Chat.css';

export default function TeamChatPage() {
    const [channels, setChannels] = useState([]);
    const [activeChannel, setActiveChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    
    // Create Channel Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDesc, setNewChannelDesc] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 1. Fetch All Channels
    const fetchChannels = useCallback(async () => {
        try {
            const token = Cookies.get('token');
            const res = await fetch('/api/chat/channels', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            const channelList = data.channels || [];
            setChannels(channelList);
            
            if (channelList.length > 0 && !activeChannel) {
                setActiveChannel(channelList[0]);
            }
        } catch (err) {
            console.error('Failed to load channels:', err);
        }
    }, [activeChannel]);

    // 2. Fetch Messages for Active Channel
    const fetchMessages = useCallback(async (channelId) => {
        if (!channelId) return;
        try {
            const token = Cookies.get('token');
            const res = await fetch(`/api/chat/messages?channel_id=${channelId}`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            const data = await res.json();
            setMessages(data.messages || []);
            setTimeout(scrollToBottom, 100);
        } catch (err) {
            console.error('Failed to load messages:', err);
        }
    }, []);

    useEffect(() => {
        fetchChannels();
    }, [fetchChannels]);

    useEffect(() => {
        if (activeChannel?.id) {
            fetchMessages(activeChannel.id);
            // Polling for live incoming messages every 4 seconds
            const interval = setInterval(() => fetchMessages(activeChannel.id), 4000);
            return () => clearInterval(interval);
        }
    }, [activeChannel, fetchMessages]);

    // 3. Send Message
    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || !activeChannel?.id || sending) return;

        setSending(true);
        const optimisticText = newMessage;
        setNewMessage('');

        try {
            const token = Cookies.get('token');
            const res = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ channel_id: activeChannel.id, message: optimisticText })
            });
            const data = await res.json();
            if (data.message) {
                setMessages(prev => [...prev, data.message]);
                setTimeout(scrollToBottom, 50);
            }
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    // 4. Create Channel
    const handleCreateChannel = async (e) => {
        e.preventDefault();
        if (!newChannelName.trim()) return;

        try {
            const token = Cookies.get('token');
            const res = await fetch('/api/chat/channels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: newChannelName, description: newChannelDesc, is_private: isPrivate })
            });
            const data = await res.json();
            if (data.channel) {
                setChannels(prev => [...prev, data.channel]);
                setActiveChannel(data.channel);
                setIsModalOpen(false);
                setNewChannelName('');
                setNewChannelDesc('');
                setIsPrivate(false);
            }
        } catch (err) {
            console.error('Failed to create channel:', err);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className="chat-app-container">
            {/* Left Sidebar: Channels & Teams */}
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <div className="workspace-info">
                        <span className="workspace-name">Team Channels</span>
                        <span className="workspace-status"><span className="online-dot"/> Live Stream</span>
                    </div>
                    <button className="create-channel-btn" onClick={() => setIsModalOpen(true)} title="Create Channel">
                        <FiPlus size={16} />
                    </button>
                </div>

                <div className="channels-section">
                    <span className="channel-group-title">Public Feeds</span>
                    <div className="channel-list">
                        {channels.map(channel => (
                            <button 
                                key={channel.id}
                                className={`channel-item ${activeChannel?.id === channel.id ? 'active' : ''}`}
                                onClick={() => setActiveChannel(channel)}
                            >
                                {channel.is_private ? <FiLock size={14} className="channel-icon" /> : <FiHash size={14} className="channel-icon" />}
                                <span className="channel-name">{channel.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Chat Center Pane */}
            <div className="chat-main-pane">
                {activeChannel ? (
                    <>
                        {/* Chat Header */}
                        <div className="chat-main-header">
                            <div className="chat-header-title">
                                <div className="channel-title-box">
                                    {activeChannel.is_private ? <FiLock size={18} /> : <FiHash size={18} />}
                                    <h2>{activeChannel.name}</h2>
                                </div>
                                <p className="channel-desc">{activeChannel.description || 'Welcome to the channel!'}</p>
                            </div>
                        </div>

                        {/* Messages Stream */}
                        <div className="chat-messages-container">
                            {messages.map((msg, index) => {
                                const isFirstFromSender = index === 0 || messages[index - 1].sender_id !== msg.sender_id;

                                return (
                                    <div key={msg.id || index} className={`chat-message-row ${isFirstFromSender ? 'with-header' : 'compact'}`}>
                                        {isFirstFromSender ? (
                                            <div className="msg-avatar">
                                                {getInitials(msg.sender_name)}
                                            </div>
                                        ) : (
                                            <div className="msg-avatar-placeholder" />
                                        )}

                                        <div className="msg-content-wrapper">
                                            {isFirstFromSender && (
                                                <div className="msg-header">
                                                    <span className="sender-name">{msg.sender_name || 'Team Member'}</span>
                                                    <span className="msg-time">
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="msg-body-text">{msg.message}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Box */}
                        <div className="chat-input-wrapper">
                            <form onSubmit={handleSendMessage} className="chat-input-form">
                                <input 
                                    type="text" 
                                    placeholder={`Message #${activeChannel.name}...`} 
                                    value={newMessage} 
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className="send-msg-btn" disabled={!newMessage.trim() || sending}>
                                    <FiSend size={16} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="empty-chat-state">
                        <FiUsers size={48} />
                        <h3>No Channel Selected</h3>
                        <p>Select a channel on the left to start collaborating.</p>
                    </div>
                )}
            </div>

            {/* Create Channel Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ai-modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="ai-modal-box" onClick={e => e.stopPropagation()}>
                            <div className="ai-modal-header">
                                <h3><FiHash style={{ color: 'var(--primary-color)' }} /> Create New Channel</h3>
                                <button className="ai-modal-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleCreateChannel} className="auth-form">
                                <div className="input-field">
                                    <label>Channel Name *</label>
                                    <input 
                                        type="text" 
                                        className="input-styled" 
                                        required 
                                        placeholder="e.g. deals-q4, announcements" 
                                        value={newChannelName} 
                                        onChange={e => setNewChannelName(e.target.value)} 
                                    />
                                </div>
                                <div className="input-field">
                                    <label>Description (Optional)</label>
                                    <input 
                                        type="text" 
                                        className="input-styled" 
                                        placeholder="What is this channel about?" 
                                        value={newChannelDesc} 
                                        onChange={e => setNewChannelDesc(e.target.value)} 
                                    />
                                </div>
                                <div className="ai-modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={!newChannelName.trim()}>
                                        Create Channel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}