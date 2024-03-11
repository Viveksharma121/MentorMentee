import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import base64 from 'base-64';
import React, {useCallback, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import Config from 'react-native-config';
import {Button, IconButton, Modal, Portal, TextInput} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';

const Threads = () => {
  const Navigation = useNavigation();
  const BASE_URL = Config.BASE_URL;
  const [posts, setPosts] = useState<any[]>([]);
  const [username, setUsername] = useState<string>('');
  const [newComment, setNewComment] = useState<string>('');
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [commentModalVisible, setCommentModalVisible] =
    useState<boolean>(false);
  const [commentsVisible, setCommentsVisible] = useState<boolean>(false);
  const [visibleComments, setVisibleComments] = useState<{
    [postId: number]: boolean;
  }>({});
  // Function to fetch posts
  async function fetchPosts() {
    try {
      const response = await axios.get(`${BASE_URL}/api/thread`);
      if (!response.data) {
        throw new Error('Error fetching public posts');
      }
      const data: any = response.data;
      const sortedData = data.sort((a: any, b: any) => {
        const dateA = new Date(a?.created_at ?? '');
        const dateB = new Date(b?.created_at ?? '');
        return dateB.getTime() - dateA.getTime();
      });
      setPosts(sortedData);
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  const toggleComments = (postId: number) => {
    setVisibleComments(prevState => ({
      ...prevState,
      [postId]: !prevState[postId], // Toggle visibility
    }));
  };

  // Function to get token and decode username
  const userName = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }
      const [, payload] = token.split('.');
      const decodedPayload = base64.decode(payload);
      const payloadObject = JSON.parse(decodedPayload);
      setUsername(payloadObject.username.toString());
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      userName();
      fetchPosts();
    }, []),
  );

  const [isModalVisible, setModalVisible] = useState(false);
  const [newPost, setNewPost] = useState({user_name: '', content: ''});

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setNewPost({user_name: username, content: ''});
  };

  const handleInputChange = (field: string, value: string) => {
    setNewPost({...newPost, [field]: value});
  };

  const handleAddPost = async () => {
    try {
      const newPostWithUsername = {...newPost, user_name: username};
      const response = await axios.post(
        `${BASE_URL}/api/thread/threads`,
        newPostWithUsername,
      );
      setPosts([...posts, response.data]);
      fetchPosts();
      toggleModal();
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const handleLike = async (postId: any) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/thread/threads/${postId}/like`,
        {userId: username},
      );
      if (response.status === 200) {
        fetchPosts(); // Refresh posts to reflect the new like status
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const addComment = async (postId: number) => {
    try {
      await axios.post(`${BASE_URL}/api/thread/threads/${postId}/comments`, {
        user_name: username,
        content: newComment,
      });
      setNewComment('');
      setActivePostId(null);
      setCommentModalVisible(false);
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const closeCommentBox = () => {
    setActivePostId(null);
    setCommentModalVisible(false);
    setNewComment('');
  };

  // const toggleComments = () => {
  //   setCommentsVisible(!commentsVisible);
  //   setActivePostId(null);
  //   setCommentModalVisible(false);
  //   setNewComment('');
  // };

  const renderItem = ({item}: {item: any}) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Text style={styles.postTitle}>{item.user_name}</Text>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <IconButton
          icon={() => (
            <Icon
              name={item.liked ? 'heart' : 'heart-o'}
              size={24}
              color={item.liked ? '#FF69B4' : '#000'}
            />
          )}
          onPress={() => handleLike(item.id)}
        />
        <Text>{item.likes}</Text>
        <IconButton
          icon={() => (
            <Icon
              name={commentsVisible ? 'comment' : 'comment-o'}
              size={24}
              color="#000"
            />
          )}
          onPress={() => toggleComments(item.id)}
        />
      </View>
      {visibleComments[item.id] && item.comments && item.comments.length > 0 ? (
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>Comments:</Text>
          <FlatList
            data={item.comments}
            keyExtractor={(comment, index) => (comment?.id ?? index).toString()}
            renderItem={({item: comment}) => (
              <View style={styles.commentContainer}>
                <Text style={styles.commentAuthor}>{comment.user_name}:</Text>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
            )}
          />
        </View>
      ) : (
        visibleComments[item.id] &&
        item.comments.length < 1 && <Text>No comments yet</Text>
      )}

      {activePostId === item.id && (
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Write a comment..."
          />
          <Button
            mode="contained"
            onPress={() => addComment(item.id)}
            style={styles.commentSubmitButton}>
            Submit
          </Button>
          <IconButton
            icon="close"
            size={24}
            color="#000"
            onPress={closeCommentBox}
          />
        </View>
      )}
      {visibleComments[item.id] && (
        <Button
          mode="contained"
          onPress={() => setActivePostId(item.id)}
          style={styles.commentButton}>
          Comment
        </Button>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <Text style={styles.headerTitle}>Threads</Text> */}
        <View style={styles.headerIcons}>
          {/* Add your icons for notification, chat, and roadmaps here */}
          <IconButton
            icon="bell"
            onPress={() => console.log('Notification icon pressed')}
          />
          <IconButton
            icon="chat"
            onPress={() => console.log('Chat icon pressed')}
          />
          <IconButton
            icon="map"
            onPress={() => Navigation.navigate('RoadMap')}
          />
        </View>
      </View>
      <FlatList
        data={posts}
        keyExtractor={item => item._id.toString()}
        renderItem={renderItem}
      />

      <Pressable style={styles.addButton} onPress={toggleModal}>
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>

      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={toggleModal}
          contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Post</Text>
          <TextInput
            style={[styles.modalInput, styles.usernameStyle]}
            placeholder="Username"
            value={username}
            editable={false}
          />
          <TextInput
            style={[styles.modalInput, styles.modalInputContent]}
            placeholder="Content"
            multiline={true}
            numberOfLines={4}
            value={newPost.content}
            onChangeText={text => handleInputChange('content', text)}
          />
          <Button
            mode="contained"
            onPress={handleAddPost}
            style={styles.submitButton}>
            Submit
          </Button>
          <Button
            mode="outlined"
            onPress={toggleModal}
            style={styles.cancelButton}>
            Cancel
          </Button>
        </Modal>

        {/* Comment Modal */}
        <Modal
          visible={commentModalVisible}
          onDismiss={closeCommentBox}
          contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Comment</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            multiline={true}
            numberOfLines={4}
            value={newComment}
            onChangeText={setNewComment}
          />
          <Button
            mode="contained"
            onPress={() => addComment(activePostId || 0)}
            style={styles.commentSubmitButton}>
            Submit
          </Button>
          <IconButton
            icon="close"
            size={24}
            color="#000"
            onPress={closeCommentBox}
          />
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  usernameStyle: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#ffffff',
    color: 'gray',
  },
  postContainer: {
    marginBottom: 16,
    backgroundColor: 'grey',
    padding: 16,
    borderRadius: 6,
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  postContent: {
    fontSize: 16,
    marginBottom: 8,
  },
  commentsContainer: {
    marginTop: 10,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  commentAuthor: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  commentContent: {
    flex: 1,
  },
  commentText: {
    fontSize: 16,
    marginBottom: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#002D62',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalInput: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 10,
    backgroundColor: '#fff',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalInputTitle: {
    height: 40,
    marginBottom: 16,
    fontWeight: 'bold',
    backgroundColor: '#f5e1e1',
  },
  modalInputContent: {
    marginBottom: 16,
    textAlignVertical: 'top',
    backgroundColor: '#f5e1e1',
  },
  submitButton: {
    marginBottom: 8,
    backgroundColor: '#305F72',
  },
  cancelButton: {
    marginBottom: 16,
    color: 'black',
  },
  commentButton: {
    marginTop: 10,
    backgroundColor: '#305F72',
  },
  commentInputContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
    marginBottom: 10,
  },
  commentSubmitButton: {
    marginBottom: 8,
    backgroundColor: '#305F72',
  },
  commentCancelButton: {
    marginBottom: 16,
    color: 'black',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Threads;
