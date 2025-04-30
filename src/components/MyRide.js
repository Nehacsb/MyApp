import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Color Theme Constants
const COLORS = {
  primary: '#50ABE7',        // Primary blue color
  secondary: '#6CBDE9',      // Secondary blue color
  accent: '#87CEEB',         // Light blue accent
  background: '#F5F7FA',     // Light background
  card: '#FFFFFF',           // Card background
  text: {
    primary: '#333333',      // Primary text
    secondary: '#666666',    // Secondary text 
    placeholder: '#999999',  // Placeholder text
    inverse: '#FFFFFF',      // Text on dark backgrounds
  },
  border: '#E5EBF0',         // Border color
  status: {
    success: '#4CAF50',      // Green for success status
    warning: '#FFA726',      // Orange for pending status
    error: '#F44336',        // Red for rejected status
    default: '#A0AEC0',      // Gray for default status
  },
};

const MyRides = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('created');
  const [ridesData, setRidesData] = useState({ createdRides: [], requestedRides: [] });
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchRides();
  }, [user?.email]);

  const fetchRides = async () => {
    try {
      if (!user?.email) {
        Alert.alert('Error', 'User email not available');
        return;
      }
  
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
  
      const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('en-GB') : 'N/A';
      const formatTime = (timeStr) => {
        if (!timeStr) return 'N/A';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
      };

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
          datetime: new Date(ride.date),
          seatsLeft: ride.maxCapacity - (ride.passengers?.length || 0),
          fare: ride.totalFare || 0,
          status: 'Driver',
          type: 'created'
        })).sort((a, b) => b.datetime - a.datetime)
        .map(({ datetime, ...rest }) => rest);
  
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
        })).sort((a, b) => b.datetime - a.datetime) // Sort by datetime (newest first)
        .map(({ datetime, ...rest }) => rest);
  
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
        Alert.alert(
          'Withdraw from Ride',
          'Are you sure you want to withdraw from the ride you created?',
          [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', onPress: () => creatorWithdraw(ride.id) }
          ]
        );
      } else {
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
        if (response.data.rideDeleted) {
          setRidesData(prev => ({
            ...prev,
            createdRides: prev.createdRides.filter(r => r.id !== rideId)
          }));
          Alert.alert('Success', 'Ride has been cancelled as there were no other passengers');
        } else {
          Alert.alert('Success', 'You have withdrawn from the ride');
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
        response = await axios.delete(`http://10.0.2.2:5000/api/request/requests/${ride.id}`);
      } else {
        response = await axios.patch(
          `http://10.0.2.2:5000/api/request/withdraw/${ride.rideId}`,
          { requestId: ride.id, seats: ride.seats, userEmail: user.email }
        );
      }

      if (response.status === 200 || response.status === 204) {
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
      case 'accepted': return COLORS.status.success;
      case 'pending': return COLORS.status.warning;
      case 'rejected': return COLORS.status.error;
      default: return COLORS.status.default;
    }
  };

  const renderRideCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.routeText}>{item.start} → {item.destination}</Text>
      <View style={styles.infoRow}>
        <Icon name="calendar" size={16} color={COLORS.primary} />
        <Text style={styles.infoText}>{item.date}</Text>
        <Icon name="clock" size={16} color={COLORS.primary} style={{ marginLeft: 10 }} />
        <Text style={styles.infoText}>{item.time}</Text>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.priceText}>₹{item.fare}</Text>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {formatStatus(item.status)}
        </Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.chatButton]} 
          onPress={() => navigateToChat(item)}
        >
          <Icon name="chat" size={16} color={COLORS.text.primary} />
          <Text style={styles.chatText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.withdrawButton]}
          onPress={() => handleWithdraw(item)}
        >
          <Text style={styles.withdrawText}>
            {item.type === 'created' ? 'Withdraw' : 'Withdraw'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Rides</Text>
        <View style={{ width: 24 }} /> {/* For balance */}
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity 
          style={[styles.tabButton, selectedTab === 'created' && styles.activeTab]} 
          onPress={() => setSelectedTab('created')}
        >
          <Text style={[styles.tabText, selectedTab === 'created' && styles.activeTabText]}>
            Created Rides ({ridesData.createdRides.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, selectedTab === 'requested' && styles.activeTab]} 
          onPress={() => setSelectedTab('requested')}
        >
          <Text style={[styles.tabText, selectedTab === 'requested' && styles.activeTabText]}>
            Requested Rides ({ridesData.requestedRides.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={selectedTab === 'created' ? ridesData.createdRides : ridesData.requestedRides}
        renderItem={renderRideCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 50 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="car-off" size={40} color={COLORS.status.default} />
            <Text style={styles.emptyText}>
              No {selectedTab === 'created' ? 'created' : 'requested'} rides found
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: COLORS.text.primary 
  },
  tabRow: { 
    flexDirection: 'row', 
    marginHorizontal: 16, 
    marginVertical: 12 
  },
  tabButton: { 
    flex: 1, 
    paddingVertical: 12,
    backgroundColor: COLORS.background, 
    borderRadius: 8, 
    marginHorizontal: 4, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeTab: { 
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  tabText: { 
    fontSize: 14, 
    color: COLORS.text.secondary, 
    fontWeight: '500' 
  },
  activeTabText: { 
    color: COLORS.text.inverse, 
    fontWeight: '600' 
  },
  card: { 
    backgroundColor: COLORS.card, 
    borderRadius: 12, 
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16, 
    marginVertical: 8, 
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  routeText: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 10, 
    color: COLORS.text.primary 
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  infoText: { 
    marginLeft: 4, 
    color: COLORS.text.secondary, 
    fontSize: 14 
  },
  bottomRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  priceText: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: COLORS.primary 
  },
  statusText: { 
    fontSize: 14, 
    fontWeight: '600' 
  },
  buttonRow: { 
    flexDirection: 'row', 
    marginTop: 12, 
    justifyContent: 'space-between'
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 0,
  },
  chatButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.accent,
    marginRight: 10 
  },
  chatText: { 
    marginLeft: 6, 
    fontWeight: '600',
    color: COLORS.text.primary
  },
  withdrawButton: { 
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  withdrawText: { 
    color: COLORS.text.primary, 
    fontWeight: '600', 
    
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    marginTop: 10,
    color: COLORS.text.secondary,
    fontSize: 16
  }
});

export default MyRides;