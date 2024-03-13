import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import Config from 'react-native-config';

const EditForm = ({ route, navigation }) => {
    const BASE_URL = Config.BASE_URL;
    const { postToEdit } = route.params;
    const [editedContent, setEditedContent] = useState(postToEdit.content);

    const handleEditPost = async () => {
        try {
            const response = await axios.put(`${BASE_URL}/api/thread/threads/edit/${postToEdit.id}`, {
                content: editedContent,
            });

            if (response.status === 200) {
                // Post edited successfully, update the posts state or take appropriate action
                navigation.goBack(); // Navigate back to the previous screen
            }
        } catch (error) {
            console.error('Error editing post:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text>Edit Post</Text>
            <TextInput
                style={styles.input}
                multiline
                numberOfLines={4}
                value={editedContent}
                onChangeText={setEditedContent}
                placeholder="Edit your post..."
            />
            <Button title="Save Changes" onPress={handleEditPost} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#ffffff',
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        padding: 10,
        marginBottom: 16,
    },
});

export default EditForm;
