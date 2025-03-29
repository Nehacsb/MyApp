import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MyRides = ({ onBack }) => {
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchRides = async () => {
      try {

        console.log(user.email);
        if (!user?.email) {
          Alert.alert('Error', 'User email not available');
          return;
        }

        const response = await axios.get('http://192.168.248.187:5000/api/rides', {
          params: { email: user.email },
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const formattedRides = response.data.map(ride => {
          // Safe property access
          const creatorName = ride.isCurrentUserCreator 
            ? 'You' 
            : ride.createdBy 
              ? `${ride.createdBy.firstName || ''} ${ride.createdBy.lastName || ''}`.trim() 
              : 'Unknown';
    
          return {
            id: ride._id,
            start: ride.source,
            destination: ride.destination,
            date: ride.date ? new Date(ride.date).toLocaleDateString() : 'N/A',
            time: ride.time || 'N/A',
            seatsLeft: ride.seatsLeft || 0,
            fare: ride.totalFare || 0,
            createdBy: creatorName,
            status: ride.isCurrentUserCreator ? 'Confirmed' : 'Pending'
          };
        });
    
        setUpcomingRides(formattedRides);
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
        <Text style={styles.createdByText}>By {item.createdBy}</Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return '#4CAF50';
      case 'Pending': return '#FFC107';
      case 'Cancelled/Rejected': return '#F44336';
      default: return '#A0AEC0';
    }
  };

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
        <FlatList
          data={upcomingRides}
          renderItem={renderRideCard}
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
    backgroundColor: '#1E1E2E',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
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
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
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
    color: '#FFFFFF',
  },
  seatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatText: {
    fontSize: 14,
    color: '#A0AEC0',
    marginLeft: 5,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#A0AEC0',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFB22C',
  },
  createdByText: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  statusContainer: {
    borderRadius: 10,
    padding: 8,
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: '#1E1E2E',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#A0AEC0',
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