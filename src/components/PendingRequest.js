import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const PendingRequests = ({ onBack }) => {
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
      console.log("Fetching requests for user:", user.email);
      
      // Get rides created by this user
      const ridesResponse = await axios.get('http://myapp-production-4538.up.railway.app/api/rides', {
        params: { email: user.email }
      });

      console.log('Fetched Rides:', ridesResponse.data); // Debugging
      
      
      const rideIds = ridesResponse.data.map(ride => ride._id);
      
      // Get pending requests for these rides
      const requestsResponse = await axios.get('http://myapp-production-4538.up.railway.app/api/request/requests', {
        params: { 
          rideIds: JSON.stringify(rideIds),
          status: 'pending'
        }
      });
      
      setRequests(requestsResponse.data);
    } catch (error) {
      console.error('Fetch error:', {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      Alert.alert('Error', 'Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      // Update request status
      await axios.patch(`http://10.0.2.2:5000/api/request/requests/${requestId}`, {
        status: action
      });
      
      // If accepted, update ride passengers
      if (action === 'accepted') {
        const request = requests.find(r => r._id === requestId);
        await axios.patch(`http://10.0.2.2:5000/api/request/${request.ride._id}/add-passenger`, {
          userId: request.requester._id
        });
      }
      
      Alert.alert('Success', `Request ${action}`);
      fetchPendingRequests(); // Refresh the list
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      Alert.alert('Error', `Failed to ${action} request`);
    }
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.routeText}>
        {item.ride.source} → {item.ride.destination}
      </Text>
      
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
          onPress={() => handleRequestAction(item._id, 'accepted')}
        >
          <Text style={styles.actionButtonText}>Accept</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFB22C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incoming Requests</Text>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading requests...</Text>
      ) : requests.length === 0 ? (
        <Text style={styles.noRequestsText}>No pending requests</Text>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2E',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 16,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#2C3E50',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  routeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#A0AEC0',
    marginLeft: 8,
  },
  timeIcon: {
    marginLeft: 16,
  },
  requesterDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requesterName: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  requesterEmail: {
    fontSize: 14,
    color: '#A0AEC0',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: '#1E1E2E',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  acceptButton: {
    borderColor: '#4CAF50',
  },
  rejectButton: {
    borderColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
  noRequestsText: {
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PendingRequests;