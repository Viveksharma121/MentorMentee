// ChatbotScreen.js
import React, {useState, useEffect} from 'react';
import {GiftedChat} from 'react-native-gifted-chat';
import axios from 'axios';

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Initial message when the component mounts
    setMessages([
      {
        _id: 1,
        text: 'Hello! I am your chatbot.',
        createdAt: new Date(),
        user: {_id: 2, name: 'React Native'},
      },
    ]);
  }, []);

  const formatResponseText = text => {
    // Remove asterisks from the text
    return text.replace(/\*/g, '');
  };

  const onSend = async (newMessages = []) => {
    const userMessage = newMessages[0];

    try {
      setMessages(prevMessages =>
        GiftedChat.append(prevMessages, [userMessage]),
      );

      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCYlFT5Yd9PiKSGugKo5Ft8d72aV5TH4As',
        {
          contents: [
            {
              parts: [{text: userMessage.text}],
            },
          ],
        },
      );

      const assistantResponse =
        response.data.candidates[0]?.content?.parts[0]?.text ||
        "Sorry, I didn't understand that.";

      const formattedResponse = formatResponseText(assistantResponse);

      if (formattedResponse.trim() !== '') {
        setMessages(prevMessages =>
          GiftedChat.append(prevMessages, [
            {
              _id: Math.random().toString(36).substring(7),
              text: formattedResponse,
              createdAt: new Date(),
              user: {_id: 2, name: 'React Native'},
            },
          ]),
        );
      }
    } catch (error) {
      console.error('Error sending message to Gemini:', error.message);
    }
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={newMessages => onSend(newMessages)}
      user={{
        _id: 1,
      }}
    />
  );
};

export default ChatbotScreen;
