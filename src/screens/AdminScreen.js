import React, { useState, useContext, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { AuthContext } from "../context/AuthContext";

const AdminScreen = () => {
  const [domain, setDomain] = useState("");
  const [authorizedDomains, setAuthorizedDomains] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useContext(AuthContext);

  // Fetch authorized domains from the backend
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetch('http://10.0.2.2:5000/api/admin/authorized_domain');
        const text = await response.text();

        console.log("Raw API response:", text);

        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        console.log("Domains fetched successfully. Updating state...");
        
        const data = JSON.parse(text);
        setAuthorizedDomains(data);
      } catch (error) {
        console.error("Error fetching domains:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDomains();
  }, []);

  // Function to add a domain
  const addDomain = async () => {
    const trimmedDomain = domain.trim();
    if (!trimmedDomain) return;

    try {
      const response = await fetch('http://10.0.2.2:5000/api/admin/authorize_domain', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: trimmedDomain }),
      });

      const text = await response.text();
      console.log("Raw API response:", text);

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status} - ${text}`);
      }

      setAuthorizedDomains([...authorizedDomains, trimmedDomain]);
      setDomain("");
    } catch (error) {
      console.error("Error adding domain:", error);
      Alert.alert("Error", error.message);
    }
  };

  // Function to remove a domain
  const removeDomain = async (domainToRemove) => {
    try {
      const response = await fetch('http://10.0.2.2:5000/api/admin/remove_domain', {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domainToRemove }),
      });

      if (response.ok) {
        setAuthorizedDomains(authorizedDomains.filter((d) => d !== domainToRemove));
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Failed to remove domain.");
      }
    } catch (error) {
      console.error("Error removing domain:", error);
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
              placeholder="Add authorized domain"
              style={styles.input}
              value={domain}
              onChangeText={setDomain}
            />
            <TouchableOpacity style={styles.button} onPress={addDomain}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Authorized Domains Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Authorized Domains</Text>
            </View>
            <FlatList
              data={authorizedDomains}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <Text style={styles.tableText}>{item}</Text>
                  <TouchableOpacity onPress={() => removeDomain(item)}>
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