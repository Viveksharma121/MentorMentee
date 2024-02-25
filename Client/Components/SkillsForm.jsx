import axios from 'axios';
import React, {useState} from 'react';

import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Config from 'react-native-config';
const SkillsForm = () => {
  const BASE_URL = Config.BASE_URL;
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [projects, setProjects] = useState([{title: '', githubLink: ''}]);

  const addSkill = () => {
    if (currentSkill.trim() !== '') {
      setSkills([...skills, currentSkill]);
      setCurrentSkill('');
    }
  };

  const removeSkill = index => {
    const updatedSkills = [...skills];
    updatedSkills.splice(index, 1);
    setSkills(updatedSkills);
  };

  const addProject = () => {
    setProjects([...projects, {title: '', githubLink: ''}]);
  };

  const updateProject = (index, field, value) => {
    const updatedProjects = [...projects];
    updatedProjects[index][field] = value;
    setProjects(updatedProjects);
  };

  const removeProject = index => {
    const updatedProjects = [...projects];
    if (updatedProjects.length > 1) {
      updatedProjects.splice(index, 1);
      setProjects(updatedProjects);
    }
  };

  const handleSubmit = async () => {
    // Simulate form submission process
    console.log('Form data:', {name, position, description, skills, projects});
    try {
      const response = await axios.post(`${BASE_URL}/api/skills`, {
        name,
        position,
        description,
        skills,
        projects,
      });

      console.log('Backend Response:', response.data);

      // Clear form fields
      setName('');
      setPosition('');
      setDescription('');
      setSkills([]);
      setCurrentSkill('');
      setProjects([{title: '', githubLink: ''}]);
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{paddingBottom: 20}}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag">
      {/* Form Fields */}
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Name"
      />
      <TextInput
        style={styles.input}
        value={position}
        onChangeText={setPosition}
        placeholder="Position"
      />
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
      />

      {/* Skills Section */}
      <Text style={styles.sectionTitle}>Skills:</Text>
      <View style={styles.skillInputContainer}>
        <TextInput
          style={[styles.input, styles.skillInput]}
          value={currentSkill}
          onChangeText={setCurrentSkill}
          placeholder="Add a skill"
        />
        <TouchableOpacity style={styles.addSkillButton} onPress={addSkill}>
          <Text style={styles.addSkillButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.skillsList}>
        {skills.map((skill, index) => (
          <TouchableOpacity
            key={index}
            style={styles.skill}
            onPress={() => removeSkill(index)}>
            <Text style={styles.skillText}>{skill}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Projects Section */}
      <Text style={styles.sectionTitle}>Projects:</Text>
      {projects.map((project, index) => (
        <View key={index} style={styles.projectInputContainer}>
          <TextInput
            style={styles.input}
            value={project.title}
            onChangeText={text => updateProject(index, 'title', text)}
            placeholder="Project Title"
          />
          <TextInput
            style={styles.input}
            value={project.githubLink}
            onChangeText={text => updateProject(index, 'githubLink', text)}
            placeholder="GitHub Link"
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.removeProjectButton}
            onPress={() => removeProject(index)}>
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
    marginBottom: 10,
    borderRadius: 5,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  skillInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillInput: {
    flex: 1,
    marginRight: 8,
  },
  addSkillButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  addSkillButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  skill: {
    backgroundColor: '#0DCAF0',
    borderRadius: 20,
    padding: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  skillText: {
    color: '#fff',
  },
  projectInputContainer: {
    marginBottom: 20,
  },
  removeProjectButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 10,
  },
});

export default SkillsForm;
