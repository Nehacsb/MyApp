// screens/AdminScreen.js
import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";

const AdminScreen = () => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with blue background */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.subtitle}>Manage your application</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate("DomainManagement")}
        >
          <Text style={styles.buttonText}>Manage Domains</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate("LocationManagement")}
        >
          <Text style={styles.buttonText}>Manage Locations</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#50ABE7",
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
    borderWidth:1,
    borderColor: "#000",
    // Shadow styling
    shadowColor: "#50ABE7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: "#50ABE7",
    fontSize: 17,
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    // Shadow styling
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutButtonText: {
    color: "#50ABE7",
    fontSize: 17,
    fontWeight: "500",
  },
});

export default AdminScreen;