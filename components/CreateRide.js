import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateRide = ({ onBack }) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [maxCapacity, setMaxCapacity] = useState('');
  const [totalFare, setTotalFare] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSubmit = () => {
    const rideDetails = {
      source,
      destination,
      date: date.toLocaleDateString(),
      time: time.toLocaleTimeString(),
      maxCapacity,
      totalFare,
    };
    console.log('Ride Details:', rideDetails);
    alert('Ride created successfully!');
    onBack();
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

      <TextInput
        style={styles.input}
        placeholder="Source"
        value={source}
        onChangeText={setSource}
      />
      <TextInput
        style={styles.input}
        placeholder="Destination"
        value={destination}
        onChangeText={setDestination}
      />

      {/* Date Picker */}
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text>{date.toLocaleDateString()}</Text>
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
        <Text>{time.toLocaleTimeString()}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Max Cab Capacity"
        value={maxCapacity}
        onChangeText={setMaxCapacity}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Total Cab Fare"
        value={totalFare}
        onChangeText={setTotalFare}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Ride</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
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