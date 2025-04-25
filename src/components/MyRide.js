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
    
        // Fetch rides data
        const [createdResponse, requestedResponse] = await Promise.all([
          axios.get('http://10.0.2.2:5000/api/rides', {
            params: { email: user.email },
            headers: { 'Content-Type': 'application/json' }
          }),
          axios.get('http://10.0.2.2:5000/api/request/requests', {
            params: { userEmail: user.email },
            headers: { 'Content-Type': 'application/json' }
          })
        ]);
    
        console.log('Fetched Rides:', createdResponse.data);
    
        // Format date and time helpers
        const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';
        const formatTime = (timeStr) => {
          if (!timeStr) return 'N/A';
          const [hours, minutes] = timeStr.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes} ${ampm}`;
        };
    
        // Filter created rides - check both email fields
        const formattedCreatedRides = createdResponse.data
          .filter(ride => 
            ride.email?.toLowerCase() === user.email?.toLowerCase() || 
            ride.createdBy?.email?.toLowerCase() === user.email?.toLowerCase()
          )
          .map(ride => ({
            id: ride._id,
            start: ride.source,
            destination: ride.destination,
            date: formatDate(ride.date),
            time: formatTime(ride.time),
            seatsLeft: ride.maxCapacity - (ride.passengers?.length || 0),
            fare: ride.totalFare || 0,
            status: 'Driver',
            type: 'created'
          }));
    
        console.log('Created Rides:', formattedCreatedRides);
    
        // Format requested rides
        const formattedRequestedRides = requestedResponse.data
          .filter(request => request.ride)
          .map(request => ({
            id: request._id,
            rideId: request.ride._id,
            start: request.ride.source || 'N/A',
            destination: request.ride.destination || 'N/A',
            date: formatDate(request.ride.date),
            time: formatTime(request.ride.time),
            seatsLeft: request.ride.maxCapacity - (request.ride.passengers?.length || 0),
            fare: request.ride.totalFare || 0,
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


  const handleWithdraw = async (ride) => {
    try {
      if (ride.type === 'created') {
        // Creator wants to withdraw from their own ride
        Alert.alert(
          'Withdraw from Ride',
          'Are you sure you want to withdraw from the ride you created?.',
          [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', onPress: () => creatorWithdraw(ride.id) }
          ]
        );
      } else {
        // Passenger wants to withdraw from a ride
        Alert.alert(
          'Withdraw from Ride',
          'Are you sure you want to withdraw from this ride?',
          [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', onPress: () => passengerWithdraw(ride) }
          ]
        );
      }
    } catch (error) {
      console.error('Error handling withdraw:', error);
      Alert.alert('Error', 'Failed to process withdrawal');
    }
  };

  const creatorWithdraw = async (rideId) => {
    try {
      const response = await axios.patch(
        `http://10.0.2.2:5000/api/rides/withdraw-creator/${rideId}`,
        { userEmail: user.email }
      );

      if (response.status === 200) {
        // Update local state
        if (response.data.rideDeleted) {
          // Ride was completely removed
          setRidesData(prev => ({
            ...prev,
            createdRides: prev.createdRides.filter(r => r.id !== rideId)
          }));
          Alert.alert('Success', 'Ride has been cancelled as there were no other passengers');
        } else {
          // Creator just removed themselves
          Alert.alert('Success', 'You have withdrawn from the ride');
          // Refresh the data
          fetchRides();
        }
      }
    } catch (error) {
      console.error('Error in creator withdrawal:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to withdraw from ride');
    }
  };

  const passengerWithdraw = async (ride) => {
    try {
      let response;
      if (ride.status === 'pending') {
        // Withdraw before acceptance
        response = await axios.delete(`http://10.0.2.2:5000/api/request/requests/${ride.id}`);
      } else {
        // Withdraw after acceptance
        response = await axios.patch(
          `http://10.0.2.2:5000/api/request/withdraw/${ride.rideId}`,
          { requestId: ride.id, seats: ride.seats, userEmail: user.email }
        );
      }

      if (response.status === 200 || response.status === 204) {
        // Update local state
        setRidesData(prev => ({
          ...prev,
          requestedRides: prev.requestedRides.filter(r => r.id !== ride.id)
        }));
        Alert.alert('Success', 'You have withdrawn from the ride');
      }
    } catch (error) {
      console.error('Error in passenger withdrawal:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to withdraw from ride');
    }
  };


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
      { }
      <View style={styles.actionButtonsContainer}>
        {(item.type === 'created' || item.status === 'accepted') && (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => navigateToChat(item)}
          >
            <Icon name="chat" size={20} color="#FFB22C" />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
        )}

        {/* Add Withdraw/Cancel Button */}
        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={() => handleWithdraw(item)}
        >
          <Icon
            name={item.type === 'created' ? 'account-remove' : 'account-remove'}
            size={20}
            color="#F44336"
          />
          <Text style={styles.withdrawButtonText}>
            {item.type === 'created' ? 'Withdraw' : 'Withdraw'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
    height: height * 0.4, // Adjust based on your header height
    paddingHorizontal: 8,
  },
  sectionHeader: {
    backgroundColor: '#FFDB58',
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
    height: 0.5,
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
    fontSize: 17,
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
    backgroundColor: '#F7FAFC',
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
    borderRadius: 8,
  },
  chatButtonText: {
    fontSize: 14,
    color: 'black',
    marginLeft: 4,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  withdrawButtonText: {
    fontSize: 14,
    color: '#F44336',
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default MyRides;