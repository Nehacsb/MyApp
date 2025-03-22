import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FindRide = ({ onBack }) => {
  const [startQuery, setStartQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [minSeats, setMinSeats] = useState('');
  const [rides, setRides] = useState([
    {
      id: '1',
      start: 'IIT Ropar',
      destination: 'Chandigarh',
      date: '25 Oct 2023',
      time: '10:00 AM',
      seatsLeft: 3,
      fare: 200,
      createdBy: 'Rahul Sharma',
    },
    {
      id: '2',
      start: 'Chandigarh',
      destination: 'Delhi',
      date: '26 Oct 2023',
      time: '08:00 AM',
      seatsLeft: 2,
      fare: 500,
      createdBy: 'Priya Verma',
    },
    {
      id: '3',
      start: 'IIT Ropar',
      destination: 'Amritsar',
      date: '27 Oct 2023',
      time: '09:00 AM',
      seatsLeft: 4,
      fare: 300,
      createdBy: 'Aman Singh',
    },
  ]);

  const filteredRides = rides.filter((ride) => {
    const matchesStart = ride.start.toLowerCase().includes(startQuery.toLowerCase());
    const matchesDestination = ride.destination.toLowerCase().includes(destinationQuery.toLowerCase());
    const matchesSeats = minSeats ? ride.seatsLeft >= parseInt(minSeats, 10) : true;

    return (
      (startQuery && destinationQuery ? matchesStart && matchesDestination : matchesStart || matchesDestination) &&
      matchesSeats
    );
  });

  const renderRideCard = ({ item }) => (
    <View style={styles.card}>
      {/* Top Row: Route and Seats */}
      <View style={styles.topRow}>
        <Text style={styles.routeText}>{item.start} → {item.destination}</Text>
        <View style={styles.seatContainer}>
          <Icon name="seat-passenger" size={18} color="#FFB22C" />
          <Text style={styles.seatText}>{item.seatsLeft} seats left</Text>
        </View>
      </View>

      {/* Middle Row: Date and Time */}
      <View style={styles.middleRow}>
        <Icon name="calendar" size={16} color="#A0AEC0" />
        <Text style={styles.dateText}>{item.date}</Text>
        <Icon name="clock" size={16} color="#A0AEC0" style={styles.timeIcon} />
        <Text style={styles.dateText}>{item.time}</Text>
      </View>

      {/* Bottom Row: Fare and Created By */}
      <View style={styles.bottomRow}>
        <Text style={styles.fareText}>₹{item.fare}</Text>
        <Text style={styles.createdByText}>By {item.createdBy}</Text>
      </View>

      {/* Book Button */}
      <TouchableOpacity style={styles.bookButton} onPress={() => alert(`Booking ride from ${item.start} to ${item.destination}`)}>
        <View style={styles.bookButtonInner}>
          <Text style={styles.bookButtonText}>Book Ride</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFB22C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find a Ride</Text>
      </View>

      {/* Search Inputs */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="map-marker" size={20} color="#A0AEC0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="From"
            placeholderTextColor="#A0AEC0"
            value={startQuery}
            onChangeText={setStartQuery}
          />
        </View>
        <View style={styles.searchInputContainer}>
          <Icon name="map-marker" size={20} color="#A0AEC0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="To"
            placeholderTextColor="#A0AEC0"
            value={destinationQuery}
            onChangeText={setDestinationQuery}
          />
        </View>
        <View style={styles.searchInputContainer}>
          <Icon name="account-group" size={20} color="#A0AEC0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Minimum Seats (optional)"
            placeholderTextColor="#A0AEC0"
            value={minSeats}
            onChangeText={setMinSeats}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Ride List */}
      <FlatList
        data={filteredRides}
        renderItem={renderRideCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
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
  bookButton: {
    backgroundColor: '#FFB22C',
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
  },
  bookButtonInner: {
    padding: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FindRide;