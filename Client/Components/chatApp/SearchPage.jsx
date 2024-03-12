import React, {useState} from 'react';
import {View, TextInput, Button, Alert, Text} from 'react-native';
import axios from 'axios';
import {TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const SearchPage = ({route}) => {
  const {myUserName} = route.params || {};
  const [userName, setUserName] = useState('');
  const [foundUserName, setFoundUserName] = useState('');

  const handleSearch = () => {
    if (userName === myUserName) {
      Alert.alert('Alert', "You can't search yourself", [
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ]);
    } else {
      axios
        .post('http://10.0.2.2:5001/search', {
          username: userName,
        })
        .then(response => {
          console.log('Response Data:', response.data);
          setFoundUserName(response.data.userName); // Set the found email in state
        })
        .catch(error => {
          console.error('Error:', error);
          Alert.alert('Alert', 'User does not exist.');
        });
    }
  };

  const handleUser = async () => {
    console.log('Handle User function called: ', {
      userName: foundUserName,
      myUserName: myUserName,
    });

    try {
      // Make an API request to create or find a chatroom
      const response = await axios.post('http://10.0.2.2:5001/chatroom', {
        userName: foundUserName,
        myUserName,
      });
      // .then(response => {
      //   console.log('Response: ', response.data);
      // })
      // .catch(err => {
      //   console.log('Error: ', err);
      // });

      const {data} = response;

      if (response.status === 200) {
        const {chatroomId} = data;
        console.log('Chatroom ID:', chatroomId);
        navigation.navigate('chat', {
          chatroomId: chatroomId,
          userName: foundUserName,
          myUserName: myUserName,
        });
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error handling user:', error);
    }
  };

  const navigation = useNavigation();

  return (
    <View>
      <TextInput
        placeholder="Enter email"
        value={userName}
        onChangeText={text => setUserName(text)}
      />
      <Button title="Search" onPress={handleSearch} />
      {/* Conditionally render the card if foundEmail is not empty */}
      {foundUserName ? (
        <TouchableOpacity onPress={() => handleUser()}>
          <View style={{marginVertical: 20}}>
            <Text>{foundUserName}</Text>
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SearchPage;
