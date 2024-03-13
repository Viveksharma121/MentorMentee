import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome from react-native-vector-icons
import Config from 'react-native-config';

const ChatPage = ({ route }) => {
  const BASE_URL = Config.BASE_URL;
  const navigation = useNavigation();
  const { chatroomId, userName, myUserName } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);

  const fetchMessages = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/messages`, {
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

  const sendMessage = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/message`, {
        chatroomId: chatroomId,
        sender: myUserName,
        text: message,
      });

      if (response.status === 200) {
        fetchMessages();
      } else {
        console.error('Error while sending message:', response.data.error);
      }
    } catch (err) {
      console.error('Error sending axios post request: ', err);
    }
  };

  const scrollViewRef = useRef();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    scrollViewRef.current.scrollToEnd({ animated: true });
  };

  const navigateToUserProfile = (username) => {
    navigation.navigate('UserProfile', { username });
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleStarPress = (selectedRating) => {
    setRating(selectedRating);
    setSelectedStar(selectedRating);
  };

  const handleDonePress = async () => {
    console.log(`User rated with ${rating} stars.`);
    closeModal();

  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateToUserProfile(userName)}>
          <Text style={styles.headerText}>{userName}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={openModal}>
          <Text style={styles.endButton}>End</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        ref={scrollViewRef}
        onContentSizeChange={scrollToBottom}>
        <View style={styles.messageContainer}>
          {messages.map((message, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.messageBubble,
                message.sender === myUserName ? styles.sentMessage : styles.receivedMessage,
              ]}>
              <Text style={styles.messageText}>{message.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          style={styles.textInput}
          placeholder="Type your message..."
          placeholderTextColor="#aaa"
          onChangeText={(message) => setMessage(message)}
        />
        <TouchableOpacity
          style={styles.sendButtonContainer}
          onPress={() => sendMessage()}
          activeOpacity={0.8}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Rating Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={closeModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Rate the user</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
                  <FontAwesome
                    name={star <= selectedStar ? 'star' : 'star-o'}
                    size={40}
                    color="#ffd700"
                    style={styles.starIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={handleDonePress}>
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
  messageContainer: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
  sendButtonContainer: {
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
    shadowOffset: { width: 0, height: 2 },
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
