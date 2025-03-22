import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Import MaterialIcons from react-native-vector-icons

const PendingRequests = ({ onBack }) => {
  const [requests, setRequests] = useState([
    {
      id: '1',
      start: 'IIT Ropar',
      destination: 'Chandigarh',
      requesterName: 'Aman Sharma',
      requesterEmail: 'aman@example.com',
      date: '10/03/2025',
      time: '10:00 AM',
    },
    {
      id: '2',
      start: 'Delhi',
      destination: 'Noida',
      requesterName: 'Priya Gupta',
      requesterEmail: 'priya@example.com',
      date: '15/03/2025',
      time: '06:30 PM',
    },
  ]);

  const handleAccept = (id) => {
    setRequests(requests.filter((request) => request.id !== id));
    alert('Request Accepted!');
  };

  const handleReject = (id) => {
    setRequests(requests.filter((request) => request.id !== id));
    alert('Request Rejected.');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFB22C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incoming Requests</Text>
      </View>

      {/* Requests List */}
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Route */}
            <Text style={styles.routeText}>
              {item.start} → {item.destination}
            </Text>

            {/* Date and Time */}
            <View style={styles.dateTimeContainer}>
              <MaterialIcons name="calendar-today" size={16} color="#A0AEC0" />
              <Text style={styles.dateTimeText}>{item.date}</Text>
              <MaterialIcons name="access-time" size={16} color="#A0AEC0" style={styles.timeIcon} />
              <Text style={styles.dateTimeText}>{item.time}</Text>
            </View>

            {/* Requester Details */}
            <View style={styles.requesterDetails}>
              <MaterialIcons name="person" size={16} color="#FFB22C" />
              <Text style={styles.requesterName}>{item.requesterName}</Text>
            </View>
            <View style={styles.requesterDetails}>
              <MaterialIcons name="email" size={16} color="#FFB22C" />
              <Text style={styles.requesterEmail}>{item.requesterEmail}</Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAccept(item.id)}
              >
                <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleReject(item.id)}
              >
                <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2E', // Dark background for consistency
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
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
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#2C3E50', // Dark blue-gray for cards
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  routeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text for contrast
    marginBottom: 10,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#A0AEC0', // Light gray for subtitle
    marginLeft: 8,
  },
  timeIcon: {
    marginLeft: 16,
  },
  requesterDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requesterName: {
    fontSize: 16,
    color: '#FFFFFF', // White text for contrast
    marginLeft: 8,
  },
  requesterEmail: {
    fontSize: 14,
    color: '#A0AEC0', // Light gray for subtitle
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: '#1E1E2E', // Dark background for buttons
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  acceptButton: {
    borderColor: '#4CAF50', // Green border for accept
  },
  rejectButton: {
    borderColor: '#F44336', // Red border for reject
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PendingRequests;