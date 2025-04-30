import React, { useContext, useState, useEffect, useRef } from "react";
import { FlatList, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Animated, Alert, ScrollView, Modal, TouchableWithoutFeedback,KeyboardAvoidingView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';


const COLORS = {
  primary: '#50ABE7',       // Primary blue color
  secondary: '#6CBDE9',     // Secondary blue color
  accent: '#87CEEB',        // Light blue accent
  background: '#F5F7FA',    // Light background
  card: '#FFFFFF',          // Card background
  text: {
    primary: '#333333',     // Primary text
    secondary: '#666666',   // Secondary text
    placeholder: '#999999', // Placeholder text
    inverse: '#FFFFFF',     // Text on dark backgrounds
  },
  border: '#E5EBF0',        // Border color
};


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

  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [vehicleType, setVehicleType] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [numberPlate, setNumberPlate] = useState('');
  const [otherInfo, setOtherInfo] = useState('');
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);

  const vehicleTypes = ['4-Seater Cab', '7-steate Cab', 'Auto', 'Other'];

  const sourceInputRef = useRef(null);
  const destInputRef = useRef(null);
  const numberPlateInput = useRef(null);
  const [inputLayouts, setInputLayouts] = useState({
    source: { y: 0, height: 0 },
    destination: { y: 0, height: 0 }
  });

  useEffect(() => {
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
        vehicleType: vehicleType, // Send undefined instead of empty string
        contactNumber: contactNumber,
        numberPlate: numberPlate,
        otherInfo: otherInfo
      };
      console.log('Ride DDetails:', rideDetails);
      const response = await axios.post('http://10.0.2.2:5000/api/rides', rideDetails);
      console.log('Ride created successfully:', response.data);
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
          <MaterialIcons name="radio-button-checked" size={20} color={COLORS.primary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Departure point"
            placeholderTextColor="#888"
            value={source}
            onChangeText={(text) => handleLocationInput(text, 'source')}
            onFocus={() => {
              setActiveField('source');
              if (source.length >= 1) {
                const filtered = availableLocations.filter(loc =>
                  String(loc).toLowerCase().includes(source.toLowerCase())
                );
                setFilteredSuggestions(filtered);
                setShowSuggestions(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
        </View>


        {/* Destination Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="location-on" size={20} color={COLORS.primary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Destination"
            placeholderTextColor="#888"
            value={destination}
            onChangeText={(text) => handleLocationInput(text, 'destination')}
            onFocus={() => {
              setActiveField('source');
              if (source.length >= 1) {
                const filtered = availableLocations.filter(loc =>
                  String(loc).toLowerCase().includes(source.toLowerCase())
                );
                setFilteredSuggestions(filtered);
                setShowSuggestions(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
        </View>

        {showSuggestions && (
          <View style={[
            styles.suggestionsContainer,
            { top: activeField === 'source' ? 120 : 200 } // Adjust based on input field position
          ]}>

            <ScrollView
              keyboardShouldPersistTaps="always"
              style={styles.suggestionsScroll}
            >
              {filteredSuggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => {
                    if (activeField === 'source') {
                      setSource(item);
                    } else {
                      setDestination(item);
                    }
                    setShowSuggestions(false);
                  }}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        {/* Schedule Section */}
        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleTitle}>Schedule</Text>
          <View style={styles.datetimeRow}>
            <TouchableOpacity
              style={styles.datetimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datetimeText}>
                {date.toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.datetimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.datetimeText}>
                {time.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
            </TouchableOpacity>
          </View>
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
            is24Hour={false}
          />
        )}

        {/* Ride Preferences */}
        <View style={styles.preferencesContainer}>
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
            <MaterialIcons name="currency-rupee" size={20} color={COLORS.primary} style={styles.fareIcon} />
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
              {isFemaleOnly && <MaterialIcons name="check" size={16} color={COLORS.text.inverse} />}
            </View>
            <Text style={styles.checkboxLabel}>Female passengers only</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addDetailsButton}
          onPress={() => setShowDescriptionModal(true)}
        >
          <Text style={styles.addDetailsButtonText}>+ Add Ride Details (Optional)</Text>
        </TouchableOpacity>
        {/* Create Ride Button */}
        <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
          <Text style={styles.createButtonText}>Create Ride →</Text>
        </TouchableOpacity>
      </View>

      {/* Ride Description Modal */}
      <Modal
        visible={showDescriptionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDescriptionModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={() => setShowDescriptionModal(false)}>
            <View style={styles.modalOverlayInner}>
              <TouchableWithoutFeedback>
                <ScrollView
                  contentContainerStyle={styles.scrollContainer}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.descriptionModalContent}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Ride Details</Text>
                      <TouchableOpacity onPress={() => setShowDescriptionModal(false)}>
                        <MaterialIcons name="close" size={24} color="#000" />
                      </TouchableOpacity>
                    </View>

                    {/* Vehicle Details */}
                    <View style={styles.vehicleDetailsContainer}>
                      <Text style={styles.sectionLabel}>Vehicle Details</Text>

                      <View style={styles.vehicleTypeContainer}>
                        <TouchableOpacity
                          style={styles.vehicleTypeButton}
                          onPress={() => setShowVehicleDropdown(true)}
                        >
                          <Text style={vehicleType ? styles.vehicleTypeText : styles.vehicleTypePlaceholder}>
                            {vehicleType || 'Select Vehicle Type'}
                          </Text>
                          <MaterialIcons name="arrow-drop-down" size={20} color="#888" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.vehicleInfoRow}>
                        <TextInput
                          style={styles.vehicleInfoInput}
                          placeholder="Contact Number"
                          value={contactNumber}
                          onChangeText={setContactNumber}
                          keyboardType="phone-pad"
                          returnKeyType="next"
                          onSubmitEditing={() => numberPlateInput.current?.focus()}
                        />
                        <TextInput
                          ref={numberPlateInput}
                          style={styles.vehicleInfoInput}
                          placeholder="Number Plate"
                          value={numberPlate}
                          onChangeText={setNumberPlate}
                          returnKeyType="done"
                        />
                      </View>
                    </View>

                    {/* Other Info */}
                    <View style={styles.otherInfoContainer}>
                      <Text style={styles.sectionLabel}>Other Information</Text>
                      <TextInput
                        style={styles.otherInfoInput}
                        placeholder="Any other instructions or details..."
                        value={otherInfo}
                        onChangeText={setOtherInfo}
                        multiline={true}
                        numberOfLines={4}
                        returnKeyType="done"
                      />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                      style={styles.saveDetailsButton}
                      onPress={() => {
                        setShowDescriptionModal(false);
                      }}
                    >
                      <Text style={styles.saveDetailsButtonText}>Save Details</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>


      {/* Vehicle Type Dropdown Modal */}
      <Modal
        visible={showVehicleDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVehicleDropdown(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowVehicleDropdown(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.dropdownContainer}>
              {vehicleTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setVehicleType(type);
                    setShowVehicleDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>


    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    color: COLORS.text.primary,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'black',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 5,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  scheduleContainer: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 10,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  datetimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datetimeButton: {
    width: '48%',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  datetimeText: {
    fontSize: 16,
    color: COLORS.text.primary, 
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  seatSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  seatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,

    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedSeatButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  seatButtonText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  selectedSeatButtonText: {
    color: COLORS.text.inverse,
    fontWeight: 'bold',
  },
  otherSeatsInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  fareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 12,
    marginBottom: 12,
  },
  fareIcon: {
    marginRight: 12,
  },
  fareInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
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
    borderColor: COLORS.text.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checked: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  createButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    
  },
  suggestionsContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionsScroll: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  addDetailsButton: {
    
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor:COLORS.accent,
    },
  addDetailsButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalOverlayInner: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  descriptionModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  vehicleDetailsContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  vehicleTypeContainer: {
    marginBottom: 15,
  },
  vehicleTypeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
  },
  vehicleTypeText: {
    fontSize: 16,
  },
 vehicleTypePlaceholder: {
    fontSize: 16,
    color: '#888',
  },
  vehicleInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vehicleInfoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 5,
    fontSize: 16,
  },
  otherInfoContainer: {
    marginBottom: 25,
  },
  otherInfoInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveDetailsButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  saveDetailsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginHorizontal: 40,
    padding: 10,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  dropdownItemText: {
    fontSize: 16,
  },
});

export default CreateRide;