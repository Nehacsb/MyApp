import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapboxGL from '@maplibre/maplibre-react-native';
import { AuthContext } from '../context/AuthContext';
import ProfileSidebar from './ProfileSidebar'; 

// Initialize MapLibre (no token needed for OSM)
MapboxGL.setAccessToken(null);

const Dashboard = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useContext(AuthContext);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);


  
  const showErrorAlert = (message) => {
    Alert.alert(
      'Location Error',
      message,
      [{ text: 'OK' }],
      { cancelable: false }
    );
  };

  const getCurrentLocation = async () => {
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
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Location permission denied');
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          console.log('Location fetched:', position);
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
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
          enableHighAccuracy: false, 
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
        <TouchableOpacity onPress={() => setShowSidebar(!showSidebar)}>
          <Icon name="account-circle" size={30} color="#1C1C1E" />
        </TouchableOpacity>

        <Text style={styles.title}>RideMate</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={logout}>
            <Icon name="logout" size={28} color="#4A4E69" />
          </TouchableOpacity>
        </View>
      </View>

       {/* Sidebar */}
       {showSidebar && (
        <View style={styles.sidebarContainer}>
          <ProfileSidebar navigation={navigation}  onClose={() => setShowSidebar(false)}/>
        </View>
      )}
      {/* Highlighted Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Find a ride, Share a ride</Text>
      </View>

      {/* Map Section */}
      <View style={styles.mapContainer}>
        {isLoading ? (
          <Text style={styles.loadingText}>Fetching your location...</Text>
        ) : location ? (
          <MapboxGL.MapView 
            style={styles.map}
            styleURL="https://tiles.stadiamaps.com/styles/osm_bright.json" // Default OSM style
          >
            <MapboxGL.Camera
              zoomLevel={14}
              centerCoordinate={[location.longitude, location.latitude]}
              animationMode={'flyTo'}
              animationDuration={2000}
            />
            <MapboxGL.UserLocation />
            <MapboxGL.PointAnnotation
              id="userLocation"
              coordinate={[location.longitude, location.latitude]}
            >
              <View style={styles.annotationContainer}>
                <View style={styles.annotationFill} />
              </View>
            </MapboxGL.PointAnnotation>
          </MapboxGL.MapView>
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

      {/* Separator Line */}
      <View style={styles.separator} />

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
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    flex: 1,
  },
  banner: {
    backgroundColor: '#FFA500', // Changed to orange for highlight
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerText: {
    fontSize: 16,
    fontWeight: '600', // Made bolder
    color: '#FFFFFF', // Changed to white for contrast
  },
  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E5EA',
    marginVertical: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    color: '#555555',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 20,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#999',
    marginVertical: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 6,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderColor: 'black',
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    width: 80,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: {
    color: '#1C1C1E',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  annotationContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
  },
  annotationFill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFA500',
    transform: [{ scale: 1 }],
  },
  sidebarContainer: {
    position: 'absolute',
    left: 0,
    top: 60, // or wherever your header height ends
    bottom: 0,
    zIndex: 999,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  
});

export default Dashboard;