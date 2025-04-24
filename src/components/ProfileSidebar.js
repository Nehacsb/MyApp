import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';

const ProfileSidebar = ({ onClose }) => {
    const { user, logout } = useContext(AuthContext);

    return (
        <View style={styles.sidebar}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>


            {/* Profile Picture and Name */}
            <View style={styles.profileHeader}>
                <Icon name="account-circle" size={60} color="#FFA500" />
                <Text style={styles.name}>
                    {user?.firstName ?? 'First'} {user?.lastName ?? 'Last'}
                </Text>
                <Text style={styles.email}>{user?.email ?? 'Email not available'}</Text>
            </View>


            {/* Horizontal Info Rows */}
            <View style={styles.infoRow}>
                <Icon name="email" size={20} color="#555" />
                <Text style={styles.infoText}>{user?.email ?? 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
                <Icon name="phone" size={20} color="#555" />
                <Text style={styles.infoText}>{user?.phoneNumber ?? 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
                <Icon name="person" size={20} color="#555" />
                <Text style={styles.infoText}>{user?.gender ?? 'N/A'}</Text>
            </View>

            {/* Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.button}>
                    <Icon name="edit" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={logout}>
                    <Icon name="logout" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
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
    email: {
        fontSize: 14,
        color: '#888',
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
        backgroundColor: '#FFA500',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
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
      
});

export default ProfileSidebar;
