import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FindRide = () => {
  const { userToken } = useContext(AuthContext);
  const [rides, setRides] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [minSeats, setMinSeats] = useState('');

  const { user } = useContext(AuthContext);//...... 

  // Fetch rides when component loads
  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {

      
      if (!from && !to) {
        console.error("Please provide a source or destination");
        return;
      }
      const url = `http://10.0.2.2:5000/api/rides/search?source=${from}&destination=${to}`;

      console.log("Fetching rides from:", url); // Log the URL

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${userToken} `},
      });
      console.log('Fetched Rides:', response.data); // Debugging

      if (Array.isArray(response.data)) {
        setRides(response.data);
      } else {
        console.error('Unexpected data format:', response.data);
      };
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  // Modify handleSearch to call fetchRides instead of filtering in frontend
  const handleSearch = () => {
    if (!from && !to) {
      Alert.alert('Error', 'Please enter at least one location.');
      return;
    }
    fetchRides();
  };


  const bookRide = async (rideId) => {
    try {
      // Make sure user object exists and has email
      if (!user || !user.email) {
        Alert.alert('Error', 'User information not available. Please login again.');
        return;
      }
  
      console.log('Attempting to book ride:', rideId, 'for user:', user.email);
      
      const response = await axios.post(
        'http://10.0.2.2:5000/api/request/book',
        { 
          rideId, 
          userEmail: user.email 
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('Booking response:', response.data);
      
      Alert.alert(
        'Request Sent!',
        response.data.message || 'Your ride request has been sent to the driver.'
      );
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response data:', error.response?.data);
      
      let errorMessage = 'Failed to send request';
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      error.response.data?.msg || 
                      `Server error (${error.response.status})`;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="arrow-back" size={24} color="white" />
        <Text style={styles.headerTitle}>Find a Ride</Text>
      </View>

      {/* Search Fields */}
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <MaterialIcons name="place" size={24} color="#FFB22C" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="From"
            placeholderTextColor="#A0AEC0"
            value={from}
            onChangeText={setFrom}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="place" size={24} color="#FFB22C" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="To"
            placeholderTextColor="#A0AEC0"
            value={to}
            onChangeText={setTo}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="event-seat" size={24} color="#FFB22C" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Minimum Seats (optional)"
            placeholderTextColor="#A0AEC0"
            keyboardType="numeric"
            value={minSeats}
            onChangeText={setMinSeats}
          />
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Rides List */}
      <FlatList
        data={rides}
        keyExtractor={(item, index) => item?._id || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.rideItem}>
            <View style={styles.rideHeader}>
              <Text style={styles.rideRoute}>{item.source} → {item.destination}</Text>
              <Text style={styles.rideDate}>{item.date}</Text>
            </View>
            <View>
              <Text style={styles.rideDetail}>Time: {item.time}</Text>
              <Text style={styles.rideDetail}>Seats Left: {item.seatsLeft}</Text>
              <Text style={styles.rideDetail}>Price: ${item.totalFare}</Text>
            </View>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => bookRide(item._id)}
            >
              <Text style={styles.bookButtonText}>Book Ride</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  searchButton: {
    backgroundColor: '#FFB22C',
    borderRadius: 15,
    padding: 14,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rideItem: {
    backgroundColor: '#2C3E50',
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  rideHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#3E5065',
    paddingBottom: 8,
    marginBottom: 8,
  },
  rideRoute: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rideDate: {
    color: '#A0AEC0',
    fontSize: 14,
  },
  rideDetail: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  bookButton: {
    backgroundColor: '#FFB22C',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FindRide;