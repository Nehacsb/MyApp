import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MyRides = ({ onBack }) => {
  const [upcomingRides, setUpcomingRides] = useState([
    {
      id: '1',
      start: 'Delhi',
      destination: 'IIT Ropar',
      date: '22/03/2025',
      time: '4:30 PM',
      seatsLeft: 0,
      fare: 800,
      createdBy: 'Kamakshi Gupta',
      status: 'Confirmed',
    },
    {
      id: '2',
      start: 'Chandigarh',
      destination: 'Delhi',
      date: '15/03/2025',
      time: '06:30 PM',
      seatsLeft: 1,
      fare: 500,
      createdBy: 'Rahul Sharma',
      status: 'Pending',
    },
    {
      
      id: '3',
      start: 'IIT Ropar',
      destination: 'Chandigarh',
      date: '10/03/2025',
      time: '10:00 AM',
      seatsLeft: 2,
      fare: 200,
      createdBy: 'You',
      status: 'Confirmed',
    },
    {
      id: '4',
      start: 'Delhi',
      destination: 'Jaipur',
      date: '20/03/2025',
      time: '12:00 PM',
      seatsLeft: 0,
      fare: 400,
      createdBy: 'Priya Verma',
      status: 'Cancelled/Rejected',
    },
    {
      id: '5',
      start: 'Jaipur',
      destination: 'Delhi',
      date: '31/03/2025',
      time: '2:30 PM',
      seatsLeft: 0,
      fare: 1200,
      createdBy: 'Sanat Gupta',
      status: 'Pending',
    },
  ]);

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
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFB22C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rides</Text>
      </View>

      {/* Upcoming Rides Section */}
      <FlatList
        data={upcomingRides}
        renderItem={renderRideCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {upcomingRides.length === 0 && <Text style={styles.noDataText}>No upcoming rides</Text>}
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
  noDataText: {
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MyRides;
