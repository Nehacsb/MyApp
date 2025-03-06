import axios from "axios";
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateRide = ({ navigation }) => { // Use navigation prop instead of onBack
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [maxCapacity, setMaxCapacity] = useState('');
  const [totalFare, setTotalFare] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSubmit = async () => {
    const rideDetails = {
      source,
      destination,
      date: date.toLocaleDateString(),
      time: time.toLocaleTimeString(),
      maxCapacity: parseInt(maxCapacity),
      totalFare: parseFloat(totalFare),
    };
  
    console.log("📌 Posting ride details:", rideDetails); // Log before posting
   
  
    try {
      const response = await axios.post("http://172.26.26.237:5000/api/rides", rideDetails);
      console.log("✅ Server response:", response.data); // Log server response
  
      alert(response.data.message);
      navigation.goBack();
    } catch (error) {
      console.error("❌ Axios Error:", error.message);
      if (error.response) {
        console.error("📌 Response data:", error.response.data);
      } else if (error.request) {
        console.error("📌 No response received:", error.request);
      } else {
        console.error("📌 Error setting up request:", error.message);
      }
    }
  };
  
  

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep the picker open on iOS
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios'); // Keep the picker open on iOS
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Ride</Text>

      {/* Source Input */}
      <TextInput
        style={styles.input}
        placeholder="Source"
        placeholderTextColor="#999" // Set placeholder text color
        value={source}
        onChangeText={setSource}
      />

      {/* Destination Input */}
      <TextInput
        style={styles.input}
        placeholder="Destination"
        placeholderTextColor="#999" // Set placeholder text color
        value={destination}
        onChangeText={setDestination}
      />

      {/* Date Picker */}
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.inputText}>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* Time Picker */}
      <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
        <Text style={styles.inputText}>{time.toLocaleTimeString()}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      {/* Max Capacity Input */}
      <TextInput
        style={styles.input}
        placeholder="Max Cab Capacity"
        placeholderTextColor="#999" // Set placeholder text color
        value={maxCapacity}
        onChangeText={setMaxCapacity}
        keyboardType="numeric"
      />

      {/* Total Fare Input */}
      <TextInput
        style={styles.input}
        placeholder="Total Cab Fare"
        placeholderTextColor="#999" // Set placeholder text color
        value={totalFare}
        onChangeText={setTotalFare}
        keyboardType="numeric"
      />

      {/* Create Ride Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Ride</Text>
      </TouchableOpacity>

      {/* Back to Dashboard Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FBFBFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3674B5',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: '#3674B5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    justifyContent: 'center',
  },
  inputText: {
    color: '#000', // Set text color for date and time picker text
  },
  button: {
    width: '80%',
    height: 50,
    backgroundColor: '#3674B5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 10,
  },
  backButtonText: {
    color: '#3674B5',
    fontSize: 16,
  },
});

export default CreateRide;