"use client";
import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiPlus, FiHash } from 'react-icons/fi';
import { chatAPI } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import '@/styles/Chat.css';

export default function Chat() {
    const { user } = useAuth();
    const [channels, setChannels] = useState([
        { id: 1, name: 'General', type: 'team' },
        { id: 2, name: 'Sales-Team', type: 'team' },
        { id: 3, name: 'Customer-Success', type: 'team' }
    ]);
    const [activeChannel, setActiveChannel] = useState(channels[0]);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef();

    useEffect(() => {
        if (activeChannel) {
            fetchMessages(activeChannel.id);
        }
    }, [activeChannel]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async (channelId) => {
        try {
            const response = await chatAPI.getMessages(channelId);
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([
                { id: 1, sender_id: 0, sender_name: 'Bot', content: `Welcome to the ${activeChannel.name} channel!`, created_at: new Date() }
            ]);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newMessage = {
            channel_id: activeChannel.id,
            content: inputText,
            sender_id: user?.id || 999,
            sender_name: user?.name || 'Me',
            created_at: new Date()
        };

        setMessages([...messages, newMessage]);
        setInputText('');

        try {
            await chatAPI.sendMessage({
                channel_id: activeChannel.id,
                content: inputText
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="chat-page-container">
            <aside className="chat-sidebar">
                <div className="p-4 border-bottom flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Channels</h2>
                    <button className="action-btn" style={{ padding: '6px' }}><FiPlus /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2" style={{ padding: '8px' }}>
                    {channels.map(channel => (
                        <div
                            key={channel.id}
                            className={`nav-item ${activeChannel?.id === channel.id ? 'active' : ''}`}
                            onClick={() => setActiveChannel(channel)}
                            style={{ cursor: 'pointer', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px' }}
                        >
                            <FiHash className="nav-icon" />
                            <span className="nav-label">{channel.name}</span>
                        </div>
                    ))}
                </div>
            </aside>

            <main className="chat-main" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <header className="chat-header" style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiHash className="text-primary" style={{ color: 'var(--primary-color)' }} />
                    <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{activeChannel?.name}</h2>
                </header>

                <div className="message-list" ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message-item ${msg.sender_id === (user?.id || 999) ? 'message-own' : 'message-other'}`} style={{ marginBottom: '12px' }}>
                            {msg.sender_id !== (user?.id || 999) && <div className="text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{msg.sender_name}</div>}
                            <div style={{ wordBreak: 'break-word' }}>{msg.content}</div>
                            <div className="text-[10px] mt-1 opacity-70 text-right" style={{ fontSize: '10px', opacity: 0.7, textAlign: 'right', marginTop: '4px' }}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))}
                </div>

                <form className="chat-input-area" onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
                    <input
                        type="text"
                        className="chat-input"
                        placeholder="Type a message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    />
                    <button type="submit" className="btn btn-primary px-4" style={{ padding: '0 16px' }}>
                        <FiSend />
                    </button>
                </form>
            </main>
        </div>
    );
}
