import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ChatFeature = ({ route, navigation }) => {
    const { rideId, rideDetails } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        navigation.setOptions({
            title: `${rideDetails.start} → ${rideDetails.destination}`,
        });
        console.log('Ride ID:', rideId);
        console.log('Ride Details:', rideDetails);
      
        const fetchMessages = async () => {
            console.log('Fetching messages for ride ID:', rideId);
            try {
                const response = await axios.get(`http://10.0.2.2:5000/api/chat/${rideId}`);
                setMessages(response.data);
                console.log('Fetched messages:', response.data);
            } catch (error) {
                console.error('Error fetching messages_feature:', error);
                Alert.alert('Error', 'Failed to load chat messages');
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [rideId]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const messageToSend = {
                rideId,
                content: newMessage,
                timestamp: new Date().toISOString(),
                senderId: user._id,       // From your AuthContext
                senderName: user.name
            };

            // Optimistic UI update
            setMessages(prev => [...prev, {
                ...messageToSend,
                senderId: user._id,
                senderName: user.name,
                _id: Date.now().toString() // temporary ID
            }]);
            setNewMessage('');

            // Send to server
            await axios.post(`http://10.0.2.2:5000/api/chat/${rideId}`, {
                content: newMessage
            });

            // Refetch messages to get the actual data from server
            const response = await axios.get(`http://10.0.2.2:5000/api/chat/${rideId}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
            // Revert optimistic update
            setMessages(prev => prev.filter(m => m._id !== Date.now().toString()));
        }
    };

    const renderMessage = ({ item }) => {
        const isCurrentUser = item.senderId === user._id;

        return (
            <View style={[
                styles.messageContainer,
                isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
            ]}>
                {!isCurrentUser && (
                    <Text style={styles.senderName}>{item.senderName}</Text>
                )}
                <Text style={styles.messageText}>{item.content}</Text>
                <Text style={styles.messageTime}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text>Loading messages...</Text>
                </View>
            ) : (
                <>
                    <FlatList
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.messagesList}
                        inverted
                    />
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder="Type a message..."
                            multiline
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                            <Icon name="send" size={24} color="#FFB22C" />
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messagesList: {
        padding: 10,
    },
    messageContainer: {
        maxWidth: '80%',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    currentUserMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#FFB22C',
        borderTopRightRadius: 0,
    },
    otherUserMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 0,
    },
    senderName: {
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#333',
    },
    messageText: {
        color: '#333',
    },
    messageTime: {
        fontSize: 10,
        color: '#666',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        backgroundColor: '#FFF',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        maxHeight: 100,
    },
    sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatFeature;