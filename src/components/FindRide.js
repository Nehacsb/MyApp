import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator, Dimensions, Modal, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const FindRide = ({ navigation }) => {
  const { userToken, user } = useContext(AuthContext);
  const [rides, setRides] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [minSeats, setMinSeats] = useState('');
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [availableLocations, setAvailableLocations] = useState([]);
  const [filteredFromSuggestions, setFilteredFromSuggestions] = useState([]);
  const [filteredToSuggestions, setFilteredToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchRides();
    fetchLocations();
  }, []);
  const fetchLocations = async () => {
    try {
      const res = await axios.get('http://10.0.2.2:5000/api/locations');
      const locations = Array.isArray(res.data)
        ? res.data.map(loc => loc.name)
        : (res.data.locations || []).map(loc => loc.name);
      setAvailableLocations(locations);
    } catch (err) {
      console.error('Failed to fetch locations', err);
      setAvailableLocations([]);
    }
  };

  const handleLocationInput = (text, type) => {
    if (type === 'from') {
      setFrom(text);
      if (text.length >= 1) {
        const filtered = availableLocations.filter(loc =>
          String(loc).toLowerCase().includes(text.toLowerCase()));
        setFilteredFromSuggestions(filtered);
        setShowFromSuggestions(true);
      } else {
        setShowFromSuggestions(false);
      }
    } else {
      setTo(text);
      if (text.length >= 1) {
        const filtered = availableLocations.filter(loc =>
          String(loc).toLowerCase().includes(text.toLowerCase()))
        setFilteredToSuggestions(filtered);
        setShowToSuggestions(true);
      } else {
        setShowToSuggestions(false);
      }
    }
  };

  const selectLocation = (loc, type) => {
    if (type === 'from') {
      setFrom(loc);
      setShowFromSuggestions(false);
    } else {
      setTo(loc);
      setShowToSuggestions(false);
    }
  };
  const showRideDetails = (ride) => {
    setSelectedRide(ride);
    setShowDetailsModal(true);
  };

  const fetchRides = async () => {
    try {
      if (!from.trim() && !to.trim()) {
        setRides([]); // Clear previous results
        console.log("Skipping fetch - no search criteria");
        return;
      }
      console.log("Fetching rides with params:", { from, to, minSeats });
      let url = `http://10.0.2.2:5000/api/rides/search?source=${from}&destination=${to}`;
      if (minSeats && !isNaN(minSeats)) {
        url += `&minSeats=${minSeats}`;
      }

      if (selectedDate) {
        url += `&date=${selectedDate.toISOString().split('T')[0]}`;
      }

      console.log("URL:", url);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      console.log("API Response:", JSON.stringify(response.data, null, 2));
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
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
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
          <MaterialIcons name="radio-button-checked" size={20} color="#50ABE7" />
          <TextInput
            style={styles.searchInput}
            placeholder="From"
            placeholderTextColor="#888"
            value={from}
            onChangeText={(text) => handleLocationInput(text, 'from')}
            onFocus={() => {
              if (from.length >= 1) {
                const filtered = availableLocations.filter(loc =>
                  String(loc).toLowerCase().includes(from.toLowerCase()))
                setFilteredFromSuggestions(filtered);
                setShowFromSuggestions(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
          />
        </View>

        {showFromSuggestions && (
          <View style={styles.suggestionsContainer}>
            <ScrollView keyboardShouldPersistTaps="always">
              {filteredFromSuggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => selectLocation(item, 'from')}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="place" size={20} color="#50ABE7" />
          <TextInput
            style={styles.searchInput}
            placeholder="To"
            placeholderTextColor="#888"
            value={to}
            onChangeText={(text) => handleLocationInput(text, 'to')}
            onFocus={() => {
              if (to.length >= 1) {
                const filtered = availableLocations.filter(loc =>
                  String(loc).toLowerCase().includes(to.toLowerCase()))
                setFilteredToSuggestions(filtered);
                setShowToSuggestions(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
          />
        </View>
        {showToSuggestions && (
          <View style={styles.suggestionsContainer}>
            <ScrollView keyboardShouldPersistTaps="always">
              {filteredToSuggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => selectLocation(item, 'to')}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}


        <View style={styles.searchInputContainer}>
          <MaterialIcons name="event-seat" size={20} color="#50ABE7" />
          <TextInput
            style={styles.searchInput}
            placeholder="Min Seats"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={minSeats}
            onChangeText={(text) => /^\d*$/.test(text) && setMinSeats(text)}
          />
        </View>


        <View style={styles.dateContainer}>
          <TouchableOpacity
            style={[styles.searchInputContainer, { flex: 1 }]}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="calendar-today" size={20} color="#50ABE7" />
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

          {selectedDate ? (
            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={clearDate}
            >
              <MaterialIcons name="close" size={20} color="#FF0000" />
            </TouchableOpacity>
          ) : null}

        </View>

        {showDatePicker ? (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={onChangeDate}
            minimumDate={new Date()}
          />
        ) : null}


        <TouchableOpacity style={styles.searchButtonContainer} onPress={handleSearch}>
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
              {/* Scrollable route */}
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.routeScroll}
    >
      <Text style={styles.rideRoute}>
        {item.source} → {item.destination}
      </Text>
    </ScrollView>
               {/* Icons */}
    <View style={styles.rideIcons}>
      {item.isFemaleOnly && (
        <View style={styles.femaleOnlyCircle}>
          <Text style={styles.femaleOnlyText}>F</Text>
        </View>
      )}
      <TouchableOpacity onPress={() => showRideDetails(item)}>
        <MaterialIcons name="info" size={24} color="#50ABE7" />
      </TouchableOpacity>
    </View>
            </View>

            {/* Time and Date - Swapped and bigger */}
            <View style={styles.timeDateContainer}>
              <View style={styles.timeDateItem}>
                <MaterialIcons name="access-time" size={18} color="#50ABE7" />
                <Text style={styles.timeText}>{formatTime(item.time)}</Text>
              </View>
              <View style={styles.timeDateItem}>
                <MaterialIcons name="calendar-today" size={18} color="#50ABE7" />
                <Text style={styles.dateText}>{formatDate(item.date)}</Text>
              </View>
            </View>


            {/* Ride Details */}
            <View style={styles.rideDetails}>
              <View style={styles.detailItem}>
                <MaterialIcons name="event-seat" size={16} color="#50ABE7" />
                <Text style={styles.detailText}>{item.seatsLeft !== undefined ? `${item.seatsLeft} seats left` : 'N/A'}</Text>
              </View>

              <View style={styles.detailItem}>
                <MaterialIcons name="currency-rupee" size={16} color="#50ABE7" />
                <Text style={styles.detailText}>{item.totalFare || 'N/A'}</Text>
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
              style={styles.bookButtonContainer}
              onPress={() => bookRide(item._id)}
            >
              <Text style={styles.bookButtonText}>Book Ride</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      {/* Ride Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ride Details</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {selectedRide && (
                <>
                  {/* Created By Section */}
                  <View style={styles.sectionContainer}>
                    {selectedRide.isFemaleOnly && (
                      <View style={styles.sectionContainer}>
                        <Text style={[styles.sectionTitle, { color: '#E91E63' }]}>👩 Female-Only Ride</Text>
                        <Text style={styles.additionalText}>
                          This ride is reserved for female passengers only.
                        </Text>
                      </View>
                    )}
                    <Text style={styles.sectionTitle}>Created By</Text>
                    <View style={styles.creatorContainer}>
                      <Text style={styles.creatorName}>
                        {selectedRide.createdBy?.firstName} {selectedRide.createdBy?.lastName}
                      </Text>
                      <Text style={styles.creatorEmail}>
                        {selectedRide.createdBy?.email || selectedRide.userEmail}
                      </Text>
                    </View>
                  </View>

                  {/* Route Details */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Route Details</Text>
                    <View style={styles.detailsTable}>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableLabel}>From</Text>
                        <Text style={styles.tableValue}>{selectedRide.source}</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableLabel}>To</Text>
                        <Text style={styles.tableValue}>{selectedRide.destination}</Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableLabel}>Date</Text>
                        <Text style={styles.tableValue}>
                          {new Date(selectedRide.date).toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: '2-digit'
                          })}
                        </Text>
                      </View>
                      <View style={styles.tableRow}>
                        <Text style={styles.tableLabel}>Time</Text>
                        <Text style={styles.tableValue}>
                          {selectedRide.time}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Vehicle Details */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Vehicle Details</Text>
                    <View style={styles.detailsList}>
                      <View style={styles.listItem}>
                        <Text style={styles.listLabel}>Vehicle Type:</Text>
                        <Text style={styles.listValue}>
                          {selectedRide.vehicleType || 'Not specified'}
                        </Text>
                      </View>
                      {selectedRide.numberPlate && (
                        <View style={styles.listItem}>
                          <Text style={styles.listLabel}>Number Plate:</Text>
                          <Text style={styles.listValue}>{selectedRide.numberPlate}</Text>
                        </View>
                      )}
                      {selectedRide.contactNumber && (
                        <View style={styles.listItem}>
                          <Text style={styles.listLabel}>Contact Number:</Text>
                          <Text style={styles.listValue}>{selectedRide.contactNumber}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Additional Information */}
                  {selectedRide.otherInfo && (
                    <View style={styles.sectionContainer}>
                      <Text style={styles.sectionTitle}>Additional Information</Text>
                      <Text style={styles.additionalText}>{selectedRide.otherInfo}</Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#000',
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
    padding: 12,
    marginRight: 12,
    marginLeft: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    elevation: 2,
    borderRadius: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 8,
    marginBottom: 9,
  },
  rideIcons: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
  },
  searchButtonContainer: {
    backgroundColor: '#50ABE7', // or any visible color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  searchButtonText: {
    color: '#fff', // make sure this contrasts the background
    fontSize: 17,
    textAlign: 'center',
  },

  ridesList: {
    padding: 16,
  },
  additionalInfo: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    marginTop: 8,
  },
  rideCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#6cbde9',
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  routeScroll: {
  maxWidth: '70%', // or any width that fits your layout
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
  suggestionsContainer: {
    maxHeight: 150,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    marginTop: -10,
    marginBottom: 12,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 16,
    color: '#000',
  },
  timeDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeDateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#000',
  },

  rideDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 10,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailRow: {
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
  bookButtonContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#50ABE7', // Add a visible background
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  bookButton: {
    padding: 14,
  },
  bookButtonText: {
    color: '#fff', // White for contrast
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
    color: '#000',
  },
  clearDateButton: {
    padding: 8,
    paddingBottom: 25,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6cbde9',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  modalScrollContent: {
    paddingBottom: 25,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 4,
  },
  creatorContainer: {
    marginTop: 5,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  creatorEmail: {
    fontSize: 14,
    color: '#666',
  },
  detailsTable: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 15,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: 8,
  },
  tableLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
    width: '40%',
  },
  tableValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    width: '60%',
    textAlign: 'right',
  },
  detailsList: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 15,
  },
  listItem: {
    flexDirection: 'row',
  },
  listLabel: {
    fontSize: 14,
    width: '40%',
    color: '#666',
    marginRight: 8,
  },
  listValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    width: '60%',
  },
  additionalText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    paddingHorizontal: 5,
  },
  femaleOnlyCircle: {
    width: 24,
    height: 24,
    borderRadius: 15,
    backgroundColor: 'rgb(241, 46, 212)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  femaleOnlyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
});
export default FindRide;
