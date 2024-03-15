import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {useEffect, useRef, useState} from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Config from 'react-native-config';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const ChatPage = ({route}) => {
  const BASE_URL = Config.BASE_URL;
  const navigation = useNavigation();
  const {chatroomId, userName, myUserName} = route.params;

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isMentoringSessionActive, setIsMentoringSessionActive] =
    useState(false);
  const [receiver, setReceiver] = useState('');
  useEffect(() => {
    (async () => {
      await fetchMessages();
      await fetchParticipant(chatroomId);
      await fetchMentoringSessionState();
    })();
  }, [chatroomId]);
  const fetchMentoringSessionState = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/chat/chatroom/${chatroomId}/session-state`,
      );
      setIsMentoringSessionActive(response.data.isMentoringSessionActive);
    } catch (error) {
      console.error('Error fetching mentoring session state:', error);
    }
  };

  const updateMentoringSessionState = async isActive => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/chat/chatroom/${chatroomId}/session-state`,
        {
          isMentoringSessionActive: isActive,
        },
      );
      setIsMentoringSessionActive(response.data.isMentoringSessionActive);
    } catch (error) {
      console.error('Error updating mentoring session state:', error);
    }
  };

  const handleNewMessage = () => {
    updateMentoringSessionState(true); // When a new message is sent, set the mentoring session as active
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/messages`, {chatroomId});
      if (response.status === 200) {
        setMessages(response.data);
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchParticipant = async chatroomId => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/chat/chatroom/${chatroomId}/participants/0`,
      );
      const participant = response.data.participant;
      setReceiver(participant);
    } catch (error) {
      console.error('Error fetching participant:', error);
    }
  };

  const sendMessage = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/message`, {
        chatroomId,
        sender: myUserName,
        text: message,
      });
      if (response.status === 200) {
        setMessage(''); // Clear the input after sending
        fetchMessages();

        await sendNotification(myUserName, userName, 'sent you a message');
        handleNewMessage(); // Call handleNewMessage when a new message is sent
      } else {
        console.error('Error while sending message:', response.data.error);
      }
    } catch (err) {
      console.error('Error sending axios post request:', err);
    }
  };

  const sendNotification = async (sender, receiver, message) => {
    try {
      // Assuming the server route for sending notifications is '/send-notification'
      await axios.post(`${BASE_URL}/send-notification`, {
        sender,
        receiver,
        message,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const scrollViewRef = useRef();

  const scrollToBottom = () => {
    scrollViewRef.current.scrollToEnd({animated: true});
  };

  const navigateToUserProfile = () => {
    navigation.navigate('UserProfile', {userName});
  };

  const handleDonePress = async () => {
    await AsyncStorage.setItem(`${chatroomId}_hasRated`, 'true');
    const creditsResponse = await axios.post(`${BASE_URL}/update-credits`, {
      username: userName,
      actionType: 'Rating',
      rating: rating,
    });
    console.log(isMentoringSessionActive);
    updateMentoringSessionState(false);
    console.log(isMentoringSessionActive);
    closeModal();
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleStarPress = selectedRating => {
    setRating(selectedRating);
    setSelectedStar(selectedRating);
  };

  const handleTyping = text => {
    setMessage(text);
    setIsTyping(!!text.trim()); // Update typing state based on whether input has content
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateToUserProfile}>
          <Text style={styles.headerText}>{userName}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={openModal}>
          <Text style={styles.endButton}>
            {receiver !== myUserName && isMentoringSessionActive ? 'End' : ''}{' '}
            {/* Change button text based on session state */}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollViewContent}
        onContentSizeChange={scrollToBottom}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              msg.sender === myUserName
                ? styles.sentMessage
                : styles.receivedMessage,
            ]}>
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={handleTyping} // Update message state and typing state
          style={styles.textInput}
          placeholder="Type your message here..."
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={closeModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Rate the user</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleStarPress(star)}>
                  <FontAwesome
                    name={star <= selectedStar ? 'star' : 'star-o'}
                    size={40}
                    color="#ffd700"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={handleDonePress}
              style={styles.doneButton}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  endButton: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
  },
  messageText: {
    color: 'black',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 20,
    marginRight: 20,
    color: '#333',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    fontSize: 20,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  starIcon: {
    margin: 5,
  },
  doneText: {
    marginTop: 20,
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatPage;
