import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const navigation = useNavigation(); 

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>

            {/* Profile Icon + Name */}
            <View style={styles.iconSection}>
                <Icon name="account-circle" size={100} color="#FFA500" />
                <Text style={styles.name}>
                    {user?.firstName ?? 'First'} {user?.lastName ?? 'Last'}
                </Text>
                <Text style={styles.email}>{user?.email ?? 'Email not available'}</Text>
            </View>

            {/* Info Grid */}
            <View style={styles.infoSection}>
                <View style={styles.infoCard}>
                    <Icon name="email" size={20} color="#1C1C1E" />
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user?.email ?? 'N/A'}</Text>
                </View>

                <View style={styles.infoCard}>
                    <Icon name="phone" size={20} color="#1C1C1E" />
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{user?.phoneNumber ?? 'N/A'}</Text>
                </View>

                <View style={styles.infoCard}>
                    <Icon name="person" size={20} color="#1C1C1E" />
                    <Text style={styles.infoLabel}>Gender</Text>
                    <Text style={styles.infoValue}>{user?.gender ?? 'N/A'}</Text>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.button}>
                    <Icon name="edit" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={logout}>
                    <Icon name="logout" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 16,
        zIndex: 10,
        padding: 6,
    },
    iconSection: {
        alignItems: 'center',
        marginTop: 60, // to make room for back button
        marginBottom: 16,
    },
    name: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1C1C1E',
        marginTop: 8,
    },
    email: {
        fontSize: 14,
        color: '#6e6e6e',
        marginTop: 2,
    },
    infoSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    infoCard: {
        backgroundColor: '#ffffff',
        width: '30%',
        padding: 12,
        borderRadius: 10,
        elevation: 3,
        alignItems: 'center',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 8,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1C1C1E',
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#FFA500',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 6,
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        marginLeft: 6,
    },
});

export default Profile;
