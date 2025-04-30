// screens/AddCab.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AddCab = ({ navigation, route }) => {
  const { user } = useContext(AuthContext);
  const [driverName, setDriverName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [plateNumber, setPlateNumber] = useState('');

  const handleSaveCab = async () => {
    if (!driverName || !phoneNumber ) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      await axios.post('http://10.0.2.2:5000/api/saved-cabs', {
        email: user.email,
        driverName,
        phoneNumber,
        plateNumber: plateNumber || undefined,
      });
      Alert.alert('Success', 'Cab saved successfully');
      // Call the callback if it exists
      if (route.params?.onCabAdded) {
        route.params.onCabAdded();
      }
      
      
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save cab');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#6cbde9" />
        </TouchableOpacity>
        <Text style={styles.title}>Add a New Cab</Text>
        <View style={styles.placeholder}></View>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.inputLabel}>Driver Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter driver's name"
          placeholderTextColor="#999"
          value={driverName}
          onChangeText={setDriverName}
        />
        
        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          placeholderTextColor="#999"
          value={phoneNumber}
          keyboardType="phone-pad"
          onChangeText={setPhoneNumber}
        />
        
        <Text style={styles.inputLabel}>Plate Number (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter vehicle plate number (optional)"
          placeholderTextColor="#999"
          value={plateNumber}
          onChangeText={setPlateNumber}
          autoCapitalize="characters"
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSaveCab}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Save Cab</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40, // To balance the header
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  button: {
    backgroundColor: '#6cbde9',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddCab;