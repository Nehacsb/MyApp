import React, { useContext, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';
import { BlurView } from '@react-native-community/blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const features = [
    { id: '1', icon: 'add-circle-outline', title: 'Create Ride', description: 'Easily create a ride and invite others to join!' },
    { id: '2', icon: 'search', title: 'Find Ride', description: 'Quickly find available rides matching your route.' },
    { id: '3', icon: 'directions-car', title: 'My Rides', description: 'View and manage your created and joined rides.' },
    { id: '4', icon: 'pending-actions', title: 'Pending Requests', description: 'Manage incoming and outgoing ride requests.' },
    { id: '5', icon: 'chat', title: 'Chat Feature', description: 'Chat with fellow riders in My Rides' },
];

const ProfileSidebar = ({ navigation, onClose }) => {
    const { user, logout } = useContext(AuthContext);
    const [aboutVisible, setAboutVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    useEffect(() => {
        const showAboutOnce = async () => {
            const hasSeen = await AsyncStorage.getItem('hasSeenAboutApp');
            if (hasSeen !== 'true') {
                setAboutVisible(true);
                await AsyncStorage.setItem('hasSeenAboutApp', 'true');
            }
        };
        showAboutOnce();
    }, []);

    const renderFeatureCard = ({ item }) => (
        <View style={styles.card}>
            <Icon name={item.icon} size={50} color="#6cbde9" />
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>
                {item.description}
            </Text>
        </View>
    );
    const handleScroll = (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
        setCurrentIndex(index);
    };

    const handleOpenModal = () => {
        setCurrentIndex(0); // Reset to first card
        if (flatListRef.current) {
            flatListRef.current.scrollToIndex({ index: 0, animated: false });
        }
        setAboutVisible(true);
    };

    return (
        <View style={styles.sidebar}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#50ABE7" />
            </TouchableOpacity>

            {/* Profile Picture and Name */}
            <View style={styles.profileHeader}>
            <Icon name="account-circle" size={60} color="#6cbde9" />
                <Text style={styles.name}>
                    {user?.firstName ?? 'First'} {user?.lastName ?? 'Last'}
                </Text>
            </View>

            {/* Info Rows */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                <Icon name="email" size={20} color="#6cbde9" />
                    <Text style={styles.infoText}>{user?.email ?? 'N/A'}</Text>
                </View>
            </View>
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                <Icon name="phone" size={20} color="#6cbde9" />
                    <Text style={styles.infoText}>{user?.phoneNumber ?? 'N/A'}</Text>
                </View>
            </View>
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                <Icon name="person" size={20} color="#6cbde9" />
                    <Text style={styles.infoText}>{user?.gender ?? 'N/A'}</Text>
                </View>
            </View>

            {/* About the App Row */}
           

            <TouchableOpacity style={styles.infoRow} onPress={() => navigation.navigate('AboutUs')}>
            <View style={styles.infoCard}>
                <Icon name="group" size={20} color="#6cbde9" />
            <Text style={[styles.infoText, { fontWeight: '400' }]}>  About Us</Text>
            </View>
            </TouchableOpacity>


            {/* Action Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfile')}>
                    <Icon name="edit" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={logout}>
                    <Icon name="logout" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* About Modal */}
            <Modal visible={aboutVisible} animationType="fade" transparent>
                <BlurView style={styles.blurView} blurType="light" blurAmount={10} reducedTransparencyFallbackColor="white">
                    <View style={styles.modalContent}>
                        <FlatList
                            ref={flatListRef}
                            data={features}
                            renderItem={renderFeatureCard}
                            keyExtractor={(item) => item.id}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            initialScrollIndex={0}
                            getItemLayout={(data, index) => ({
                                length: width * 0.75,
                                offset: width * 0.75 * index,
                                index,
                            })}
                        />
                        {/* Pagination Dots */}
                        <View style={styles.pagination}>
                            {features.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.dot,
                                        currentIndex === index ? styles.activeDot : styles.inactiveDot,
                                    ]}
                                />
                            ))}
                        </View>
                        <View style={styles.skipButtonContainer}>
                            <TouchableOpacity style={styles.skipButton} onPress={() => setAboutVisible(false)}>
                                <Text style={styles.skipButtonText}>Skip</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>
        </View >
    );
};

const styles = StyleSheet.create({
    sidebar: {
        width: 240,
        padding: 16,
        backgroundColor: '#fff',
        borderRightWidth: 1,
        borderColor: '#eee',
        borderRadius: 10,
        height: '100%',
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 8,
        color: '#333',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    infoText: {
        fontSize: 15,
        color: '#333',
    },
    actions: {
        marginTop: 'auto',
        gap: 10,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#6cbde9',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutButton: {
        backgroundColor: '#6cbde9',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        marginLeft: 6,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        padding: 4,
    },
    blurView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        height: 320,
        width: width * 0.85,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    card: {
        width: width * 0.75,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 20,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 12,
        color: '#333',
    },
    cardDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 10,
        width: '100%',
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#FFA500',
    },
    inactiveDot: {
        backgroundColor: '#ccc',
    },
    skipButtonContainer: {
        width: '100%',
        alignItems: 'flex-end',
        paddingLeft: 20,
        marginTop: 12,
    },
    skipButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: '#FFA500',
        borderRadius: 20,
    },
    skipButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    infoCard: {
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    
});
export default ProfileSidebar;