import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const PendingRequests = ({ onBack }) => {
  const [requests, setRequests] = useState([
    {
      id: '1',
      start: 'IIT Ropar',
      destination: 'Chandigarh',
      requesterName: 'Aman Sharma',
      requesterEmail: 'aman@example.com',
    },
    {
      id: '2',
      start: 'Delhi',
      destination: 'Noida',
      requesterName: 'Priya Gupta',
      requesterEmail: 'priya@example.com',
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
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={30} color="#000" />
      </TouchableOpacity>

      <Text style={styles.header}>Pending Requests</Text>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.details}>
              <Text style={styles.route}>
                {item.start} ➝ {item.destination}
              </Text>
              <Text style={styles.name}>{item.requesterName}</Text>
              <Text style={styles.email}>{item.requesterEmail}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAccept(item.id)}>
                <MaterialIcons name="check" size={24} color="#FFB22C" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleReject(item.id)}>
                <MaterialIcons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 16,
  },
  backButton: {
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 12,
    alignItems: 'center',
  },
  details: {
    flex: 1,
  },
  route: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 16,
    color: '#eee',
  },
  email: {
    fontSize: 14,
    color: '#ddd',
  },
  actions: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 50,
    marginRight: 8,
    color: '#000',
  },
  rejectButton: {
    backgroundColor: '#FFB22C',
    padding: 10,
    borderRadius: 50,
  },
});

export default PendingRequests;
