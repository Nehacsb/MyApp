import React, { useState, useContext, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { AuthContext } from "../context/AuthContext";

// const API_BASE_URL = "http://192.168.248.192:5000/api/admin"; // Replace with actual backend URL

const AdminScreen = () => {
  const [email, setEmail] = useState("");
  const [authorizedEmails, setAuthorizedEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useContext(AuthContext);

  // Fetch authorized emails from the backend
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch("http://192.168.248.192:5000/api/admin/authorized_emails");
        const text = await response.text(); // Read raw response text
        console.log("Raw API response:", text);

        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        // Parse JSON only if response is valid
        const data = JSON.parse(text);
        setAuthorizedEmails(data);
      } catch (error) {
        console.error("Error fetching emails:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, []);

  // Function to add an email
  const addEmail = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    try {
      const response = await fetch("http://192.168.248.192:5000/api/admin/authorize_email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const text = await response.text(); // Log raw response
      console.log("Raw API response:", text);

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status} - ${text}`);
      }

      setAuthorizedEmails([...authorizedEmails, trimmedEmail]);
      setEmail("");
    } catch (error) {
      console.error("Error adding email:", error);
      Alert.alert("Error", error.message);
    }
  };

  // Function to remove an email
  const removeEmail = async (emailToRemove) => {
    try {
      const response = await fetch("http://192.168.248.192:5000/api/admin/remove_email", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToRemove }),
      });

      if (response.ok) {
        setAuthorizedEmails(authorizedEmails.filter((email) => email !== emailToRemove));
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Failed to remove email.");
      }
    } catch (error) {
      console.error("Error removing email:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : (
        <>
          {/* Input & Add Button */}
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Add authorized email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity style={styles.button} onPress={addEmail}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Authorized Emails Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Authorized Emails</Text>
            </View>
            <FlatList
              data={authorizedEmails}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <Text style={styles.tableText}>{item}</Text>
                  <TouchableOpacity onPress={() => removeEmail(item)}>
                    <Text style={styles.deleteText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </>
      )}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#0F172A",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#1E293B",
    color: "#ffffff",
    fontSize: 16,
    marginRight: 10,
  },
  button: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 8,
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
  table: {
    width: "100%",
    backgroundColor: "#1E293B",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 10,
  },
  tableHeader: {
    backgroundColor: "#374151",
    padding: 12,
  },
  tableHeaderText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#475569",
  },
  tableText: {
    color: "#ffffff",
    fontSize: 16,
  },
  deleteText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#DC2626",
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
});

export default AdminScreen;
