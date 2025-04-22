import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, TextInput,
    TouchableOpacity, FlatList, Alert
} from 'react-native';
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
            headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('RidePeopleScreen', { rideId })}>
                    <Icon name="account-group" size={24} color="#fff" style={{ marginRight: 15 }} />
                </TouchableOpacity>
            ),
        });

        const fetchMessages = async () => {
            try {
                const response = await axios.get(`http://10.0.2.2:5000/api/chat/${rideId}`);
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages_feature:', error);
                Alert.alert('Error', 'Failed to load chat messages');
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [rideId]);

    const getColorForUser = (name) => {
        const colors = ['#FFB22C', '#91D8E4', '#FF6969', '#AEDB9D', '#9D9DF2'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        const fullName = `${user.firstName} ${user.lastName || ''}`.trim();

        try {
            const messageToSend = {
                rideId,
                content: newMessage,
                timestamp: new Date().toISOString(),
                senderId: user._id,
                senderName: fullName,
            };

            const tempId = Date.now().toString();
            setMessages(prev => [...prev, { ...messageToSend, _id: tempId }]);
            setNewMessage('');

            await axios.post(`http://10.0.2.2:5000/api/chat/${rideId}`, messageToSend);
            const response = await axios.get(`http://10.0.2.2:5000/api/chat/${rideId}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
        }
    };

    const renderMessage = ({ item }) => {
        const isCurrentUser = item.senderId === user._id;
        const backgroundColor = isCurrentUser
            ? '#FFB22C'
            : getColorForUser(item.senderName);

        return (
            <View style={[
                styles.messageContainer,
                { alignSelf: isCurrentUser ? 'flex-end' : 'flex-start', backgroundColor }
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
                    {/* Ride Info Header */}
                    {/* <TouchableOpacity
                        style={styles.rideInfoHeader}
                        onPress={() => navigation.navigate('RidePeopleScreen', { rideId, rideDetails })}
                    >
                        <View style={styles.rideInfoTextContainer}>
                            <Text style={styles.rideInfoLabel}>Ride:</Text>
                            <Text style={styles.rideInfoRoute}>{rideDetails.start} → {rideDetails.destination}</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color="#555" />
                    </TouchableOpacity> */}
                    <FlatList
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.messagesList}
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
        backgroundColor: '#FFF8F0', // Soft theme background
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
    rideInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#FFFBEF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    rideInfoTextContainer: {
        flexDirection: 'column',
    },
    rideInfoLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    rideInfoRoute: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    
});

export default ChatFeature;
