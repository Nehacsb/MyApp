import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Use react-native-vector-icons
import Geolocation from 'react-native-geolocation-service';
import { SafeAreaView } from 'react-native-safe-area-context';

const Dashboard = ({ onButtonClick }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const granted = await Geolocation.requestAuthorization('whenInUse');
        if (granted === 'granted') {
          Geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
              setLoading(false);
            },
            (error) => {
              Alert.alert('Error', 'Unable to fetch location.');
              setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        } else {
          Alert.alert('Permission Denied', 'Location access is needed to show your position.');
          setLoading(false);
        }
      } catch (error) {
        Alert.alert('Error', 'Unable to fetch location.');
        setLoading(false);
      }
    };

    requestLocationPermission();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Find a ride, Share a ride</Text>
      </View>

      {/* Map Section */}
      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#FFB22C" />
        ) : (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: location?.latitude || 30.96992,
              longitude: location?.longitude || 76.47322,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {location && <Marker coordinate={location} />}
          </MapView>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {actionButtons.map(({ title, icon, action }, index) => (
            <TouchableOpacity key={index} style={styles.actionItem} onPress={() => onButtonClick(action)}>
              <View style={styles.iconContainer}>
                <MaterialIcons name={icon} size={32} color="#FFFFFF" /> {/* Use MaterialIcons */}
              </View>
              <Text style={styles.actionText}>{title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const actionButtons = [
  { title: 'Create Ride', icon: 'add-circle', action: 'CreateRide' },
  { title: 'Find Ride', icon: 'search', action: 'FindRide' },
  { title: 'My Rides', icon: 'directions-car', action: 'MyRides' },
  { title: 'Requests', icon: 'pending-actions', action: 'PendingRequests' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2E',
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    backgroundColor: '#FFB22C',
  },
  headerSubtitle: {
    fontSize: 24,
    color: '#FCECDD',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  mapContainer: {
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  actionsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  iconContainer: {
    backgroundColor: '#FFB22C',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default Dashboard;