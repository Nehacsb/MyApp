import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Dashboard = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let isMounted = true; // Flag to check if component is mounted
  
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'CabShare needs access to your location.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED && isMounted) {
            getCurrentLocation();
          } else if (isMounted) {
            setErrorMsg('Location permission denied');
          }
        } else {
          getCurrentLocation();
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Permission error:', err);
        }
      }
    };
  
    const getCurrentLocation = () => {
      Geolocation.getCurrentPosition(
        (position) => {
          if (isMounted) {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        },
        (error) => {
          if (isMounted) {
            console.error('Location error:', error);
            setErrorMsg('Unable to fetch location');
          }
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
      );
    };
  
    // Delay permission request slightly to ensure Activity is attached
    setTimeout(() => {
      if (isMounted) {
        requestLocationPermission();
      }
    }, 500); // Delay by 500ms
  
    return () => {
      isMounted = false;
    };
  }, []);
  

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="account-circle" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>CabShare</Text>
        <TouchableOpacity>
          <Icon name="notifications" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Find a ride, Share a ride</Text>
      </View>

      {/* Map */}
      {location ? (
        <MapView style={styles.map} region={location}>
          <Marker coordinate={location} title="You are here" />
        </MapView>
      ) : (
        <Text style={styles.errorText}>{errorMsg || 'Fetching location...'}</Text>
      )}

      {/* Quick Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('CreateRide')}>
          <Icon name="add-circle-outline" size={40} color="#FFA500" />
          <Text style={styles.actionText}>Create Ride</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('FindRide')}>
          <Icon name="search" size={40} color="#FFA500" />
          <Text style={styles.actionText}>Find Ride</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('MyRides')}>
          <Icon name="directions-car" size={40} color="#FFA500" />
          <Text style={styles.actionText}>My Rides</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('PendingRequests')}>
          <Icon name="pending-actions" size={40} color="#FFA500" />
          <Text style={styles.actionText}>Requests</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  banner: { backgroundColor: '#FFA500', borderRadius: 10, padding: 15, alignItems: 'center', marginVertical: 10 },
  bannerText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  map: { flex: 1, borderRadius: 10, marginVertical: 10 },
  errorText: { color: 'red', textAlign: 'center', marginVertical: 10 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  actionButton: { alignItems: 'center' },
  actionText: { color: '#fff', marginTop: 5 },
});

export default Dashboard;