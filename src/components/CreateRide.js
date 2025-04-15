//import React, { useState } from 'react';
import React, { useContext, useState, useEffect,useRef } from "react";
import { FlatList, Modal, Pressable } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Animated, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios'; // Import axios for API calls
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

const CreateRide = ({ onBack }) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [maxCapacity, setMaxCapacity] = useState('');
  const [totalFare, setTotalFare] = useState('');
  const [isFemaleOnly, setIsFemaleOnly] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const { user } = useContext(AuthContext);//......  

  const [availableLocations, setAvailableLocations] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeField, setActiveField] = useState(null); // 'source' or 'destination'

  const sourceInputRef = useRef(null);
  const destInputRef = useRef(null);
  const [inputLayouts, setInputLayouts] = useState({
    source: { y: 0, height: 0 },
    destination: { y: 0, height: 0 }
  });

  useEffect(() => {
    // In your fetchLocations function:
const fetchLocations = async () => {
  try {
    const res = await axios.get('http://192.168.225.30:5000/api/locations');
    // Extract just the names from the objects
    const locations = Array.isArray(res.data) 
      ? res.data.map(loc => loc.name) 
      : (res.data.locations || []).map(loc => loc.name);
    console.log("Fetched locations:", locations);
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
  
  const validateForm = () => {
    if (!source.trim()) {
      alert('Please enter the source location.');
      return false;
    }
    if (!destination.trim()) {
      alert('Please enter the destination.');
      return false;
    }
    if (!maxCapacity.trim()) {
      alert('Please enter the maximum capacity.');
      return false;
    }
    if (!totalFare.trim()) {
      alert('Please enter the total fare.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    try {
      console.log("here")
      // Prepare ride data
      const rideDetails = {
        source,
        destination,
        date: date.toISOString(), // Convert date to ISO string
        time: time.toLocaleTimeString(), // Convert time to string
        maxCapacity: parseInt(maxCapacity, 10), // Convert to number
        totalFare: parseFloat(totalFare), // Convert to number
        isFemaleOnly,
        //userEmail: 'abcd', // Replace with the logged-in user's email
        userEmail: user.email,
      };
      console.log("ride details::::",rideDetails);

      // Send ride data to the backend API
      const response = await axios.post('http://192.168.225.30:5000/api/rides', rideDetails);

      // Handle success
      Alert.alert('Success', 'Ride created successfully!');
      //onBack(); // Navigate back to the previous screen   LATER
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
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="#FFB22C" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Create a Ride</Text>
    </View>

    {/* Form Section */}
    <View style={styles.formContainer}>
      {/* Source Input */}
      <View 
        style={styles.inputContainer}
        ref={sourceInputRef}
        onLayout={handleInputLayout('source')}
      >
        <MaterialIcons name="location-on" size={20} color="#FFB22C" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="From"
          placeholderTextColor="#A0AEC0"
          value={source}
          onChangeText={(text) => handleLocationInput(text, 'source')}
          onFocus={() => setActiveField('source')}
        />
      </View>

      {/* Destination Input */}
      <View 
        style={styles.inputContainer}
        ref={destInputRef}
        onLayout={handleInputLayout('destination')}
      >
        <MaterialIcons name="flag" size={20} color="#FFB22C" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="To"
          placeholderTextColor="#A0AEC0"
          value={destination}
          onChangeText={(text) => handleLocationInput(text, 'destination')}
          onFocus={() => setActiveField('destination')}
        />
      </View>

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
            keyboardShouldPersistTaps="always"
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

      {/* Date Picker */}
      <TouchableOpacity 
        style={styles.inputContainer} 
        onPress={() => setShowDatePicker(true)}
      >
        <MaterialIcons name="calendar-today" size={20} color="#FFB22C" style={styles.icon} />
        <Text style={styles.input}>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker 
          value={date} 
          mode="date" 
          display="default" 
          onChange={onDateChange} 
          minimumDate={new Date()} 
        />
      )}

      {/* Time Picker */}
      <TouchableOpacity 
        style={styles.inputContainer} 
        onPress={() => setShowTimePicker(true)}
      >
        <MaterialIcons name="access-time" size={20} color="#FFB22C" style={styles.icon} />
        <Text style={styles.input}>{time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker 
          value={time} 
          mode="time" 
          display="default" 
          onChange={onTimeChange} 
        />
      )}

      {/* Max Capacity */}
      <View style={styles.inputContainer}>
        <MaterialIcons name="people" size={20} color="#FFB22C" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Max Cab Capacity"
          placeholderTextColor="#A0AEC0"
          value={maxCapacity}
          onChangeText={setMaxCapacity}
          keyboardType="numeric"
        />
      </View>

      {/* Total Fare */}
      <View style={styles.inputContainer}>
        <MaterialIcons name="attach-money" size={20} color="#FFB22C" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Total Cab Fare"
          placeholderTextColor="#A0AEC0"
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
        <Text style={styles.checkboxLabel}>Female Only</Text>
      </TouchableOpacity>

      {/* Create Ride Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Ride</Text>
      </TouchableOpacity>
    </View>
  </Animated.View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 36,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  icon: {
    marginRight: 12,
    color: '#5F5F5F',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
  },
  suggestionsContainer: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 200,
    zIndex: 1000,
    elevation: 4,
    marginTop: 2,
  },
  suggestionItem: {
    padding: 14,
    borderBottomColor: '#F1F1F1',
    borderBottomWidth: 1,
  },
  suggestionText: {
    color: '#1A1A1A',
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checked: {
    backgroundColor: '#000000',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#000000',
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});



export default CreateRide;