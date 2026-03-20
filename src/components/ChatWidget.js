'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiZap, FiMenu } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './ChatWidget.css';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Welcome to ModernCRM Intellect. I'm ModernBot—your high-performance business analyst. How can I optimize your sales strategy today?", sender: 'bot', timestamp: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        // Intelligence Engine Simulation
        setTimeout(() => {
            const botResponse = generateBotResponse(inputValue);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: botResponse,
                sender: 'bot',
                timestamp: new Date()
            }]);
        }, 800);
    };

    const generateBotResponse = (input) => {
        const text = input.toLowerCase();
        if (text.includes('hello') || text.includes('hi')) return "Greetings focused on growth! I'm scanning ModernCRM data to find your next major deal. What do you need?";
        if (text.includes('lead') || text.includes('contact')) return "Found 47 high-priority leads in the pipeline. I recommend contacting IBM and Oracle leads immediately due to high engagement scores.";
        if (text.includes('deal') || text.includes('revenue')) return "Your quarterly revenue is projected to exceed targets by 12%. Shall I generate a forecast report for the executive team?";
        if (text.includes('status')) return "All ModernCRM intelligence systems are operational. Data synchronization is at 100% precision.";
        return "Insightful query. I'm analyzing that within the ModernCRM ecosystem. Would you like me to cross-reference that with your current KPIs?";
    };

    return (
        <div className="chatbot-widget">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chatbot-window card shadow-premium"
                        initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <div className="chat-header gradient-primary">
                            <div className="chat-header-info">
                                <div className="chat-status-dot"></div>
                                <span>ModernBot Intellect</span>
                            </div>
                            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
                                <FiX size={18} />
                            </button>
                        </div>

                        <div className="chat-messages">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={msg.id}
                                    className={`chat-bubble ${msg.sender}`}
                                    initial={{ opacity: 0, x: msg.sender === 'bot' ? -20 : 20, y: 10 }}
                                    animate={{ opacity: 1, x: 0, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    {msg.text}
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input-bar">
                            <input
                                type="text"
                                className="chat-input"
                                placeholder="Query ModernCRM Intelligence..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button className="chat-send-btn shadow-glow" onClick={handleSend}>
                                <FiSend size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="chatbot-button shadow-glow"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
            >
                {isOpen ? <FiX size={26} /> : <FiZap size={26} />}
            </motion.div>
        </div>
    );
};

export default ChatWidget;
