import React, {useState, useEffect, useId, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  ScrollView,
} from 'react-native';
import axios from 'axios';

const ChatPage = ({route}) => {
  const {chatroomId, userName, myUserName} = route.params || {}; // Ensure route.params is defined
    console.log(userName);
  console.log(myUserName);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  const fetchMessages = async () => {
    try {
      const response = await axios.post('http://10.0.2.2:5001/messages', {
        chatroomId,
      });
      if (response.status === 200) {
        setMessages(response.data);
      } else if (response.status === 404) {
        setMessages([]);
      } else {
        console.error('Error:', response.data.error);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [chatroomId]);

  const sendMessage = () => {
    try {
      axios
        .post('http://10.0.2.2:5001/message', {
          chatroomId: chatroomId,
          sender: myUserName,
          text: message,
        })
        .then(response => {
          console.log(response.data);
          fetchMessages();
        })
        .catch(err => {
          console.log('Error while sending message: ', err);
        });
      fetchMessages();
    } catch (err) {
      console.log('Error sending axios post request: ', err);
    }
  };

  const scrollViewRef = useRef();

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll to bottom whenever messages change

  const scrollToBottom = () => {
    scrollViewRef.current.scrollToEnd({animated: true});
  };

  return (
    <View style={{flex: 1}}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{userName}</Text>
        {/* <Text>My Email: {myEmail}</Text> */}
        {/* <Text>ChatroomId: {chatroomId}</Text> */}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        ref={scrollViewRef}
        onContentSizeChange={scrollToBottom}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          {messages.length === 0 ? (
            <Text>No messages</Text>
          ) : (
            <View>
              {messages.map((message, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageContainer,
                    message.sender === myUserName
                      ? styles.sentMessage
                      : styles.receivedMessage,
                    message.sender === myUserName
                      ? {alignSelf: 'flex-end'}
                      : {alignSelf: 'flex-start'},
                  ]}>
                  <Text>{message.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Text input and send button */}
      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          style={styles.textInput}
          placeholder="Type your message..."
          onChangeText={message => setMessage(message)}
        />
        <Button title="Send" onPress={() => sendMessage()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white', // Background color for the header
    width: '100%', // Ensure header spans the full width of the screen
    paddingVertical: 10, // Adjust padding as needed
    alignItems: 'center', // Center text horizontally
    justifyContent: 'center', // Center text vertically
  },
  headerText: {
    color: 'black', // Text color for the header
    fontSize: 20, // Adjust font size as needed
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-end', // Ensure messages are at the bottom initially
  },
  messageContainer: {
    backgroundColor: '#e2ffc7',
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    maxWidth: '80%', // Limit message width
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sentMessage: {
    alignSelf: 'flex-end', // Align messages sent by the user to the right
    backgroundColor: '#e2ffc7', // Example color for sent messages
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  receivedMessage: {
    alignSelf: 'flex-start', // Align messages received from others to the left
    backgroundColor: '#ffffff', // Example color for received messages
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
});

export default ChatPage;
