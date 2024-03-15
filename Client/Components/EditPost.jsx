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
        padding: 20,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        borderWidth: 2,
        borderColor: '#1da1f2',
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginBottom: 20,
        fontSize: 18,
        color: '#333',
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
});


export default EditForm;
