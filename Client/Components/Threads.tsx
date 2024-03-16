import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import base64 from 'base-64';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Config from 'react-native-config';
import { Button, IconButton, Modal, Portal, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Share } from 'react-native'; // Import Share from react-native

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
  const [notificationCount, setNotificationCount] = useState<number>(0);

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
  //fetch notification count

  const fetchNotifications = async () => {
    try {
      console.log(username + 'fetch noti ka username');
      const response = await axios.get(`${BASE_URL}/notifications/${username}`);
      if (response.status === 200) {
        setNotificationCount(response.data.length);
        console.log(response.data.length);
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

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
      fetchNotifications();
    }, []),
  );
  useEffect(() => {
    fetchNotifications();
  }, [username]);

  const [isModalVisible, setModalVisible] = useState(false);
  const [newPost, setNewPost] = useState({ user_name: '', content: '' });
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
    setNewPost({ user_name: username, content: '' });
  };

  const handleInputChange = (field: string, value: string) => {
    setNewPost({ ...newPost, [field]: value });
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
      const newPostWithUsername = { ...newPost, user_name: username };
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
        { userId: username },
      );

      if (response.status === 200) {
        // Call the API to update credits when a user likes a post
        const credituser = await axios.get(`${BASE_URL}/credits/${postId}`);

        const credituserdata = credituser.data[0].user_name;

        console.log('credit data  ', credituserdata);
        // console.log("credit username ",credituser.data.user_name);
        // Call the API to update credits when a user adds a comment

        const creditsResponse = await axios.post(`${BASE_URL}/update-credits`, {
          username: credituserdata,
          actionType: 'comment',
        });

        if (creditsResponse.data.success) {
          // Refresh posts to reflect the new like status
          fetchPosts();
        } else {
          console.error(
            'Failed to update credits:',
            creditsResponse.data.message,
          );
        }
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

      const credituser = await axios.get(`${BASE_URL}/credits/${postId}`);

      const credituserdata = credituser.data[0].user_name;

      console.log('credit data  ', credituserdata);
      // console.log("credit username ",credituser.data.user_name);
      // Call the API to update credits when a user adds a comment
      const creditsResponse = await axios.post(`${BASE_URL}/update-credits`, {
        username: credituserdata,
        actionType: 'comment',
      });

      if (creditsResponse.data.success) {
        setNewComment('');
        setActivePostId(null);
        setCommentModalVisible(false);
        fetchPosts();
      } else {
        console.error(
          'Failed to update credits:',
          creditsResponse.data.message,
        );
      }
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
        Navigation.navigate('EditPost', { postToEdit: post });
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
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
      <Pressable onPress={() => Navigation.navigate('UserProfile', { userName: item.user_name })}>
          <Text style={styles.postTitle}>{item.user_name}</Text>
        </Pressable>

      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
        {/* Share Button */}
        <IconButton
          icon={() => (
            <Icon
              name="share"
              size={24}
              color="#000"
            />
          )}
          onPress={() => sharePost(item)}
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
         renderItem={({ item: comment }) => (
           <View style={styles.commentContainer}>
             <Pressable
               onPress={() => Navigation.navigate('UserProfile', { userName: comment.user_name })}
             >
               <Text style={styles.commentAuthor}>{comment.user_name}:</Text>
             </Pressable>
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

  // Function to share a post
  const sharePost = async (post: any) => {
    try {
      const shareOptions = {
        message: `Check out this post by ${post.user_name}: ${post.content}`, // Message to be shared
      };
      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  return (
    <View style={styles.container}>
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton
            icon="bell"
            onPress={() => Navigation.navigate('Notification')}
            style={{ marginRight: 0}}
          />
          {notificationCount > 0 && (
            <Text
              style={{
                backgroundColor: '#3B3B3B',
                borderRadius: 10,
                paddingHorizontal: 6,
                paddingVertical: 2,
                fontSize: 12,
                color: 'white',
                fontWeight: 'bold',
              }}>
              {notificationCount}
            </Text>
          )}
          <IconButton
            icon="chat"
            onPress={() => Navigation.navigate('Home')}
            style={{ marginHorizontal: 20}}
          />
          <IconButton
    icon={() => <Text style={{ fontSize: 24 }}>⭐</Text>} // Unicode character for a star
    onPress={() => Navigation.navigate('Rank')}
    style={{ marginHorizontal: 16 }}
  />
          <IconButton icon="map" onPress={() => Navigation.navigate('RoadMap')} style={{ marginHorizontal: 12 }} />
        </View>
        <IconButton
          icon="logout"
          color="#000"
          size={24}
          onPress={handleLogout}
          style={{ marginHorizontal: 30 }}
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
    backgroundColor: '#f9f9f9',
  },
  postContainer: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 6,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  postContent: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  commentsContainer: {
    marginTop: 10,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  commentAuthor: {
    fontWeight: 'bold',
    marginRight: 4,
    color: '#333333',
  },
  commentContent: {
    flex: 1,
    color: '#666666',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#ff5a5f',
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  modalInput: {
    height: 40,
    width: '100%',
    borderColor: '#cccccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
  },
  modalInputTitle: {
    height: 40,
    marginBottom: 16,
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  modalInputContent: {
    marginBottom: 16,
    textAlignVertical: 'top',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  submitButton: {
    marginBottom: 8,
    backgroundColor: '#4caf50',
    borderRadius: 8,
  },
  cancelButton: {
    marginBottom: 16,
    color: '#333333',
  },
  commentButton: {
    marginTop: 10,
    backgroundColor: '#4caf50',
    borderRadius: 8,
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
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  commentSubmitButton: {
    marginBottom: 8,
    backgroundColor: '#4caf50',
    borderRadius: 8,
  },
  commentCancelButton: {
    marginBottom: 16,
    color: '#333333',
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
    color: '#333333',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalCloseIcon: {
    color: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 100,
  },
  modalButton: {
    backgroundColor: '#ff5a5f',
    borderRadius: 8,
  },
  logoutButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderRadius: 8,
  },
});

export default Threads;
