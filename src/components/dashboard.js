import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, Modal, Dimensions, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../context/AuthContext';
import ProfileSidebar from './ProfileSidebar';
import axios from 'axios';
import { BlurView } from '@react-native-community/blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const features = [
  { id: '1', icon: 'add-circle-outline', title: 'Create Ride', description: 'Easily create a ride and invite others to join!' },
  { id: '2', icon: 'search', title: 'Find Ride', description: 'Quickly find available rides matching your route.' },
  { id: '3', icon: 'directions-car', title: 'My Rides', description: 'View and manage your created and joined rides.' },
  { id: '4', icon: 'pending-actions', title: 'Pending Requests', description: 'Manage incoming and outgoing ride requests.' },
  { id: '5', icon: 'chat', title: 'Chat Feature', description: 'Chat with fellow riders in My Rides' },
  { id: '6', icon: 'local-taxi', title: 'Saved Cabs', description: 'Save cab contact details for quick access and reuse.' },
];
const Dashboard = ({ navigation }) => {
  const { logout, user } = useContext(AuthContext);
  const [showSidebar, setShowSidebar] = useState(false);
  const [savedCabs, setSavedCabs] = useState([]);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  
  useEffect(() => {
    const showAboutOnce = async () => {
      const hasSeen = await AsyncStorage.getItem('hasSeenAboutApp');
      if (hasSeen !== 'true') {
        setAboutVisible(true);
        await AsyncStorage.setItem('hasSeenAboutApp', 'true');
      }
    };
    showAboutOnce();
  }, []);

  useEffect(() => {
    fetchSavedCabs();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSavedCabs();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchSavedCabs = async () => {
    try {
      const res = await axios.get(`http://10.0.2.2:5000/api/saved-cabs/${user.email}`);
      setSavedCabs(res.data);
    } catch (err) {
      console.error('Failed to fetch saved cabs:', err);
    }
  };

  const handleDeleteCab = async (cabId) => {
    try {
      await axios.delete(`http://10.0.2.2:5000/api/saved-cabs/${cabId}`);
      setSavedCabs((prevCabs) => prevCabs.filter((cab) => cab._id !== cabId));
    } catch (err) {
      console.error('Failed to delete cab:', err);
    }
  };

  const renderCab = ({ item }) => (
    <View style={styles.cabCard}>
      <View style={styles.cabTextContainer}>
        <View style={styles.cabInfoRow}>
          <Icon name="person" size={18} color="#50ABE7" />
          <Text style={styles.cabText}>{item.driverName}</Text>
        </View>

        <View style={styles.cabInfoRow}>
          <Icon name="phone" size={18} color="#50ABE7" />
          <Text style={styles.cabSubText}>{item.phoneNumber}</Text>
        </View>

        {item.plateNumber && (
          <View style={styles.cabInfoRow}>
            <Icon name="directions-car" size={18} color="#50ABE7" />
            <Text style={styles.cabSubText}>{item.plateNumber}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteCab(item._id)}
      >
        <Icon name="delete" size={24} color="#D9534F" />
      </TouchableOpacity>
    </View>
  );
  const renderFeatureCard = ({ item }) => (
    <View style={styles.card}>
      <Icon name={item.icon} size={50} color="#6cbde9" />
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>
        {item.description}
      </Text>
    </View>
  );
  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  const handleOpenModal = () => {
    setCurrentIndex(0); // Reset to first card
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: 0, animated: false });
    }
    setAboutVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowSidebar(!showSidebar)}>
          <Icon name="account-circle" size={30} color="#1C1C1E" />
        </TouchableOpacity>

        <Text style={styles.title}>RideMate</Text>
        <TouchableOpacity onPress={() => setAboutVisible(true)}>
          <Icon name="info-outline" size={26} color="#4A4E69" />
        </TouchableOpacity>



      </View>

      {/* Sidebar */}
      {showSidebar && (
        <View style={styles.sidebarContainer}>
          <ProfileSidebar navigation={navigation} onClose={() => setShowSidebar(false)} />
        </View>
      )}

      {/* Banner */}
      <View style={styles.banner}>
        <Icon name="directions-car" size={24} color="#FFFFFF" />
        <Text style={styles.bannerText}>Find a ride, Share a ride</Text>
      </View>

      {/* Quick Actions - Now Vertical */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CreateRide')}
        >
          <Icon name="add-circle-outline" size={28} color="#87ceeb" />
          <Text style={styles.actionText}>Create Ride</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('FindRide')}
        >
          <Icon name="search" size={28} color="#87ceeb" />
          <Text style={styles.actionText}>Find Ride</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('MyRides')}
        >
          <Icon name="directions-car" size={28} color="#87ceeb" />
          <Text style={styles.actionText}>My Rides</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PendingRequests')}
        >
          <Icon name="pending-actions" size={28} color="#87ceeb" />
          <Text style={styles.actionText}>Pending Requests</Text>
        </TouchableOpacity>
      </View>

      {/* Saved Cabs Section */}
      <View style={styles.savedCabsContainer}>
        <View style={styles.savedCabsHeader}>
          <View style={styles.savedCabsTitleContainer}>
            <Icon name="local-taxi" size={20} color="#50ABE7" />
            <Text style={styles.savedCabsTitle}>Saved Cabs</Text>
          </View>
          <TouchableOpacity
            style={styles.addCabButton}
            onPress={() => navigation.navigate('AddCab')}

          >

            <Icon name="add" size={24} color="#50ABE7" />
            <Text style={styles.addCabText}>Add</Text>
          </TouchableOpacity>
        </View>

        {savedCabs.length === 0 ? (
          <View style={styles.emptyCabsContainer}>
            <Icon name="local-taxi" size={60} color="#DDDDDD" />
            <Text style={styles.emptyCabsText}>No saved cabs yet</Text>
          </View>
        ) : (
          <FlatList
            data={savedCabs}
            keyExtractor={(item) => item._id}
            renderItem={renderCab}
            contentContainerStyle={styles.cabsList}
          />
        )}
      </View>
      {/* About Modal */}
      <Modal visible={aboutVisible} animationType="fade" transparent>
        <BlurView style={styles.blurView} blurType="light" blurAmount={10} reducedTransparencyFallbackColor="white">
          <View style={styles.modalContent}>
            <FlatList
              ref={flatListRef}
              data={features}
              renderItem={renderFeatureCard}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              initialScrollIndex={0}
              getItemLayout={(data, index) => ({
                length: width * 0.75,
                offset: width * 0.75 * index,
                index,
              })}
            />
            {/* Pagination Dots */}
            <View style={styles.pagination}>
              {features.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentIndex === index ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
            <View style={styles.skipButtonContainer}>
              <TouchableOpacity style={styles.skipButton} onPress={() => setAboutVisible(false)}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom:12,
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
    backgroundColor: '#6cbde9',
    padding: 14,
    marginVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  bannerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'column',
    marginTop: 8,
    paddingHorizontal: 6,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 249, 249, 0.9)',
    borderColor: 'black',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: {
    color: '#1C1C1E',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  savedCabsContainer: {
    marginTop: 20,
    flex: 1,
  },
  savedCabsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
  savedCabsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  savedCabsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  addCabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addCabText: {
    color: '#50ABE7',
    fontWeight: '500',
    marginLeft: 4,
  },
  cabsList: {
    paddingBottom: 20,
  },
  cabCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#50ABE7',
  },
  cabTextContainer: {
    flex: 1,
  },
  cabInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  cabSubText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  deleteButton: {
    padding: 6,
  },
  sidebarContainer: {
    position: 'absolute',
    left: 0,
    top: 60,
    bottom: 0,
    zIndex: 999,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  emptyCabsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyCabsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    height: 320,
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  card: {
    width: width * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 10,
    width: '100%',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#6cbde9',
  },
  inactiveDot: {
    backgroundColor: '#ccc',
  },
  skipButtonContainer: {
    width: '100%',
    alignItems: 'flex-end',
    paddingLeft: 20,
    marginTop: 12,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#6cbde9',
    borderRadius: 20,
  },
  skipButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Dashboard;