import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const FindRide = ({ navigation }) => {
  const { userToken, user } = useContext(AuthContext);
  const [rides, setRides] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [minSeats, setMinSeats] = useState('');
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      if (!from && !to && !selectedDate) {
        console.error("Please provide a source or destination");
        return;
      }
      console.log("Fetching rides with params:", { from, to, minSeats });
      let url = `http://10.0.2.2:5000/api/rides/search?source=${from}&destination=${to}`;
      if (minSeats && !isNaN(minSeats)) {
        url += `&minSeats=${minSeats}`;
      }
      console.log("URL:", url);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (Array.isArray(response.data)) {
        setRides(response.data);
      } else {
        console.error('Unexpected data format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  const handleSearch = () => {
    if (!from && !to && !selectedDate) {
      Alert.alert('Error', 'Please enter at least one search parameter (location or date).');
      return;
    }
    fetchRides();
  };

  const onChangeDate = (event, selected) => {
    const currentDate = selected || selectedDate;
    setShowDatePicker(false);
    setSelectedDate(currentDate);
  };

  const clearDate = () => {
    setSelectedDate(null);
  };

  const bookRide = async (rideId) => {
    try {
      const response = await axios.post(
        'http://10.0.2.2:5000/api/request/book',
        { 
          rideId, 
          userEmail: user.email,
          seats: selectedSeats
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      Alert.alert('Request Sent!', response.data.message);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to book ride');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find a Ride</Text>
        <View style={{ width: 24 }} /> {/* For alignment */}
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="place" size={20} color="#FFB22C" />
          <TextInput
            style={styles.searchInput}
            placeholder="From"
            placeholderTextColor="#888"
            value={from}
            onChangeText={setFrom}
          />
        </View>

        <View style={styles.searchInputContainer}>
          <MaterialIcons name="place" size={20} color="#FFB22C" />
          <TextInput
            style={styles.searchInput}
            placeholder="To"
            placeholderTextColor="#888"
            value={to}
            onChangeText={setTo}
          />
        </View>

        <View style={styles.searchInputContainer}>
          <MaterialIcons name="event-seat" size={20} color="#FFB22C" />
          <TextInput
            style={styles.searchInput}
            placeholder="Min Seats"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={minSeats}
            onChangeText={(text) => /^\d*$/.test(text) && setMinSeats(text)}
          />
        </View>

        {/* Optional Date Picker */}
        <View style={styles.dateContainer}>
          <TouchableOpacity 
            style={[styles.searchInputContainer, { flex: 1 }]}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="calendar-today" size={20} color="#FFB22C" />
            <Text style={styles.dateText}>
              {selectedDate 
                ? selectedDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })
                : 'Any date'}
            </Text>
          </TouchableOpacity>
          
          {selectedDate && (
            <TouchableOpacity 
              style={styles.clearDateButton}
              onPress={clearDate}
            >
              <MaterialIcons name="close" size={20} color="#FF0000" />
            </TouchableOpacity>
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={onChangeDate}
            minimumDate={new Date()}
          />
        )}

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Rides List */}
      <FlatList
        data={rides}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.ridesList}
        renderItem={({ item }) => (
          <View style={styles.rideCard}>
            {/* Route and Date */}
            <View style={styles.rideHeader}>
              <Text style={styles.rideRoute}>{item.source} → {item.destination}</Text>
              <Text style={styles.rideDate}>{formatDate(item.date)}</Text>
            </View>

            {/* Driver Info */}
            <View style={styles.driverInfo}>
              <View style={styles.driverAvatar}>
                <MaterialIcons name="person" size={24} color="#FFF" />
              </View>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>
                  {item.createdBy?.firstName} {item.createdBy?.lastName}
                </Text>
                <Text style={styles.driverEmail}>{item.createdBy?.email}</Text>
              </View>
            </View>

            {/* Ride Details */}
            <View style={styles.rideDetails}>
              <View style={styles.detailItem}>
                <MaterialIcons name="access-time" size={16} color="#FFB22C" />
                <Text style={styles.detailText}>{item.time}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <MaterialIcons name="event-seat" size={16} color="#FFB22C" />
                <Text style={styles.detailText}>{item.seatsLeft} seats left</Text>
              </View>
              
              <View style={styles.detailItem}>
                <MaterialIcons name="currency-rupee" size={16} color="#FFB22C" />
                <Text style={styles.detailText}>{item.totalFare}</Text>
              </View>
            </View>

            {/* Seat Selection */}
            <View style={styles.seatSelection}>
              <Text style={styles.seatLabel}>Select Seats:</Text>
              <View style={styles.seatControls}>
                <TouchableOpacity 
                  style={styles.seatButton} 
                  onPress={() => setSelectedSeats(Math.max(1, selectedSeats - 1))}
                >
                  <Text style={styles.seatButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.seatCount}>{selectedSeats}</Text>
                <TouchableOpacity 
                  style={styles.seatButton} 
                  onPress={() => setSelectedSeats(Math.min(item.seatsLeft, selectedSeats + 1))}
                >
                  <Text style={styles.seatButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Book Button */}
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
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
  },
  searchButton: {
    backgroundColor: '#FFB22C',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ridesList: {
    padding: 16,
  },
  rideCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rideRoute: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  rideDate: {
    fontSize: 14,
    color: '#888',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFB22C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  driverEmail: {
    fontSize: 14,
    color: '#888',
  },
  rideDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 4,
  },
  seatSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  seatLabel: {
    fontSize: 16,
    color: '#000',
  },
  seatControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFB22C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  seatCount: {
    marginHorizontal: 12,
    fontSize: 16,
    color: '#000',
    minWidth: 20,
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#FFB22C',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
    paddingVertical: 10,
  },
  clearDateButton: {
    marginLeft: 8,
    padding: 8,
  },
});

export default FindRide;