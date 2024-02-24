import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Config from 'react-native-config';
import {Button, IconButton, Modal, Portal, TextInput} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';

const Threads = () => {
  const BASE_URL = Config.BASE_URL;
  const [posts, setPosts] = useState<any[]>([]);
  async function fetchPosts() {
    try {
      console.log('fetch post called');
      const response = await axios.get(`${BASE_URL}/api/thread`);
      console.log('after response');

      if (!response.data) {
        throw new Error('Error fetching public posts');
      }

      const data: any = response.data;

      // console.log('fetched');
      const sortedData = data.sort((a: any, b: any) => {
        const dateA = new Date(a?.created_at ?? '');
        const dateB = new Date(b?.created_at ?? '');
        return dateB.getTime() - dateA.getTime();
      });

      setPosts(sortedData);
      // console.log(sortedData);
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  // const fetchPosts = async () => {
  //   console.log('fetch post called without code');

  // };

  useEffect(() => {
    fetchPosts();
  }, []);

  const [isModalVisible, setModalVisible] = useState(false);
  const [newPost, setNewPost] = useState({user_name: '', content: ''});

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleInputChange = (field: any, value: any) => {
    setNewPost({...newPost, [field]: value});
  };
  //   useEffect(() => {
  //     // Fetch posts from the backend when the component mounts
  //     fetchPosts();
  //   }, []);

  //   const fetchPosts = async () => {
  //     try {
  //       const response = await fetch('http://your-backend-url/getPosts');
  //       const data = await response.json();
  //       setPosts(data);
  //     } catch (error) {
  //       console.error('Error fetching posts:', error);
  //     }
  //   };

  const handleAddPost = async () => {
    try {
      console.log(newPost);
      const response = await fetch(`${BASE_URL}/api/thread/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data);
      console.log(newPost);
      setPosts([...posts, data]);
      console.log('after adding');
      fetchPosts();
      toggleModal();
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };
  const renderItem = ({item}: ListRenderItemInfo<any>) => (
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
              color={item.liked ? '#FF69B4' : '#000000'}
            />
          )}
          onPress={() => handleLike(item.id)}
        />
        <Text>{item.likes}</Text>
      </View>
    </View>
  );

  const handleLike = async (postId: any) => {
    const updatedPosts = posts.map(async post => {
      if (post.id === postId) {
        // return {...post, liked: !post.liked};
        const likedIndex = post.likes.findIndex(
          (user: string) => user === 'user1',
        );
        if (likedIndex == -1) {
          post.likes.push('user1');
        } else {
          post.likes.splice(likedIndex, 1);
        }
        return {...post};
      }
      return post;
    });
    setPosts(updatedPosts);
    const response = await fetch(
      `${BASE_URL}/api/thread/threads/${postId}/like`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId: 'user1'}),
      },
    );
    if (response.status === 200) {
      fetchPosts();
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.addButton} onPress={toggleModal}>
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>

      <FlatList
        data={posts}
        keyExtractor={item => item._id}
        renderItem={renderItem}
      />

      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={toggleModal}
          contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Newestbhsbchas Post</Text>
          <TextInput
            style={styles.modalInputTitle}
            placeholder="Title"
            value={newPost.user_name}
            onChangeText={text => handleInputChange('user_name', text)}
          />
          <TextInput
            style={styles.modalInputContent}
            placeholder="Content"
            multiline={true}
            numberOfLines={8}
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
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8EDE3',
  },
  postContainer: {
    marginBottom: 16,
    backgroundColor: '#ecf0f1',
    padding: 16,
    borderRadius: 8,
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
    color: '#305F72',
  },
  postAuthor: {
    fontSize: 16,
    color: '#F18C8E',
  },
  postContent: {
    fontSize: 16,
    marginBottom: 8,
  },
  postLikes: {
    fontSize: 14,
    color: '#F18C8E',
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#F18C8E',
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

  // modalContainer: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   backgroundColor: 'rgba(0, 0, 0, 0.5)',
  //   padding: 20,
  // },
  // modalTitle: {
  //   fontSize: 24,
  //   fontWeight: 'bold',
  //   marginBottom: 16,
  //   color: '#305F72',
  // },
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
});

export default Threads;
