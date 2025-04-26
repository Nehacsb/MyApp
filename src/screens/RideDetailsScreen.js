import React, { useState, useEffect } from 'react';
import { View, Alert, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
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
                const response = await axios.get(`http://10.0.2.2:5000/api/rides/${rideId}`);
                if (response.data && response.data.data && response.data.data.rideId) {
                    const rideData = {
                        rideId: response.data.data.rideId,
                        source: response.data.data.source,
                        destination: response.data.data.destination,
                        date: response.data.data.date,
                        time: response.data.data.time,
                        maxCapacity: response.data.data.maxCapacity,
                        totalFare: response.data.data.totalFare,
                        passengers: response.data.data.passengers || [],
                    };
                    setRide(rideData);
                } else {
                    setError('Ride data is invalid');
                }
            } catch (error) {
                setError('Failed to load ride details');
            } finally {
                setLoading(false);
            }
        };

        fetchRideDetails();
    }, [rideId]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#FFB22C" />
                <Text style={styles.loadingText}>Loading ride details...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!ride) {
        return (
            <View style={styles.centered}>
                <Text>No ride data available</Text>
            </View>
        );
    }
    const groupedPassengers = ride.passengers.reduce((acc, passenger) => {
        if (acc[passenger.userId]) {
            acc[passenger.userId].count += 1;
        } else {
            acc[passenger.userId] = { ...passenger, count: 1 };
        }
        return acc;
    }, {});

    const uniquePassengers = Object.values(groupedPassengers);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ride Details</Text>
                {isFromChat && (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ChatFeature', {
                            rideId,
                            rideDetails: { start: ride.source, destination: ride.destination }
                        })}
                    >
                        <Icon name="message-text" size={26} color="#FFB22C" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Ride Details Section */}
            <View style={styles.detailsSection}>
                <DetailItem icon="map-marker" label="Route" text={`${ride.source} → ${ride.destination}`} />
                <DetailItem icon="calendar" label="Schedule" text={`${new Date(ride.date).toLocaleDateString()} at ${ride.time}`} />
                <DetailItem icon="account-group" label="Seats" text={`${ride.passengers.length}/${ride.maxCapacity} filled`} />
                <DetailItem icon="cash" label="Fare" text={`₹${ride.totalFare}`} />
            </View>

            {/* Passenger Section */}
            <Text style={styles.passengersTitle}>Passengers</Text>
            <FlatList
                data={uniquePassengers}
                keyExtractor={(item) => item.userId.toString()}
                renderItem={({ item }) => (
                    <View style={styles.passengerItem}>
                        <Icon name="account" size={24} color="#555" />
                        <View style={{ marginLeft: 10, flex: 1 }}>
                            <Text style={styles.passengerName}>{item.name}</Text>
                            <Text style={styles.seatsBooked}>Seats booked: {item.count}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => Alert.alert('Passenger Email', item.email)}
                        >
                            <Icon name="email" size={24} color="#FFB22C" />
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.noPassengers}>No passengers yet</Text>
                }
            />
        </View>
    );
};

const DetailItem = ({ icon, label, text }) => (
    <View style={styles.detailRow}>
        <Icon name={icon} size={22} color="#FFB22C" />
        <View style={{ marginLeft: 10 }}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailText}>{text}</Text>
        </View>
    </View>
);


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#888',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    seatsBooked: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    detailsSection: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    detailLabel: {
        fontSize: 14,
        color: '#888',
    },
    detailText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    passengersTitle: {
        marginTop: 30,
        marginBottom: 10,
        paddingHorizontal: 20,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    passengerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    passengerName: {
        marginLeft: 10,
        fontSize: 16,
    },
    noPassengers: {
        padding: 20,
        textAlign: 'center',
        color: '#888',
    },
});

export default RideDetailsScreen;
