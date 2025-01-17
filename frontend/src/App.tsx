import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

// Define types for messages
interface Message {
  from: string;
  message: string;
}

const socket: Socket = io('http://localhost:3000');

const App: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingInfo, setTypingInfo] = useState<string>('');

  useEffect(() => {
    
    socket.on('private', (data: Message) => {
      setMessages((prev) => [...prev, { from: data.from, message: data.message }]);
    });

    
    socket.on('typing', ({ from }: { from: string }) => {
      setTypingInfo(`${from} is typing...`);
    });

    socket.on('stop_typing', () => {
      setTypingInfo('');
    });

    
    return () => {
      socket.off('private');
      socket.off('typing');
      socket.off('stop_typing');
    };
  }, []);

  const register = () => {
    if (username) {
      socket.emit('register', username);
    }
  };

  const sendMessage = () => {
    if (recipient && message) {
      socket.emit('private', { to: recipient, message });
      setMessages((prev) => [...prev, { from: 'You', message }]);
      setMessage('');
    }
  };

  const handleTyping = () => {
    socket.emit('typing', recipient);
  };

  const handleStopTyping = () => {
    socket.emit('stop_typing', recipient);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Chat App</h1>

        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none"
          />
          <button
            onClick={register}
            className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Register
          </button>
        </div>

        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Recipient Username"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none"
          />
          <textarea
            placeholder="Type your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={handleTyping}
            onBlur={handleStopTyping}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none mt-2"
          />
          <button
            onClick={sendMessage}
            className="mt-2 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
          >
            Send
          </button>
        </div>

        
        {typingInfo && <p className="text-sm text-gray-500">{typingInfo}</p>}

        
        <div className="mt-4">
          <h2 className="text-lg font-bold mb-2">Messages</h2>
          <div className="space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg ${
                  msg.from === 'You' ? 'bg-blue-100 text-right' : 'bg-gray-100'
                }`}
              >
                <strong>{msg.from}:</strong> {msg.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
