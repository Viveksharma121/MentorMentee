import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import base64 from 'base-64';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Error fetching token:', error);
  }
};

const getUsernameFromToken = async (token) => {
  try {
    if (!token) throw new Error('Token not found');

    const [, payload] = token.split('.');
    const decodedPayload = base64.decode(payload);
    const payloadObject = JSON.parse(decodedPayload);

    return payloadObject.username;
  } catch (error) {
    console.error('Error decoding token:', error);
  }
};

const SkillsForm = () => {
  const BASE_URL = Config.BASE_URL;
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [projects, setProjects] = useState([{ title: '', githubLink: '' }]);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true; // This flag ensures we do not set state on an unmounted component

      const fetchUserData = async () => {
        if (!isActive) return; // Exit if the component is no longer active

        try {
          const token = await getToken();
          const username = await getUsernameFromToken(token);
          if (!isActive) return; // Check again to ensure the component is still active
          setName(username);
          // Fetch user data based on the username
          const response = await axios.get(`${BASE_URL}/api/skills/${username}`);
          const userData = response.data;

          // If user data exists, set the state with the retrieved data
          if (userData && isActive) {
            setPosition(userData.position || '');
            setDescription(userData.description || '');
            setSkills(userData.skills || []);
            setProjects(userData.projects || [{ title: '', githubLink: '' }]);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchUserData();

      return () => {
        isActive = false; // Set flag as false when the component unmounts
      };
    }, [])
  );

  const addSkill = () => {
    currentSkill.trim() !== '' && setSkills([...skills, currentSkill]) && setCurrentSkill('');
    setCurrentSkill('');
  };

  const removeSkill = (index) => {
    const updatedSkills = [...skills];
    updatedSkills.splice(index, 1);
    setSkills(updatedSkills);
  };

  const addProject = () => {
    setProjects([...projects, { title: '', githubLink: '' }]);
  };

  const updateProject = (index, field, value) => {
    const updatedProjects = [...projects];
    updatedProjects[index][field] = value;
    setProjects(updatedProjects);
  };

  const removeProject = (index) => {
    const updatedProjects = [...projects];
    updatedProjects.length > 1 && updatedProjects.splice(index, 1);
    setProjects(updatedProjects);
  };

  const handleSubmit = async () => {
    try {
      // Submit the form data
      await axios.post(`${BASE_URL}/api/skills`, {
        name,
        position,
        description,
        skills,
        projects,
      });
      setSkills([]);
      // Optional: Clear the form or fetch latest data after submission
      alert('Data submitted successfully');
      navigation.navigate('Profile');
      // For fetching the latest data, you might want to call fetchUserData() here
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      {/* Form Fields */}
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" editable={false} />
      <TextInput style={styles.input} value={position} onChangeText={setPosition} placeholder="Position" />
      <TextInput style={[styles.input, styles.descriptionInput]} multiline numberOfLines={4} value={description} onChangeText={setDescription} placeholder="Description" />

      {/* Skills Section */}
      <Text style={styles.sectionTitle}>Skills:</Text>
      <View style={styles.skillInputContainer}>
        <TextInput style={[styles.input, styles.skillInput]} value={currentSkill} onChangeText={setCurrentSkill} placeholder="Add a skill" />
        <TouchableOpacity style={styles.addSkillButton} onPress={addSkill}>
          <Text style={styles.addSkillButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.skillsList}>
        {skills.map((skill, index) => (
          <TouchableOpacity key={index} style={styles.skill} onPress={() => removeSkill(index)}>
            <Text style={styles.skillText}>{skill}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Projects Section */}
      <Text style={styles.sectionTitle}>Projects:</Text>
      {projects.map((project, index) => (
        <View key={index} style={styles.projectInputContainer}>
          <TextInput style={styles.input} value={project.title} onChangeText={(text) => updateProject(index, 'title', text)} placeholder="Project Title" />
          <TextInput style={styles.input} value={project.githubLink} onChangeText={(text) => updateProject(index, 'githubLink', text)} placeholder="GitHub Link" autoCapitalize="none" autoCorrect={false} />
          <TouchableOpacity style={styles.removeProjectButton} onPress={() => removeProject(index)}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={addProject}>
        <Text style={styles.addButtonText}>+ Add Project</Text>
      </TouchableOpacity>

      <View style={styles.submitButton}>
        <Button title="Submit" onPress={handleSubmit} color="#00C851" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  skillInputContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  skillInput: {
    flex: 1,
  },
  addSkillButton: {
    backgroundColor: 'blue',
    padding: 10,
    marginLeft: 10,
    borderRadius: 5,
  },
  addSkillButtonText: {
    color: 'white',
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  skill: {
    backgroundColor: 'blue',
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
    padding: 10,
  },
  skillText: {
    color: 'white',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 20,
  },
  projectInputContainer: {
    marginTop: 10,
  },
  removeProjectButton: {
    marginTop: 10,
  },
  removeButtonText: {
    color: 'red',
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 20,
  },
});

export default SkillsForm;