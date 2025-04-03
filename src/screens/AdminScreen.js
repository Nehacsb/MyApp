import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";

const AdminScreen = () => {
  const [email, setEmail] = useState("");
  const [authorizedEmails, setAuthorizedEmails] = useState(["@iitrpr.ac.in"]);
  const { logout } = useContext(AuthContext);

  const addEmail = () => {
    if (email.trim() !== "" && !authorizedEmails.includes(email.trim())) {
      setAuthorizedEmails([...authorizedEmails, email.trim()]);
      setEmail("");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>
      
      <TextInput
        placeholder="Add authorized email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.button} onPress={addEmail}>
        <Text style={styles.buttonText}>Add Email</Text>
      </TouchableOpacity>

      <FlatList
        data={authorizedEmails}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Text style={styles.listItem}>{item}</Text>}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// Add styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  listItem: {
    fontSize: 16,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  logoutButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
});

export default AdminScreen;
