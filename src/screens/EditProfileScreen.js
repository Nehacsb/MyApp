import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';

const EditProfileScreen = ({ navigation }) => {
  const { user, updateProfile } = useContext(AuthContext);
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile(user.email, { phoneNumber, gender });
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderOptions}>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'Male' && styles.selectedGender]}
              onPress={() => setGender('Male')}
            >
              <Text style={[styles.genderText, gender === 'Male' && styles.selectedGenderText]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'Female' && styles.selectedGender]}
              onPress={() => setGender('Female')}
            >
              <Text style={[styles.genderText, gender === 'Female' && styles.selectedGenderText]}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'Other' && styles.selectedGender]}
              onPress={() => setGender('Other')}
            >
              <Text style={[styles.genderText, gender === 'Other' && styles.selectedGenderText]}>Other</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={isSubmitting}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  selectedGender: {
    backgroundColor: '#6cbde9',
    borderColor: '#eee',
  },
  genderText: {
    color: '#555',
  },
  selectedGenderText: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#6cbde9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;