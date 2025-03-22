import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Header = () => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => alert('Profile clicked')} style={styles.iconButton}>
        <MaterialIcons name="account-circle" size={30} color="#FFB22C" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>CabShare</Text>
      <TouchableOpacity onPress={() => alert('Notifications clicked')} style={styles.iconButton}>
        <MaterialIcons name="notifications" size={30} color="#FFB22C" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFB22C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    paddingTop: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  iconButton: {
    padding: 8,
  },
});

export default Header;