import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const PendingRequests = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchPendingRequests();
    }
  }, [user?.email]);

  const fetchPendingRequests = async () => {
    try {
      // Get rides created by this user
      const ridesResponse = await axios.get('http://10.0.2.2:5000/api/rides', {
        params: { email: user.email }
      });
      
      const rideIds = ridesResponse.data.map(ride => ride._id);
      
      // Get pending requests for these rides
      const requestsResponse = await axios.get('http://10.0.2.2:5000/api/request/requests', {
        params: { 
          rideIds: JSON.stringify(rideIds),
          status: 'pending'
        }
      });
      
      // Ensure we have an array of requests
      const requestsArray = Array.isArray(requestsResponse.data) ? 
        requestsResponse.data : 
        [];
      
      setRequests(requestsArray);
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to load requests. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddPassenger = async (rideId, userId, seats) => {
    try {
      console.log('Adding passenger:', { rideId, userId, seats });
      await axios.patch(
        `http://10.0.2.2:5000/api/request/${rideId}/add-passenger`,
        { userId, seats }
      );
    } catch (error) {
      console.error('Error adding passenger:', error);
      throw error;
    }
  };

  const handleRequestAction = async (requestId, action, rideId, userId, seats) => {
    try {
      // First update the request status
      const response = await axios.patch(
        `http://10.0.2.2:5000/api/request/requests/${requestId}`,
        { status: action }
      );
      
      console.log('Request status updated:', response.data);
      
      // If accepted, add the passenger(s)
      if (action === 'accepted') {
        console.log('Adding passenger:', { rideId, userId, seats });
        await handleAddPassenger(rideId, userId, seats);
      }

      Alert.alert(
        'Success', 
        `Request ${action} for ${seats} seat${seats !== 1 ? 's' : ''}`
      );
      fetchPendingRequests();
    } catch (error) {
      console.error('Error in handleRequestAction:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || `Failed to ${action} request`
      );
    }
  };

  const renderRequestItem = ({ item }) => {
    const seats = item.seats || 1; // Default to 1 if seats field doesn't exist
    
    return (
      <View style={styles.card}>
        <View style={styles.routeHeader}>
          <Text style={styles.routeText}>
            {item.ride.source} → {item.ride.destination}
          </Text>
          <View style={styles.seatsBadge}>
            <MaterialIcons name="event-seat" size={16} color="#FFFFFF" />
            <Text style={styles.seatsText}>{seats}</Text>
          </View>
        </View>
        
        <View style={styles.dateTimeContainer}>
          <MaterialIcons name="calendar-today" size={16} color="#A0AEC0" />
          <Text style={styles.dateTimeText}>
            {new Date(item.ride.date).toLocaleDateString()}
          </Text>
          <MaterialIcons name="access-time" size={16} color="#A0AEC0" style={styles.timeIcon} />
          <Text style={styles.dateTimeText}>{item.ride.time}</Text>
        </View>

        <View style={styles.requesterDetails}>
          <MaterialIcons name="person" size={16} color="#FFB22C" />
          <Text style={styles.requesterName}>
            {item.requester.firstName} {item.requester.lastName}
          </Text>
        </View>
        <View style={styles.requesterDetails}>
          <MaterialIcons name="email" size={16} color="#FFB22C" />
          <Text style={styles.requesterEmail}>{item.requester.email}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleRequestAction(
              item._id, 
              'accepted',
              item.ride._id,
              item.requester._id,
              seats
            )}
          >
            <Text style={styles.actionButtonText}>Accept ({seats})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRequestAction(item._id, 'rejected')}
          >
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
    
      <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFB22C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incoming Requests</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <MaterialIcons name="hourglass-empty" size={32} color="#A0AEC0" />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="check-circle" size={32} color="#A0AEC0" />
          <Text style={styles.noRequestsText}>No pending requests</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2937',
  },
  list: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  routeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  seatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB22C',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  seatsText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  timeIcon: {
    marginLeft: 16,
  },
  requesterDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requesterName: {
    fontSize: 15,
    color: '#1F2937',
    marginLeft: 8,
  },
  requesterEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
  acceptButton: {
    borderColor: '#10B981',
  },
  rejectButton: {
    borderColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  noRequestsText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default PendingRequests;