// screens/AdminScreen.js
import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";

const AdminScreen = () => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 16,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
    // Shadow styling (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Shadow styling (Android)
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 40,
    alignItems: "center",
    // Shadow styling (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Shadow styling (Android)
    elevation: 5,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "500",
  },
});

export default AdminScreen;
