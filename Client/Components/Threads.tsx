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
      fetchSavedPosts();
    }, []),
  );

  const [isModalVisible, setModalVisible] = useState(false);
  const [newPost, setNewPost] = useState({user_name: '', content: ''});
  const [savedPosts, setSavedPosts] = useState([]);

  const fetchSavedPosts = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/thread/${username}/saved-tweets`,
      );
      console.log('neeche saved hai');
      console.log(response.data);
      setSavedPosts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setNewPost({user_name: username, content: ''});
  };

  const handleInputChange = (field: string, value: string) => {
    setNewPost({...newPost, [field]: value});
  };
  const handleLogout = async () => {
    try {
      console.log(AsyncStorage);
      await AsyncStorage.removeItem('token');
      console.log('====================================');
      console.log('after logout');
      console.log('====================================');
      console.log(AsyncStorage);
      Navigation.navigate('Login');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
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
  const saveTweet = async (postId: number) => {
    try {
      await axios.post(`${BASE_URL}/api/thread/save-tweet`, {
        user_name: username,
        content: posts.find(post => post.id === postId)?.content,
      });
      fetchPosts();
      fetchSavedPosts();
    } catch (error) {
      console.error('Error saving tweet:', error);
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
  const handleEditPost = async (postId: number) => {
    try {
      const post = posts.find(post => post.id === postId);

      // Check if the logged-in user is the author of the post
      if (post.user_name === username) {
        // Open a modal or navigate to another screen for editing
        // Set the post details in the state or context to be used in the edit form

        // Example using React Navigation
        Navigation.navigate('EditPost', {postToEdit: post});
      } else {
        console.log("You don't have permission to edit this post.");
      }
    } catch (error) {
      console.error('Error fetching post for editing:', error);
    }
  };
  const handleDeletePost = async (postId: number) => {
    try {
      const post = posts.find(post => post.id === postId);

      // Check if the logged-in user is the author of the post
      if (post.user_name === username) {
        const response = await axios.delete(
          `${BASE_URL}/api/thread/threads/${postId}`,
        );
        if (response.status === 204) {
          // Post deleted successfully, update the posts state
          setPosts(posts.filter(post => post.id !== postId));
        }
      } else {
        console.log("You don't have permission to delete this post.");
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };
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
        <IconButton
          icon={() => (
            <Icon
              name={
                savedPosts.some(savedPost => savedPost.id === item.id)
                  ? 'bookmark'
                  : 'bookmark-o'
              }
              size={24}
              color={
                savedPosts.some(savedPost => savedPost.id === item.id)
                  ? '#111111'
                  : '#000'
              }
            />
          )}
          onPress={() => saveTweet(item.id)}
        />
        {item.user_name === username && (
          <>
            <IconButton
              icon={() => <Icon name="edit" size={24} color="#000" />}
              onPress={() => handleEditPost(item.id)}
            />
            <IconButton
              icon={() => <Icon name="trash" size={24} color="#FF0000" />}
              onPress={() => handleDeletePost(item.id)}
            />
          </>
        )}
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
        <IconButton icon="bell" onPress={handleLogout} />
        <IconButton
          icon="chat"
          // onPress={() => Navigation.navigate('ChatGpt')}
          onPress={() => Navigation.navigate('Home')}
        />
        <IconButton icon="map" onPress={() => Navigation.navigate('RoadMap')} />
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
          contentContainerStyle={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Post</Text>
            <IconButton
              icon="close"
              size={24}
              color="#000"
              onPress={toggleModal}
            />
          </View>
          <TextInput
            label="Post Content"
            value={newPost.content}
            onChangeText={text => handleInputChange('content', text)}
            multiline
            style={styles.modalTextInput}
          />
          <Button
            mode="contained"
            onPress={handleAddPost}
            style={styles.modalButton}>
            Post
          </Button>
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
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    minHeight: 100,
  },
  modalButton: {
    backgroundColor: '#305F72',
  },
});

export default Threads;
