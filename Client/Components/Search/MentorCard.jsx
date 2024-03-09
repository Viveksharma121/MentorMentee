import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import UserAvatar from 'react-native-user-avatar';

const MentorCard = ({mentor}) => {
  // Function to generate a color based on the user's name
  const generateColor = name => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      let value = (hash >> (i * 8)) & 0xff;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  return (
    <View style={styles.card}>
      <View style={styles.leftContainer}>
        <View style={styles.avatarContainer}>
          <UserAvatar
            size={50} // Smaller avatar size
            name={mentor.name}
            bgColor={generateColor(mentor.name)}
            textStyle={{fontSize: 20, fontWeight: 'bold'}}
            style={styles.avatar} // Add avatar style
            borderWidth={2} // Add border width
            borderColor="black" // Add border color
          />
        </View>
        <View style={styles.sessionsCompleted}>
          <Text style={styles.sessions}>65🗒️</Text>
          <Text style={styles.completed}>sessions</Text>
          <Text style={styles.completed}>completed</Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={[styles.name, {color: 'white'}]}>{mentor.name}</Text>
        <Text style={[styles.subtitle, {color: 'blue'}]}>
          🏢{mentor.position} ✨
        </Text>
        <Text style={[styles.experience, {color: 'white'}]}>
          👨‍🎓2+ years of experience
        </Text>
        <Text style={[styles.education, {color: 'white'}]}>
          📖B.Tech from Thadomal Shahani Engineering College
        </Text>
        <Text style={[styles.skills, {color: 'blue'}]}>
          {mentor.skills.join(' | ')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#333333', // Charcoal black color
    borderRadius: 10,
    padding: 15,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  leftContainer: {
    flexDirection: 'column',
    marginRight: 15,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  avatar: {
    borderRadius: 60, // Maintain circular shape
  },
  sessionsCompleted: {
    alignItems: 'center',
  },
  sessions: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  completed: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  experience: {
    fontSize: 14,
    marginBottom: 5,
  },
  education: {
    fontSize: 14,
    marginBottom: 5,
  },
  skills: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MentorCard;
