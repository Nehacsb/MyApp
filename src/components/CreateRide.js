import React, { useContext, useState, useEffect, useRef } from "react";
import { FlatList, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Animated, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const CreateRide = ({ navigation }) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [maxCapacity, setMaxCapacity] = useState(1);
  const [totalFare, setTotalFare] = useState('');
  const [isFemaleOnly, setIsFemaleOnly] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const { user } = useContext(AuthContext);

  const [availableLocations, setAvailableLocations] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [otherSeatsInput, setOtherSeatsInput] = useState('');

  const sourceInputRef = useRef(null);
  const destInputRef = useRef(null);
  const [inputLayouts, setInputLayouts] = useState({
    source: { y: 0, height: 0 },
    destination: { y: 0, height: 0 }
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get('http://192.168.236.117:5000/api/locations');
        const locations = Array.isArray(res.data) 
          ? res.data.map(loc => loc.name) 
          : (res.data.locations || []).map(loc => loc.name);
        setAvailableLocations(locations);
      } catch (err) {
        console.error('Failed to fetch locations', err);
        setAvailableLocations([]);
      }
    };
    fetchLocations();
  }, []);

  const handleLocationInput = (text, type) => {
    if (type === 'source') setSource(text);
    else setDestination(text);
  
    setActiveField(type);
    if (text.length >= 1) {
      const filtered = availableLocations.filter(loc =>
        String(loc).toLowerCase().includes(text.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectLocation = (loc) => {
    if (activeField === 'source') setSource(loc);
    else if (activeField === 'destination') setDestination(loc);
    setShowSuggestions(false);
    setActiveField(null);
  };

  const handleSeatSelection = (seats) => {
    setMaxCapacity(seats);
    setOtherSeatsInput('');
  };

  const handleOtherSeatsInput = (text) => {
    const num = parseInt(text) || 0;
    if (num > 0) {
      setMaxCapacity(num);
      setOtherSeatsInput(text);
    } else {
      setMaxCapacity(1);
      setOtherSeatsInput('');
    }
  };

  const validateForm = () => {
    if (!source.trim()) {
      Alert.alert('Error', 'Please enter departure point');
      return false;
    }
    if (!destination.trim()) {
      Alert.alert('Error', 'Please enter destination');
      return false;
    }
    if (!maxCapacity || maxCapacity < 1) {
      Alert.alert('Error', 'Please select available seats');
      return false;
    }
    if (!totalFare.trim()) {
      Alert.alert('Error', 'Please enter total fare');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const rideDetails = {
        source,
        destination,
        date: date.toISOString(),
        time: time.toLocaleTimeString(),
        maxCapacity,
        totalFare: parseFloat(totalFare),
        isFemaleOnly,
        userEmail: user.email,
      };

      const response = await axios.post('http://192.168.236.117:5000/api/rides', rideDetails);
      Alert.alert('Success', 'Ride created successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating ride:', error);
      Alert.alert('Error', 'Failed to create ride. Please try again.');
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const today = new Date();
      if (selectedDate >= today.setHours(0, 0, 0, 0)) {
        setDate(selectedDate);
      }
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const now = new Date();
      if (date.toDateString() === now.toDateString() && selectedTime < now) {
        return;
      }
      setTime(selectedTime);
    }
  };

  const handleInputLayout = (type) => (event) => {
    const { y, height } = event.nativeEvent.layout;
    setInputLayouts(prev => ({
      ...prev,
      [type]: { y, height }
    }));
  };

  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 1000,
    useNativeDriver: true,
  }).start();

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Ride</Text>
      </View>

      {/* Main Form Container */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Route Details</Text>
        
        {/* Source Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="radio-button-checked" size={20} color="#FFB22C" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Departure point"
            placeholderTextColor="#888"
            value={source}
            onChangeText={(text) => handleLocationInput(text, 'source')}
            onFocus={() => setActiveField('source')}
          />
        </View>

        {/* Destination Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="location-on" size={20} color="#FFB22C" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Destination"
            placeholderTextColor="#888"
            value={destination}
            onChangeText={(text) => handleLocationInput(text, 'destination')}
            onFocus={() => setActiveField('destination')}
          />
        </View>

        {/* Schedule Section */}
        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleTitle}>Schedule</Text>
          <View style={styles.datetimeRow}>
            <TouchableOpacity 
              style={styles.datetimeButton} 
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datetimeText}>{date.toLocaleDateString()}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.datetimeButton} 
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.datetimeText}>
                {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ride Preferences */}
        <View style={styles.preferencesContainer}>
          <Text style={styles.preferencesTitle}>Ride Preferences</Text>
          
          {/* Available Seats */}
          <Text style={styles.subtitle}>Available Seats</Text>
          <View style={styles.seatSelectionContainer}>
            {[1, 2, 3].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.seatButton,
                  maxCapacity === num && styles.selectedSeatButton
                ]}
                onPress={() => handleSeatSelection(num)}
              >
                <Text style={[
                  styles.seatButtonText,
                  maxCapacity === num && styles.selectedSeatButtonText
                ]}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
            <TextInput
              style={styles.otherSeatsInput}
              placeholder="Other"
              placeholderTextColor="#888"
              value={otherSeatsInput}
              onChangeText={handleOtherSeatsInput}
              keyboardType="numeric"
            />
          </View>

            {/* Total Fare - Using MaterialIcons for rupee symbol */}
          <View style={styles.fareContainer}>
            <MaterialIcons name="currency-rupee" size={20} color="#FFB22C" style={styles.fareIcon} />
            <TextInput
              style={styles.fareInput}
              placeholder="Total Fare"
              placeholderTextColor="#888"
              value={totalFare}
              onChangeText={setTotalFare}
              keyboardType="numeric"
            />
          </View>

          {/* Female Only Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsFemaleOnly(!isFemaleOnly)}
          >
            <View style={[styles.checkbox, isFemaleOnly && styles.checked]}>
              {isFemaleOnly && <MaterialIcons name="check" size={16} color="#FFB22C" />}
            </View>
            <Text style={styles.checkboxLabel}>Female passengers only</Text>
          </TouchableOpacity>
        </View>

        {/* Create Ride Button */}
        <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
          <Text style={styles.createButtonText}>Create Ride →</Text>
        </TouchableOpacity>
      </View>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker 
          value={date} 
          mode="date" 
          display="default" 
          onChange={onDateChange} 
          minimumDate={new Date()} 
        />
      )}

      {showTimePicker && (
        <DateTimePicker 
          value={time} 
          mode="time" 
          display="default" 
          onChange={onTimeChange} 
        />
      )}

      {/* Location Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <View style={[
          styles.suggestionsContainer,
          {
            top: activeField === 'source' 
              ? inputLayouts.source.y + inputLayouts.source.height + 8
              : inputLayouts.destination.y + inputLayouts.destination.height + 8,
            left: 16,
            right: 16
          }
        ]}>
          <FlatList
            data={filteredSuggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => selectLocation(item)}
                style={styles.suggestionItem}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingVertical: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  scheduleContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 16,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  datetimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datetimeButton: {
    width: '48%',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  datetimeText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  preferencesContainer: {
    marginBottom: 16,
  },
  preferencesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  seatSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  seatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedSeatButton: {
    backgroundColor: '#FFB22C',
  },
  seatButtonText: {
    fontSize: 16,
    color: '#666',
  },
  selectedSeatButtonText: {
    color: '#FFF',
  },
  otherSeatsInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000',
  },
  fareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingVertical: 12,
    marginBottom: 16,
  },
  fareIcon: {
    marginRight: 12,
  },
  fareInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checked: {
    backgroundColor: '#FFB22C',
    borderColor: '#FFB22C',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#000',
  },
  createButton: {
    backgroundColor: '#FFB22C',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  suggestionsContainer: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
    maxHeight: 200,
    zIndex: 1000,
    elevation: 4,
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
});

export default CreateRide;