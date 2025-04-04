import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const AdminChoiceScreen = ({ navigation }) => {
  const { setAdminMode } = useContext(AuthContext);

  const handleChoice = (choice) => {
    setAdminMode(choice === 'admin');
    navigation.navigate(choice === 'admin' ? 'AdminDashboard' : 'Dashboard');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Continue as:</Text>
      
      <TouchableOpacity 
        style={[styles.button, styles.adminButton]}
        onPress={() => handleChoice('admin')}
      >
        <Text style={styles.buttonText}>Administrator</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.userButton]}
        onPress={() => handleChoice('user')}
      >
        <Text style={styles.buttonText}>Regular User</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0F172A',
  },
  title: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  adminButton: {
    backgroundColor: '#4F46E5',
  },
  userButton: {
    backgroundColor: '#334155',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default AdminChoiceScreen;