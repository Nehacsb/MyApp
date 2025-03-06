import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const FindRide = ({ onBack }) => {
  const [startQuery, setStartQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [rides, setRides] = useState([
    {
      id: '1',
      start: 'IIT Ropar',
      destination: 'Chandigarh',
      date: '25/10/2023',
      time: '10:00 AM',
      seatsLeft: 3,
      fare: 200,
      createdBy: 'Rahul Sharma',
    },
    {
      id: '2',
      start: 'Chandigarh',
      destination: 'Delhi',
      date: '26/10/2023',
      time: '08:00 AM',
      seatsLeft: 2,
      fare: 500,
      createdBy: 'Priya Verma',
    },
    {
      id: '3',
      start: 'IIT Ropar',
      destination: 'Amritsar',
      date: '27/10/2023',
      time: '09:00 AM',
      seatsLeft: 4,
      fare: 300,
      createdBy: 'Aman Singh',
    },
  ]);

  const filteredRides = rides.filter((ride) => {
    const matchesStart = ride.start.toLowerCase().includes(startQuery.toLowerCase());
    const matchesDestination = ride.destination.toLowerCase().includes(destinationQuery.toLowerCase());

    if (startQuery && destinationQuery) {
      return matchesStart && matchesDestination;
    } else if (startQuery) {
      return matchesStart;
    } else if (destinationQuery) {
      return matchesDestination;
    } else {
      return true;
    }
  });

  const renderRideCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.start} → {item.destination}</Text>
      <Text style={styles.cardText}>Date: {item.date}</Text>
      <Text style={styles.cardText}>Time: {item.time}</Text>
      <Text style={styles.cardText}>Seats Left: {item.seatsLeft}</Text>
      <Text style={styles.cardText}>Fare: ₹{item.fare}</Text>
      <Text style={styles.cardText}>Created By: <Text style={styles.bold}>{item.createdBy}</Text></Text>
      <TouchableOpacity style={styles.bookButton} onPress={() => alert(`Booking ride from ${item.start} to ${item.destination}`)}>
        <Text style={styles.bookButtonText}>Book Ride</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bars with Dots */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          // <View style={[styles.dot, { backgroundColor: '#000' }]} />
          <TextInput
            style={styles.searchInput}
            placeholder="From"
            placeholderTextColor={'#000'}
            value={startQuery}
            onChangeText={setStartQuery}
          />
        </View>
        <View style={styles.searchRow}>
          // <View style={[styles.dot, { backgroundColor: '#FFB22C' }]}/>
          <TextInput
            style={styles.searchInput}
            placeholder="To"
            placeholderTextColor={'#000'}
            value={destinationQuery}
            onChangeText={setDestinationQuery}
          />
        </View>
      </View>

      {/* Rides List */}
      <FlatList
        data={filteredRides}
        renderItem={renderRideCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 16,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  // dot: {
  //   width: 12,
  //   height: 12,
  //   borderRadius: 6,
  //   marginRight: 10,
  // },
  searchInput: {
    flex: 1,
    height: 50,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
    color: '#fff',
  },
  bookButton: {
    backgroundColor: '#FFB22C',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  bookButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FindRide;
