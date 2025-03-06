import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Dashboard = ({ onButtonClick }) => {
  return (
    <View style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapView
          key={new Date().getTime()}
          style={styles.map}
          initialRegion={{
            latitude: 30.96992, // Default to New Delhi (Change as needed)
            longitude: 76.47322,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onMapReady={() => console.log("Map is ready!")}
        />
      </View>

      {/* Cards Section */}
      <View style={styles.gridContainer}>
        <TouchableOpacity style={styles.card} onPress={() => onButtonClick('CreateRide')}>
          <MaterialIcons name="add-circle" size={50} color="#FFB22C" />
          <Text style={styles.cardText}>Create a Ride</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => onButtonClick('FindRide')}>
          <MaterialIcons name="search" size={50} color="#FFB22C" />
          <Text style={styles.cardText}>Find a Ride</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => onButtonClick('MyRides')}>
          <MaterialIcons name="directions-car" size={50} color="#FFB22C" />
          <Text style={styles.cardText}>My Rides</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => onButtonClick('PendingRequests')}>
          <MaterialIcons name="pending-actions" size={50} color="#FFB22C" />
          <Text style={styles.cardText}>Pending Requests</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  mapContainer: {
    flex: 1.2, // Adjust this value to control the map's height
    width: '100%',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gridContainer: {
    flex: 1, // This makes sure the grid takes the remaining space
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  card: {
    width: '48%', // 48% to leave some space between items
    aspectRatio: 1, // This makes them square
    backgroundColor: '#000000',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default Dashboard;
