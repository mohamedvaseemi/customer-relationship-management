"use client";
import { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiZap } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '@/styles/ChatWidget.css';

const BOT_RESPONSES = (msg) => {
    const m = msg.toLowerCase();
    if (m.includes('price') || m.includes('cost') || m.includes('plan'))
        return "NexCRM starts at $12/user/month. Would you like a demo?";
    if (m.includes('ticket') || m.includes('support') || m.includes('issue'))
        return "You can create a support ticket from the Service Desk section. Want me to take you there?";
    if (m.includes('lead') || m.includes('deal') || m.includes('pipeline'))
        return "You can manage all leads in the Sales Pipeline. Use the Kanban board to track progress!";
    if (m.includes('hello') || m.includes('hi') || m.includes('hey'))
        return "Hey! 👋 I'm NexBot — here to help you get the most out of NexCRM. What do you need?";
    return "Great question! Our support team will follow up shortly. In the meantime, explore the Help Center.";
};

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hey there! 👋 How can NexCRM help you today?' }
    ]);
    const [input, setInput] = useState('');
    const listRef = useRef();

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        setMessages(prev => [...prev, { sender: 'user', text: trimmed }]);
        setInput('');

        setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'bot', text: BOT_RESPONSES(trimmed) }]);
        }, 750);
    };

    const handleKey = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="chatbot-widget">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 16 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                        className="chatbot-window"
                    >
                        {/* Header */}
                        <div className="chat-header">
                            <div className="chat-header-info">
                                <FiZap size={18} />
                                <span>NexBot Assistant</span>
                                <div className="chat-status-dot" title="Online" />
                            </div>
                            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
                                <FiX size={16} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="chat-messages" ref={listRef}>
                            {messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`chat-bubble ${m.sender}`}
                                >
                                    {m.text}
                                </motion.div>
                            ))}
                        </div>

                        {/* Input Bar */}
                        <div className="chat-input-bar">
                            <input
                                type="text"
                                className="chat-input"
                                placeholder="Type a message..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={handleKey}
                            />
                            <button className="chat-send-btn" onClick={handleSend}>
                                <FiSend size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Trigger Button */}
            <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                className="chatbot-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                <AnimatePresence mode="wait">
                    {isOpen
                        ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><FiX size={22} /></motion.span>
                        : <motion.span key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><FiMessageSquare size={22} /></motion.span>
                    }
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ChatWidget;
