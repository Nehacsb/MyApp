import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');
const SECTION_HEIGHT = height * 0.4;

const MyRides = () => {
  const navigation = useNavigation();
  const [ridesData, setRidesData] = useState({
    createdRides: [],
    requestedRides: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        if (!user?.email) {
          Alert.alert('Error', 'User email not available');
          return;
        }

        // Fetch rides created by user
        const createdResponse = await axios.get('http://192.168.236.117:5000/api/rides', {
          params: { email: user.email },
          headers: { 'Content-Type': 'application/json' }
        });

        // Fetch rides requested by user
        const requestedResponse = await axios.get('http://192.168.236.117:5000/api/request/requests', {
          params: { userEmail: user.email },
          headers: { 'Content-Type': 'application/json' }
        });

        // Format created rides
        const formattedCreatedRides = createdResponse.data.map(ride => ({
          id: ride._id,
          start: ride.source,
          destination: ride.destination,
          date: ride.date ? new Date(ride.date).toLocaleDateString() : 'N/A',
          time: ride.time || 'N/A',
          seatsLeft: ride.maxCapacity - (ride.passengers?.length || 0),
          fare: ride.totalFare || 0,
          status: 'Driver',
          type: 'created'
        }));

        // Format requested rides
        const formattedRequestedRides = requestedResponse.data.map(request => ({
          id: request._id,
          rideId: request.ride?._id,
          start: request.ride?.source || 'N/A',
          destination: request.ride?.destination || 'N/A',
          date: request.ride?.date ? new Date(request.ride.date).toLocaleDateString() : 'N/A',
          time: request.ride?.time || 'N/A',
          seatsLeft: request.ride ? (request.ride.maxCapacity - (request.ride.passengers?.length || 0)) : 0,
          fare: request.ride?.totalFare || 0,
          status: request.status || 'pending',
          type: 'requested'
        }));

        setRidesData({
          createdRides: formattedCreatedRides,
          requestedRides: formattedRequestedRides
        });
      } catch (error) {
        console.error('Error fetching rides:', error);
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Failed to load rides. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [user?.email]);

  const navigateToChat = (ride) => {
    if (ride.type === 'created' || ride.status === 'accepted') {
      navigation.navigate('ChatFeature', {
        rideId: ride.type === 'created' ? ride.id : ride.rideId,
        rideDetails: {
          start: ride.start,
          destination: ride.destination,
          date: ride.date,
          time: ride.time
        }
      });
    } else {
      Alert.alert('Chat Unavailable', 'Chat is only available for rides you created or confirmed rides.');
    }
  };

  const renderRideCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.routeText}>{item.start} → {item.destination}</Text>
        <View style={styles.seatContainer}>
          <Icon name="seat-passenger" size={18} color="#FFB22C" />
          <Text style={styles.seatText}>{item.seatsLeft} seats left</Text>
        </View>
      </View>

      <View style={styles.middleRow}>
        <Icon name="calendar" size={16} color="#A0AEC0" />
        <Text style={styles.dateText}>{item.date}</Text>
        <Icon name="clock" size={16} color="#A0AEC0" style={styles.timeIcon} />
        <Text style={styles.dateText}>{item.time}</Text>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.fareText}>₹{item.fare}</Text>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {formatStatus(item.status)}
        </Text>
      </View>

      {(item.type === 'created' || item.status === 'accepted') && (
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => navigateToChat(item)}
        >
          <Icon name="chat" size={20} color="#FFB22C" />
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const formatStatus = (status) => {
    switch (status) {
      case 'Driver': return 'Your Ride';
      case 'accepted': return 'Confirmed';
      case 'pending': return 'Pending Approval';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Driver':
      case 'accepted': return '#4CAF50';
      case 'pending': return '#FFC107';
      case 'rejected': return '#F44336';
      default: return '#A0AEC0';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#FFB22C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Rides</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your rides...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFB22C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rides</Text>
      </View>

      {/* Created Rides Section (Top Half) */}
      <View style={[styles.sectionContainer, { height: SECTION_HEIGHT }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Rides You Created</Text>
        </View>
        {ridesData.createdRides.length > 0 ? (
          <FlatList
            data={ridesData.createdRides}
            renderItem={renderRideCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="car-off" size={40} color="#A0AEC0" />
            <Text style={styles.noDataText}>No rides created</Text>
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Requested Rides Section (Bottom Half) */}
      <View style={[styles.sectionContainer, { height: SECTION_HEIGHT }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Rides You Requested</Text>
        </View>
        {ridesData.requestedRides.length > 0 ? (
          <FlatList
            data={ridesData.requestedRides}
            renderItem={renderRideCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="car-off" size={40} color="#A0AEC0" />
            <Text style={styles.noDataText}>No ride requests</Text>
          </View>
        )}
      </View>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionContainer: {
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A202C',
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  halfSection: {
    flex: 1,
    height: height * 0.8, // Adjust based on your header height
    paddingHorizontal: 8,
  },
  sectionHeader: {
    backgroundColor: '#FFB22C',
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  routeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  seatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 5,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 5,
  },
  timeIcon: {
    marginLeft: 15,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFB22C',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#718096',
    marginTop: 10,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 8,
  },
  noDataText: {
    fontSize: 16,
    color: '#A0AEC0',
    marginTop: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  chatButtonText: {
    fontSize: 14,
    color: '#FFB22C',
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default MyRides;