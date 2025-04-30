import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    View, Text, StyleSheet, TextInput,
    TouchableOpacity, FlatList, Alert,
    ImageBackground, StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {LinearGradient} from 'react-native-linear-gradient';

// Background image - you'll need to add this to your assets folder
// const backgroundImage = require('../../assets/Wallpaper.jpg');

const ChatFeature = ({ route, navigation }) => {
    const { rideId, rideDetails } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const flatListRef = useRef(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [hasNewMessage, setHasNewMessage] = useState(false);

    useEffect(() => {
        navigation.setOptions({
            headerShown: false
        });

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [rideId]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        const fullName = `${user.firstName} ${user.lastName || ''}`.trim();
    
        const messageToSend = {
            rideId,
            content: newMessage,
            timestamp: new Date().toISOString(),
            senderId: user._id,
            senderName: fullName,
        };
    
        setNewMessage('');
    
        try {
            await axios.post(`https://myapp-hu0i.onrender.com/api/chat/${rideId}`, messageToSend);
            // don't manually add message now
            // it will come from fetchMessages()
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
        }
    };
    
    const fetchMessages = async () => {
        try {
            const response = await axios.get(`https://myapp-hu0i.onrender.com/api/chat/${rideId}`);
    
            setMessages(prevMessages => {
                const existingIds = new Set(prevMessages.map(msg => msg._id));
                const newUniqueMessages = response.data.filter(msg => !existingIds.has(msg._id));
    
                if (newUniqueMessages.length > 0) {
                    if (!isAtBottom) {
                        setHasNewMessage(true); // User is reading old messages -> Show popup
                    }
                    return [...prevMessages, ...newUniqueMessages];
                }
                return prevMessages;
            });
    
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleScroll = (event) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 20; // 20px tolerance
        const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
        if (isBottom !== isAtBottom) {
            setIsAtBottom(isBottom);
        }
        
        if (isBottom) {
            setHasNewMessage(false); // hide popup if at bottom
        }
    };
    
    const showRideDetails = () => {
        navigation.navigate('RideDetails', {
            rideId,
            rideDetails,
            isFromChat: true
        });
    };

    const renderMessage = ({ item }) => {
        if (item.isSystemMessage) {
            return (
                <View style={styles.systemMessageContainer}>
                    <Text style={styles.systemMessageText}>{item.content}</Text>
                </View>
            );
        }

        const isCurrentUser = item.senderId === user._id;
        const messageTime = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <View style={[
                styles.messageRow,
                {
                    justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                }
            ]}>
                {!isCurrentUser && (
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {item.senderName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                
                <View style={[
                    styles.messageContainer,
                    isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
                ]}>
                    {!isCurrentUser && (
                        <Text style={styles.senderName}>{item.senderName}</Text>
                    )}
                    <Text style={[
                        styles.messageText,
                        isCurrentUser ? styles.currentUserText : styles.otherUserText
                    ]}>
                        {item.content}
                    </Text>
                    <Text style={[
                        styles.messageTime,
                        isCurrentUser ? styles.currentUserTime : styles.otherUserTime
                    ]}>
                        {messageTime}
                    </Text>
                </View>
                
                {isCurrentUser && (
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {user.firstName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (            
            <View style={styles.container}>
                {/* Custom Header */}
                <LinearGradient 
                    colors={['#50ABE7', '#6cbde9']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.header}
                >
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" size={24} color="#FFF" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.headerTitleContainer} onPress={showRideDetails}>
                        <Icon name="map-marker-path" size={20} color="#FFF" style={styles.headerIcon} />
                        <Text style={styles.headerTitle}>
                            {rideDetails.start} → {rideDetails.destination}
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={showRideDetails} style={styles.infoButton}>
                        <Icon name="information-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                </LinearGradient>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading messages...</Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.messagesList}
                            onScroll={handleScroll}
                            onContentSizeChange={() => {
                                if (isAtBottom) {
                                    flatListRef.current?.scrollToEnd({ animated: true });
                                }
                            }}
                        />
                        
                        {hasNewMessage && (
                            <TouchableOpacity
                                onPress={() => {
                                    flatListRef.current?.scrollToEnd({ animated: true });
                                    setHasNewMessage(false);
                                }}
                                style={styles.newMessageBanner}
                            >
                                <Icon name="chevron-down" size={18} color="#fff" />
                                <Text style={styles.newMessageText}>New Message</Text>
                            </TouchableOpacity>
                        )}

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
                                style={[
                                    styles.sendButton,
                                    newMessage.trim() ? styles.sendButtonActive : {}
                                ]}
                                onPress={handleSendMessage}
                                disabled={!newMessage.trim()}
                            >
                                <Icon
                                    name="send"
                                    size={22}
                                    color={newMessage.trim() ? "#FFF" : "#ccc"}
                                />
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
    },
    container: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 12,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    backButton: {
        padding: 6,
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerIcon: {
        marginRight: 6,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
    },
    infoButton: {
        padding: 6,
    },
    messagesList: {
        padding: 15,
        paddingBottom: 10,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    avatarContainer: {
        height: 36,
        width: 36,
        borderRadius: 18,
        backgroundColor: '#87ceeb',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 6,
    },
    avatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    messageContainer: {
        maxWidth: '70%',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    currentUserMessage: {
        backgroundColor: '#87ceeb',
        borderBottomRightRadius: 4,
    },
    otherUserMessage: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
    },
    senderName: {
        fontWeight: 'bold',
        marginBottom: 4,
        fontSize: 12,
        color: '#555',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    currentUserText: {
        color: '#FFFFFF',
    },
    otherUserText: {
        color: '#333333',
    },
    messageTime: {
        fontSize: 10,
        alignSelf: 'flex-end',
        marginTop: 4,
        opacity: 0.8,
    },
    currentUserTime: {
        color: '#FFFFFF',
    },
    otherUserTime: {
        color: '#777777',
    },
    systemMessageContainer: {
        alignSelf: 'center',
        backgroundColor: 'rgba(245, 245, 245, 0.9)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        marginVertical: 8,
        elevation: 1,
    },
    systemMessageText: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
    },
    newMessageBanner: {
        backgroundColor: '#50ABE7',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        position: 'absolute',
        bottom: 80,
        alignSelf: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    newMessageText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 10,
        maxHeight: 100,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
    },
    sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F0F0',
    },
    sendButtonActive: {
        backgroundColor: '#50ABE7',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
});

export default ChatFeature;