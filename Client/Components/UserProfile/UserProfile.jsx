import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import base64 from 'base-64';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Config from 'react-native-config';
import ProjectSlider from './ProjectSlider';
import SkillSlider from './SkillSlider';

const UserProfile = ({ route, navigation }) => {
  const BASE_URL = Config.BASE_URL;
  const username = route.params.userName;
  console.log('user getting from chat', route.params.userName);
  console.log('fetched user ', username);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('skills');
  const [tweets, setTweets] = useState([]);
  const [Myusername, setUsername] = useState(null);
  const [following, setFollowing] = useState(false);
  useEffect(() => {
    const checkFollowingStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('Token not found');
        }
        const [, payload] = token.split('.');
        const decodedPayload = base64.decode(payload);
        const payloadObject = JSON.parse(decodedPayload);
        const currentUser = payloadObject.username.toString();
        setUsername(currentUser);
        // Check if the current user is following the displayed user
        const response = await axios.get(
          `${BASE_URL}/api/${currentUser}/following`,
        );
        const followingUsers = response.data;
        console.log(followingUsers);
        setFollowing(followingUsers.includes(username));
      } catch (error) {
        console.error('Error checking following status:', error);
      }
    };

    checkFollowingStatus();
  }, [BASE_URL, username]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/searchitem?username=${username}`,
        );
        const data = response.data;
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Error fetching user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const getAllTweets = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/thread/userthread?username=${username}`,
        );
        const tweetsData = response.data;
        setTweets(tweetsData);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserData();
    getAllTweets();
  }, [BASE_URL, username]);

  const handleAskButtonPress = async () => {
    try {
      // Make a request to the backend to fetch the chatroomId
      const response = await axios.get(`${BASE_URL}/chatroomId`, {
        params: {
          participant1: username, // First participant
          participant2: Myusername, // Second participant
        },
      });

      const { chatroomId } = response.data;
      console.log(chatroomId);
      // Assuming `Myusername` is the currently logged-in user's username
      navigation.navigate('ChatPage', {
        userName: username,
        myUserName: Myusername,
        chatroomId: chatroomId,
      });
    } catch (error) {
      console.error('Error fetching chatroomId:', error);
      // Handle error appropriately
    }
  };

  const handleFollowButtonPress = async () => {
    try {
      if (following) {
        // Unfollow the user
        await axios.delete(`${BASE_URL}/api/${username}/followers`, {
          data: { followername: Myusername },
        });
        setFollowing(false);
      } else {
        // Follow the user
        await axios.post(`${BASE_URL}/api/${username}/followers`, {
          followername: Myusername,
        });
        setFollowing(true);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const renderFollowButton = () => {
    if (following) {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleFollowButtonPress(userData.name, Myusername)}>
          <Text style={styles.actionButtonText}>UNFOLLOW</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleFollowButtonPress(userData.name, Myusername)}>
          <Text style={styles.actionButtonText}>FOLLOW</Text>
        </TouchableOpacity>
      );
    }
  };

  const windowWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>{error}</Text>
      ) : (
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{userData.name.charAt(0)}</Text>
            </View>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>100</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>200</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>300</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            {/* Render follow/unfollow button */}
            {renderFollowButton()}
            {/* Other actions */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAskButtonPress}>
              <Text style={styles.actionButtonText}>ASK</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.position}>
            {userData.position || 'Not specified'}
          </Text>
          <Text style={styles.description}>
            {userData.description || 'No description available'}
          </Text>

          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === 'skills' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('skills')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'skills' && styles.activeTabText,
                ]}>
                Skills
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === 'projects' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('projects')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'projects' && styles.activeTabText,
                ]}>
                Projects
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contentBox}>
            {activeTab === 'skills' ? (
              <SkillSlider skills={userData.skills} />
            ) : (
              <ProjectSlider projects={userData.projects} />
            )}
          </View>
          <View style={styles.divider} />

          <View style={styles.tweetsContainer}>
            <Text style={styles.tweetsTitle}>All Tweets</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {tweets.map((tweet, index) => (
                <View key={tweet._id} style={styles.tweetContainer}>
                  <Text style={styles.tweetContent}>{tweet.content}</Text>
                  <Text style={styles.tweetDetails}>Likes: {tweet.likes}</Text>
                  <Text style={styles.tweetDetails}>
                    Created At: {new Date(tweet.created_at).toLocaleString()}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    marginRight: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff',
  },
  position: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    color: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 16,
    color: '#fff',
  },
  activeTab: {
    borderBottomColor: '#3498db',
  },
  activeTabText: {
    color: '#3498db',
  },
  contentBox: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 10, // Adjust as needed
  },
  tweetsContainer: {
    marginTop: 20,
  },
  tweetsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  tweetContainer: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  tweetContent: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  tweetDetails: {
    color: '#aaa',
    fontSize: 14,
  },
});

export default UserProfile;
