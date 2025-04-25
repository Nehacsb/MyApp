import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';

const RideDetailsScreen = ({ route, navigation }) => {
    const { rideId, isFromChat } = route.params;
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRideDetails = async () => {
            try {
                console.log('Fetching ride details for ID:', rideId); // Debugging
                const response = await axios.get(`http://192.168.236.117:5000/api/rides/${rideId}`);
                
                console.log('Ride details response:', response.data); // Debugging
                console.log("id:",response.data.rideId);
                // Properly extract and assign the ride data
                if (response.data && response.data.rideId) {
                    console.log("here");
                    const rideData = {
                        rideId: response.data.rideId,
                        source: response.data.source,
                        destination: response.data.destination,
                        date: response.data.date,
                        time: response.data.time,
                        maxCapacity: response.data.maxCapacity,
                        totalFare: response.data.totalFare,
                        passengers: response.data.passengers || [],
                        // Add any other necessary fields
                    };
                    setRide(rideData);
                } else {
                    setError('Ride data is invalid');
                }
            } catch (error) {
                console.error('Error fetching ride details:', error);
                setError('Failed to load ride details');
            } finally {
                setLoading(false);
            }
        };

        fetchRideDetails();
    }, [rideId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFB22C" />
                <Text>Loading ride details...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!ride) {
        return (
            <View style={styles.container}>
                <Text>No ride data available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ride Details</Text>
                {isFromChat && (
                    <TouchableOpacity onPress={() => navigation.navigate('Chat', { 
                        rideId, 
                        rideDetails: {
                            start: ride.source,
                            destination: ride.destination
                        }
                    })}>
                        <Icon name="message-text" size={24} color="#FFB22C" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                    <Icon name="map-marker" size={20} color="#FFB22C" />
                    <Text style={styles.detailText}>{ride.source} → {ride.destination}</Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Icon name="calendar" size={20} color="#FFB22C" />
                    <Text style={styles.detailText}>
                        {new Date(ride.date).toLocaleDateString()} at {ride.time}
                    </Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Icon name="account-group" size={20} color="#FFB22C" />
                    <Text style={styles.detailText}>
                        {ride.passengers.length}/{ride.maxCapacity} seats filled
                    </Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Icon name="cash" size={20} color="#FFB22C" />
                    <Text style={styles.detailText}>₹{ride.totalFare} total fare</Text>
                </View>
            </View>

            <Text style={styles.passengersTitle}>Passengers:</Text>
            <FlatList
                data={ride.passengers}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.passengerItem}>
                        <Icon name="account" size={24} color="#555" />
                        <Text style={styles.passengerName}>
                            {item.firstName} {item.lastName}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.noPassengers}>No passengers yet</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    detailsContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    detailText: {
        marginLeft: 10,
        fontSize: 16,
    },
    passengersTitle: {
        padding: 15,
        fontSize: 16,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    passengerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    passengerName: {
        marginLeft: 10,
        fontSize: 16,
    },
    noPassengers: {
        padding: 15,
        color: '#888',
        textAlign: 'center',
    },
});

export default RideDetailsScreen;