import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const MyRides = ({ onBack }) => {
  const [upcomingRides, setUpcomingRides] = useState([
    {
      id: '1',
      start: 'IIT Ropar',
      destination: 'Chandigarh',
      date: '10/03/2025',
      time: '10:00 AM',
      seatsLeft: 2,
      fare: 200,
      createdBy: 'You',
    },
    {
      id: '2',
      start: 'Chandigarh',
      destination: 'Delhi',
      date: '15/03/2025',
      time: '06:30 PM',
      seatsLeft: 1,
      fare: 500,
      createdBy: 'You',
    },
  ]);

  const [pastRides, setPastRides] = useState([
    {
      id: '3',
      start: 'IIT Ropar',
      destination: 'Amritsar',
      date: '25/02/2025',
      time: '09:00 AM',
      seatsLeft: 0,
      fare: 300,
      createdBy: 'You',
    },
    {
      id: '4',
      start: 'Delhi',
      destination: 'Jaipur',
      date: '05/02/2025',
      time: '12:00 PM',
      seatsLeft: 0,
      fare: 400,
      createdBy: 'You',
    },
  ]);

  const renderRideCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.start} → {item.destination}</Text>
      <Text style={styles.cardText}>Date: {item.date}</Text>
      <Text style={styles.cardText}>Time: {item.time}</Text>
      <Text style={styles.cardText}>Fare: ₹{item.fare}</Text>
      <Text style={styles.cardText}>Created By: <Text style={styles.bold}>{item.createdBy}</Text></Text>
      {item.seatsLeft > 0 && <Text style={styles.cardText}>Seats Left: {item.seatsLeft}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Upcoming Rides</Text>
      {upcomingRides.length > 0 ? (
        <FlatList
          data={upcomingRides}
          renderItem={renderRideCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.noDataText}>No upcoming rides</Text>
      )}

      <Text style={styles.sectionTitle}>Past Rides</Text>
      {pastRides.length > 0 ? (
        <FlatList
          data={pastRides}
          renderItem={renderRideCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.noDataText}>No past rides</Text>
      )}

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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    marginTop: 20,
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
    color: '#FFB22C',
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
  noDataText: {
    fontSize: 16,
    color: '#777',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
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

export default MyRides;
