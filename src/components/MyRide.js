import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SectionList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MyRides = ({ onBack }) => {
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

        console.log("Fetching rides for user:", user.email); // Debugging
        const createdResponse = await axios.get('http://10.0.2.2:5000/api/rides', {
          params: { email: user.email },
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('Fetched Created Rides:', createdResponse.data); // Debugging
        // Fetch rides requested by user
        const requestedResponse = await axios.get('http://10.0.2.2:5000/api/request/requests', {
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
  }, [user.email]);

  // Prepare data for SectionList
  const sections = [
    {
      title: 'Rides You Created',
      data: ridesData.createdRides,
    },
    {
      title: 'Rides You Requested',
      data: ridesData.requestedRides,
    }
  ];

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

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFB22C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rides</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your rides...</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderRideCard}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="car-off" size={40} color="#A0AEC0" />
              <Text style={styles.noDataText}>No rides found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 8,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A202C',
  },
  list: {
    paddingBottom: 20,
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
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#718096',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noDataText: {
    fontSize: 16,
    color: '#A0AEC0',
    marginTop: 10,
  },
});


export default MyRides;