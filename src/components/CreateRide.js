//import React, { useState } from 'react';
import React, { useContext, useState, useEffect } from "react";

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
      console.log(rideDetails);

      // Send ride data to the backend API
      const response = await axios.post('http://192.168.248.179:5000/api/rides', rideDetails);

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
        <View style={styles.inputContainer}>
          <MaterialIcons name="location-on" size={20} color="#FFB22C" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="From"
            placeholderTextColor="#A0AEC0"
            value={source}
            onChangeText={setSource}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="flag" size={20} color="#FFB22C" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="To"
            placeholderTextColor="#A0AEC0"
            value={destination}
            onChangeText={setDestination}
          />
        </View>

        <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
          <MaterialIcons name="calendar-today" size={20} color="#FFB22C" style={styles.icon} />
          <Text style={styles.input}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} minimumDate={new Date()} />
        )}

        <TouchableOpacity style={styles.inputContainer} onPress={() => setShowTimePicker(true)}>
          <MaterialIcons name="access-time" size={20} color="#FFB22C" style={styles.icon} />
          <Text style={styles.input}>{time.toLocaleTimeString()}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker value={time} mode="time" display="default" onChange={onTimeChange} />
        )}

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
    backgroundColor: '#1E1E2E', // Dark background for consistency
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
    marginBottom: 16,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text for contrast
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C3E50', // Dark blue-gray for input containers
    borderRadius: 15,
    padding: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF', // White text for contrast
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFB22C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checked: {
    backgroundColor: '#2C3E50', // Dark blue-gray for checked state
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#FFFFFF', // White text for contrast
  },
  button: {
    backgroundColor: '#FFB22C', // Golden yellow for button
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF', // White text for contrast
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateRide;