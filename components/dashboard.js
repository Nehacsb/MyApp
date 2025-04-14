import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform, Alert, Dimensions } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const Dashboard = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { logout } = useContext(AuthContext);

  const showErrorAlert = (message) => {
    Alert.alert(
      'Location Error',
      message,
      [{ text: 'OK', onPress: () => navigation.navigate('Settings') }],
      { cancelable: false }
    );
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
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
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    } else if (Platform.OS === 'ios') {
      // iOS automatically prompts for permission on first location request
      return true;
    }
    return false;
  };

  const getCurrentLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      Geolocation.getCurrentPosition(
        (position) => {
          console.log('Location fetched:', position);
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          setIsLoading(false);
        },
        (error) => {
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
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 10000,
          distanceFilter: 10 
        }
      );
    } catch (error) {
      console.error('Location process error:', error);
      setErrorMsg(error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
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
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Find a ride, Share a ride</Text>
      </View>

      {/* Map Section */}
      <View style={styles.mapContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Icon name="location-searching" size={40} color="#FFA500" />
            <Text style={styles.loadingText}>Fetching your location...</Text>
          </View>
        ) : location ? (
          <MapView 
            style={styles.map}
            initialRegion={location}
            region={location}
            showsUserLocation={true}
            showsMyLocationButton={true}
            followsUserLocation={true}
            loadingEnabled={true}
            toolbarEnabled={false}
          >
            <Marker 
              coordinate={location}
              title="Your Location"
              description="You are here"
              pinColor="#FFA500"
            />
          </MapView>
        ) : (
          <View style={styles.errorContainer}>
            <Icon name="location-off" size={40} color="#ff4444" />
            <Text style={styles.errorText}>{errorMsg || 'Location unavailable'}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={getCurrentLocation}
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  banner: {
    backgroundColor: '#FFA500',
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  bannerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  mapContainer: {
    height: height * 0.5, // Takes 50% of screen height
    marginHorizontal: 15,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  retryButton: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#121212',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
  },
  actionText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 14,
  },
});

export default Dashboard;