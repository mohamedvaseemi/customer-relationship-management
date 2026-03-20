import { useState, useEffect, useRef } from 'react';
import { FiSend, FiPlus, FiHash, FiUser } from 'react-icons/fi';
import { chatAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

const Chat = () => {
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
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            // Mock data if API fails (common in early setup)
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
            sender_id: user.id,
            sender_name: user.name,
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
                <div className="p-4 border-bottom flex justify-between items-center">
                    <h2 className="font-bold">Channels</h2>
                    <button className="icon-btn-sm"><FiPlus /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {channels.map(channel => (
                        <div
                            key={channel.id}
                            className={`nav-item ${activeChannel?.id === channel.id ? 'active' : ''}`}
                            onClick={() => setActiveChannel(channel)}
                            style={{ cursor: 'pointer', marginBottom: '4px' }}
                        >
                            <FiHash className="nav-icon" />
                            <span className="nav-label">{channel.name}</span>
                        </div>
                    ))}
                </div>
            </aside>

            <main className="chat-main">
                <header className="chat-header">
                    <div className="flex items-center gap-2">
                        <FiHash className="text-primary" />
                        <h2 className="font-semibold">{activeChannel?.name}</h2>
                    </div>
                </header>

                <div className="message-list" ref={scrollRef}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message-item ${msg.sender_id === user.id ? 'message-own' : 'message-other'}`}>
                            {msg.sender_id !== user.id && <div className="text-xs font-bold mb-1">{msg.sender_name}</div>}
                            <div>{msg.content}</div>
                            <div className="text-[10px] mt-1 opacity-70 text-right">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))}
                </div>

                <form className="chat-input-area" onSubmit={handleSend}>
                    <input
                        type="text"
                        className="chat-input"
                        placeholder="Type a message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary px-4">
                        <FiSend />
                    </button>
                </form>
            </main>
        </div>
    );
};

export default Chat;
