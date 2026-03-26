import { useState } from 'react';
import { Send, Bot, ArrowRightLeft, History } from 'lucide-react';

const initialMessages = [
    {
        type: 'ai',
        text: "Hello Dr. Chen, I've analyzed the scan for Patient #8842. Based on the spatial features, I've identified a suspected meningioma in the right frontal lobe. How can I help you today?",
    },
    {
        type: 'user',
        text: 'What is the exact volume measurement for the lesion?',
    },
    {
        type: 'ai',
        text: 'The estimated volume of the primary lesion is 14.22 cm³. It appears well-circumscribed and is putting slight pressure on the adjacent sulci.',
    },
];

export default function ChatPanel() {
    const [messages] = useState(initialMessages);
    const [input, setInput] = useState('');

    return (
        <div className="chat-panel">
            <div className="chat-messages">
                {messages.map((msg, i) => (
                    <div key={i} className={`chat-msg ${msg.type}`}>
                        {msg.type === 'ai' && (
                            <div className="msg-avatar">
                                <Bot size={16} color="var(--color-primary)" />
                            </div>
                        )}
                        <div className="msg-bubble">{msg.text}</div>
                    </div>
                ))}
            </div>

            <div className="chat-status-bar">
                <div className="status-icon">
                    <Bot size={18} color="#fff" />
                </div>
                <div className="status-text">
                    <span className="status-name">Clinical AI Assistant</span>
                    <span className="status-online">ALWAYS ONLINE</span>
                </div>
            </div>

            <div className="chat-input-area">
                <div className="chat-input-wrapper">
                    <input
                        type="text"
                        placeholder="Ask a question about the results..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button className="send-btn" aria-label="Send message">
                        <Send size={16} color="#fff" />
                    </button>
                </div>
                <div className="chat-quick-actions">
                    <button className="quick-action-btn">
                        <ArrowRightLeft size={13} />
                        Compare Scans
                    </button>
                    <button className="quick-action-btn">
                        <History size={13} />
                        Check History
                    </button>
                </div>
            </div>
        </div>
    );
}
