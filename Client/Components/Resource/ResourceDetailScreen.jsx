import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import base64 from 'base-64';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Config from 'react-native-config';
import Icon from 'react-native-vector-icons/FontAwesome5';
import YoutubePlayer from 'react-native-youtube-iframe';
const ResourceDetailScreen = ({ route }) => {
  const { resource } = route.params;
  const [data, setData] = useState(null);
  const BASE_URL = Config.BASE_URL;
  // Function to fetch resource details
  const findResource = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/resource/find/${resource._id}`,
      );
      console.log(response.data);
      setData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // Call findResource when component mounts
    findResource();
  }, [resource._id]);

  const formatDate = dateString => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };
  const shareResource = async () => {
    try {
      const message = `Check out this resource: ${data.title} - ${BASE_URL}/resource/${resource._id}`;
      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error('Error sharing resource:', error.message);
    }
  };

  const getUsernameFromToken = async token => {
    try {
      if (!token) {
        throw new Error('Token not found');
      }
      const [, payload] = token.split('.');
      const decodedPayload = base64.decode(payload);
      const payloadObject = JSON.parse(decodedPayload);
      return payloadObject.username;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  const handleLike = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error('Token not found');
        return;
      }
      const username = await getUsernameFromToken(token);
      if (!username) {
        console.error('Username not found in token');
        return;
      }
      const response = await axios.put(
        `${BASE_URL}/api/resource/incrementLikes/${resource._id}`,
        {
          username: username,
        },
      );
      if (response.status === 200) {
        console.log("created resource by ", resource.createdBy);
        // Call the API to update credits when a user likes a post
        // const credituser = await axios.get(`${BASE_URL}/credits/${resource.createdBy}`);


        // const credituserdata = credituser.data[0].user_name;


        // console.log("credit data  ", credituserdata);
        // console.log("credit username ",credituser.data.user_name);
        // Call the API to update credits when a user adds a comment

        const creditsResponse = await axios.post(
          `${BASE_URL}/update-credits`,
          { username: resource.createdBy, actionType: 'resourcelike' }
        );
        console.log("resource ka credits ", creditsResponse.data);
      }
      findResource();
    } catch (error) {
      console.log(error);
    }
  };

  // If resource data is not loaded yet, display a loading indicator
  if (!data) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Video Player */}
      <View style={styles.videoContainer}>
        <YoutubePlayer
          height={280}
          play={false}
          videoId={extractVideoId(data.url)}
          style={styles.videoPlayer}
        />
      </View>

      {/* Resource Details */}
      <View style={styles.resourceInfoContainer}>
        {/* Title */}
        <Text style={styles.title}>{data.title}</Text>

        {/* Likes, Views, Created */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statsText}>{data.likes}</Text>
            <Text style={styles.statsText}>Likes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statsText}>{data.views}</Text>
            <Text style={styles.statsText}>Views</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statsText, styles.boldText]}>Created at</Text>
            <Text style={styles.statsText}>{formatDate(data.createdAt)}</Text>
          </View>
        </View>

        {/* Category */}
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryLabel}>Category:</Text>
          <Text style={styles.categoryText}>{data.category}</Text>
        </View>

        {/* Ratings */}
        <View style={styles.ratingsContainer}>
          <Text style={styles.statsText}>Rating : {data.rating}</Text>
          <Icon
            name="star"
            size={14}
            color="#FFD700"
            solid
            style={styles.ratingIcon}
          />
        </View>
        <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
          <Icon
            name="thumbs-up"
            size={20}
            color="#FFD700"
            style={styles.likeIcon}
          />
          <Text style={styles.likeText}>Like</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity onPress={shareResource} style={styles.shareButton}>
          <Icon name="share" size={20} color="#FFD700" />
        </TouchableOpacity>

        {/* Description */}
        <Text style={styles.description}>{data.description}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#111111',
    color: '#111111',
  },
  videoContainer: {
    backgroundColor: '#000',
    height: 210,
  },
  videoPlayer: {
    flex: 1,
  },
  resourceInfoContainer: {
    flex: 1,
    padding: 20,
    borderTopRightRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 2,
    marginBottom: 14,
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  statsText: {
    fontSize: 16,
    color: '#fff',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryLabel: {
    marginRight: 5,
    fontSize: 20,
    color: '#fff',
  },
  categoryText: {
    fontSize: 18,
    color: '#2C4BFF',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  ratingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingIcon: {
    marginRight: 5,
  },
  description: {
    fontSize: 18,
    marginBottom: 10,
    color: '#fff',
  },
  shareButton: {
    alignItems: 'center',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
});

export default ResourceDetailScreen;
const extractVideoId = url => {
  console.log(url);
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  console.log(match);
  return match ? match[1] : null;
};
