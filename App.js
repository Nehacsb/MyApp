import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons'; // For icons
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => alert('Profile clicked')}>
          <MaterialIcons name="account-circle" size={35} color="#3674B5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CabShare</Text>
        <TouchableOpacity onPress={() => alert('Notifications clicked')}>
          <MaterialIcons name="notifications" size={35} color="#3674B5" />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <TouchableOpacity style={styles.card}>
          <MaterialIcons name="add-circle" size={50} color="#3674B5" />
          <Text style={styles.cardText}>Create a Ride</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <MaterialIcons name="search" size={50} color="#3674B5" />
          <Text style={styles.cardText}>Find a Ride</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <MaterialIcons name="directions-car" size={50} color="#3674B5" />
          <Text style={styles.cardText}>My Rides</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <MaterialIcons name="pending-actions" size={50} color="#3674B5" />
          <Text style={styles.cardText}>Pending Requests</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FBFBFB',
    padding: 16,
    elevation: 4,
    height: 90,
    paddingTop: 30,
  },
  headerTitle: {
    color: '#3674B5',
    fontSize: 32,
    fontWeight: 800,
    fontFamily: 'Poppins',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '80%',
    backgroundColor: '#E8F9FF',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardText: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: '600',
    color: '#3674B5',
  },
});