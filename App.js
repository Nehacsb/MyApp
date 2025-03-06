import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dashboard from './components/dashboard';
import CreateRide from './components/CreateRide';
import FindRide from './components/FindRide';
import MyRide from './components/MyRide';
import PendingRequest from './components/PendingRequest';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Dashboard');

  const handleButtonClick = (screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'CreateRide':
        return <CreateRide onBack={() => setCurrentScreen('Dashboard')} />;
      case 'FindRide':
        return <FindRide onBack={() => setCurrentScreen('Dashboard')} />;
      case 'MyRides':
        return <MyRide onBack={() => setCurrentScreen('Dashboard')} />;
      case 'PendingRequests':
        return <PendingRequest onBack={() => setCurrentScreen('Dashboard')} />;
      default:
        return <Dashboard onButtonClick={handleButtonClick} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => alert('Profile clicked')}>
          <MaterialIcons name="account-circle" size={35} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CabShare</Text>
        <TouchableOpacity onPress={() => alert('Notifications clicked')}>
          <MaterialIcons name="notifications" size={35} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Load Current Screen */}
      {renderScreen()}
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
    backgroundColor: '#000000',
    padding: 16,
    elevation: 4,
    height: 90,
    paddingTop: 30,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Poppins',
  },
});
