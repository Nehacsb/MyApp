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
        console.log("Ride ID:", rideId);    
        navigation.setOptions({
            title: `${rideDetails.start} → ${rideDetails.destination}`,
            headerLeft: () => (
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 10 }}
                >
                    <Icon name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
            ),
            headerStyle: {
                backgroundColor: '#FFB22C', // Match your app's theme
                elevation: 0, // Remove shadow on Android
                shadowOpacity: 0, // Remove shadow on iOS
            },
            headerTintColor: '#999', // Color for title and back button
            headerTitleStyle: {
                fontWeight: 'bold',
                color: '#999',
            },
        });


        const fetchMessages = async () => {
            try {
                const response = await axios.get(`http://10.0.2.2:5000/api/chat/${rideId}`);
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
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
        const backgroundColor = isCurrentUser ? '#FFB22C' : getColorForUser(item.senderName);
        const textColor = isCurrentUser ? '#fff' : '#333';

        return (
            <View style={[
                styles.messageContainer,
                { 
                    alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                    backgroundColor,
                    borderBottomRightRadius: isCurrentUser ? 0 : 10,
                    borderBottomLeftRadius: isCurrentUser ? 10 : 0
                }
            ]}>
                {!isCurrentUser && (
                    <Text style={[styles.senderName, { color: textColor }]}>{item.senderName}</Text>
                )}
                <Text style={[styles.messageText, { color: textColor }]}>{item.content}</Text>
                <Text style={[styles.messageTime, { color: textColor }]}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
             <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Icon name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {rideDetails.start} → {rideDetails.destination}
                </Text>
                <View style={{ width: 24 }} /> {/* Spacer for alignment */}
            </View>

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
                        
                    />

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder="Type a message..."
                            placeholderTextColor="#999"
                            multiline
                        />
                        <TouchableOpacity 
                            style={styles.sendButton} 
                            onPress={handleSendMessage}
                            disabled={!newMessage.trim()}
                        >
                            <Icon 
                                name="send" 
                                size={24} 
                                color={newMessage.trim() ? "#FFB22C" : "#ccc"} 
                            />
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
        backgroundColor: '#FFF8F0',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messagesList: {
        padding: 15,
        paddingBottom: 5,
    },
    messageContainer: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    senderName: {
        fontWeight: 'bold',
        marginBottom: 4,
        fontSize: 12,
    },
    messageText: {
        fontSize: 16,
    },
    messageTime: {
        fontSize: 10,
        alignSelf: 'flex-end',
        marginTop: 4,
        opacity: 0.8,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        backgroundColor: '#FFF',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        maxHeight: 100,
        fontSize: 16,
        backgroundColor: '#FFF',
    },
    sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    backButton: {
        padding: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
});

export default ChatFeature;