// ChatbotScreen.js
import React, { useState, useEffect } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import axios from "axios";

const ChatbotScreen = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Initial message when the component mounts
        setMessages([
            {
                _id: 1,
                text: "Hello! I am your chatbot.",
                createdAt: new Date(),
                user: { _id: 2, name: "React Native" },
            },
        ]);
    }, []);

    const onSend = async (newMessages = []) => {
        const userMessage = newMessages[0];

        try {
            setMessages((prevMessages) =>
                GiftedChat.append(prevMessages, [userMessage])
            );

            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: userMessage.text }],
                    max_tokens: 150,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer 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`,
                    },
                }
            );

            const assistantResponse =
                response.data.choices[0]?.message?.content ||
                "Sorry, I didn't understand that.";

            if (assistantResponse.trim() !== "") {
                setMessages((prevMessages) =>
                    GiftedChat.append(prevMessages, [
                        {
                            _id: Math.random().toString(36).substring(7),
                            text: assistantResponse,
                            createdAt: new Date(),
                            user: { _id: 2, name: "React Native" },
                        },
                    ])
                );
            }
        } catch (error) {
            console.error("Error sending message to GPT-3:", error.message);
        }
    };

    return (
        <GiftedChat
            messages={messages}
            onSend={(newMessages) => onSend(newMessages)}
            user={{
                _id: 1,
            }}
        />
    );
};

export default ChatbotScreen;
