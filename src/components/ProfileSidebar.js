import React, { useContext, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';




const ProfileSidebar = ({ navigation, onClose }) => {
    const { user, logout } = useContext(AuthContext);
    
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
    infoCard: {
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
    },
    
});
export default ProfileSidebar;