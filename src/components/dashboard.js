import React, { useState, useEffect, useContext  } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AuthContext } from '../context/AuthContext';

const Dashboard = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { logout } = useContext(AuthContext);
  const showErrorAlert = (message) => {
    Alert.alert(
      'Location Error',
      message,
      [{ text: 'OK' }],
      { cancelable: false }
    );
  };

  useEffect(() => {
    let isMounted = true;

    const checkLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          return granted;
        }
        return true; // For iOS, we'll handle permission in the location request
      } catch (err) {
        console.warn('Permission check error:', err);
        return false;
      }
    };

    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'CabShare needs your location to find nearby rides',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission granted');
            return true;
          } else {
            console.log('Location permission denied');
            return false;
          }
        }
        return true; // iOS handles permissions differently
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    };

    const getCurrentLocation = async () => {
      try {
        const hasPermission = await checkLocationPermission();
        
        if (!hasPermission) {
          const permissionGranted = await requestLocationPermission();
          if (!permissionGranted) {
            throw new Error('Location permission denied');
          }
        }

        Geolocation.getCurrentPosition(
          (position) => {
            if (isMounted) {
              console.log('Location fetched:', position);
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              });
              setIsLoading(false);
            }
          },
          (error) => {
            if (isMounted) {
              console.error('Location error:', error);
              let errorMessage = 'Unable to fetch location';
              
              switch(error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage = 'Location permission denied. Please enable in settings.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage = 'Location information unavailable';
                  break;
                case error.TIMEOUT:
                  errorMessage = 'Location request timed out. Please try again.';
                  break;
              }
              
              setErrorMsg(errorMessage);
              showErrorAlert(errorMessage);
              setIsLoading(false);
            }
          },
          { 
            enableHighAccuracy: true, 
            timeout: 15000, 
            maximumAge: 10000,
            distanceFilter: 10 
          }
        );
      } catch (error) {
        if (isMounted) {
          console.error('Location process error:', error);
          setErrorMsg(error.message);
          setIsLoading(false);
        }
      }
    };

    // Start the location process
    getCurrentLocation();

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
        <TouchableOpacity onPress={logout}> 
          <Icon name="logout" size={30} color="#fff" /> 
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="notifications" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Find a ride, Share a ride</Text>
      </View>

      {/* Map Section */}
      <View style={styles.mapContainer}>
        {isLoading ? (
          <Text style={styles.loadingText}>Fetching your location...</Text>
        ) : location ? (
          <MapView 
            style={styles.map} 
            region={location}
            showsUserLocation={true}
            showsMyLocationButton={true}
            loadingEnabled={true}
            toolbarEnabled={true}
          >
            <Marker 
              coordinate={location} 
              title="Your Location"
              description="You are here"
            />
          </MapView>
        ) : (
          <View style={styles.errorContainer}>
            <Icon name="location-off" size={40} color="#ff4444" />
            <Text style={styles.errorText}>{errorMsg || 'Location unavailable'}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setIsLoading(true);
                setErrorMsg(null);
                getCurrentLocation();
              }}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('CreateRide')}
        >
          <Icon name="add-circle-outline" size={40} color="#FFA500" />
          <Text style={styles.actionText}>Create Ride</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
        onPress={() => navigation.navigate('FindRide')}
        >
          <Icon name="search" size={40} color="#FFA500" />
          <Text style={styles.actionText}>Find Ride</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('MyRides')}
        >
          <Icon name="directions-car" size={40} color="#FFA500" />
          <Text style={styles.actionText}>My Rides</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('PendingRequests')}
        >
          <Icon name="pending-actions" size={40} color="#FFA500" />
          <Text style={styles.actionText}>Requests</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121212', 
    padding: 10 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 10 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  banner: { 
    backgroundColor: '#FFA500', 
    borderRadius: 10, 
    padding: 15, 
    alignItems: 'center', 
    marginVertical: 10 
  },
  bannerText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  mapContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: { 
    width: '100%', 
    height: '100%' 
  },
  loadingText: { 
    color: '#fff', 
    fontSize: 16,
    textAlign: 'center',
    margin: 20
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20
  },
  errorText: { 
    color: '#ff4444', 
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10
  },
  retryButton: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10
  },
  retryButtonText: {
    color: '#121212',
    fontWeight: 'bold'
  },
  actions: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginTop: 10 
  },
  actionButton: { 
    alignItems: 'center' 
  },
  actionText: { 
    color: '#fff', 
    marginTop: 5 
  },
});

export default Dashboard;