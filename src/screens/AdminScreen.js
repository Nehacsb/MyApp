import React, { useState, useContext, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, 
  ActivityIndicator, Alert, SafeAreaView
} from "react-native";
import { AuthContext } from "../context/AuthContext";

const AdminScreen = () => {
  const [domain, setDomain] = useState("");
  const [authorizedDomains, setAuthorizedDomains] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationsLoading, setIsLocationsLoading] = useState(false);
  const { logout } = useContext(AuthContext);

  const [location, setLocation] = useState("");
  const [locations, setLocations] = useState([]);

  // Helper function to handle API responses
  const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
      const error = contentType?.includes('application/json') 
        ? (await response.json()).error 
        : await response.text();
      throw new Error(error || `HTTP Error! Status: ${response.status}`);
    }
    return contentType?.includes('application/json') 
      ? await response.json() 
      : await response.text();
  };

  // Fetch authorized domains
  useEffect(() => {
    const fetchDomains = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://web-production-de29.up.railway.app/api/admin/authorized_domain');
        const data = await handleResponse(response);
        setAuthorizedDomains(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching domains:", error);
        Alert.alert("Error", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDomains();
  }, []);

  // Add domain
  const addDomain = async () => {
    const trimmedDomain = domain.trim();
    if (!trimmedDomain) return;

    try {
      const response = await fetch('http://web-production-de29.up.railway.app/api/admin/authorize_domain', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: trimmedDomain }),
      });
      
      await handleResponse(response);
      setAuthorizedDomains([...authorizedDomains, trimmedDomain]);
      setDomain("");
      Alert.alert("Success", "Domain added successfully");
    } catch (error) {
      console.error("Error adding domain:", error);
      Alert.alert("Error", error.message);
    }
  };

  // Remove domain
  const removeDomain = async (domainToRemove) => {
    try {
      const response = await fetch('http://web-production-de29.up.railway.app/api/admin/remove_domain', {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domainToRemove }),
      });
      
      await handleResponse(response);
      setAuthorizedDomains(authorizedDomains.filter((d) => d !== domainToRemove));
      Alert.alert("Success", "Domain removed successfully");
    } catch (error) {
      console.error("Error removing domain:", error);
      Alert.alert("Error", error.message);
    }
  };

  // Fetch locations
  const fetchLocations = async () => {
    setIsLocationsLoading(true);
    try {
      const response = await fetch("http://web-production-de29.up.railway.app/api/locations");
      const data = await handleResponse(response);
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching locations:", err);
      Alert.alert("Error", "Failed to load locations. Please check your backend endpoint.");
    } finally {
      setIsLocationsLoading(false);
    }
  };

  // Add location
  const addLocation = async () => {
    const trimmedLocation = location.trim();
    if (!trimmedLocation) return;
    
    try {
      const response = await fetch("http://web-production-de29.up.railway.app/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedLocation }),
      });
      
      const newLoc = await handleResponse(response);
      setLocations([...locations, newLoc]);
      setLocation("");
      Alert.alert("Success", "Location added successfully");
    } catch (err) {
      console.error("Error adding location:", err);
      Alert.alert("Error", "Failed to add location. Please check your backend endpoint.");
    }
  };

  // Remove location
  const removeLocation = async (locationToRemove) => {
    try {
      const response = await fetch(
        `http://web-production-de29.up.railway.app/api/locations/${locationToRemove.id || locationToRemove}`, 
        { method: "DELETE" }
      );
      
      await handleResponse(response);
      setLocations(locations.filter(l => 
        l.id !== locationToRemove.id && l !== locationToRemove
      ));
      Alert.alert("Success", "Location removed successfully");
    } catch (err) {
      console.error("Error removing location:", err);
      Alert.alert("Error", "Failed to remove location. Please check your backend endpoint.");
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>

      {/* Domain Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Domain Management</Text>
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

        {isLoading ? (
          <ActivityIndicator size="small" color="#4F46E5" />
        ) : (
          <View style={styles.listContainer}>
            <Text style={styles.listHeader}>Authorized Domains</Text>
            <FlatList
              data={authorizedDomains}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={styles.listItemText}>{item}</Text>
                  <TouchableOpacity onPress={() => removeDomain(item)}>
                    <Text style={styles.deleteText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}
      </View>

      {/* Location Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Management</Text>
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Add location"
            style={styles.input}
            value={location}
            onChangeText={setLocation}
          />
          <TouchableOpacity style={styles.button} onPress={addLocation}>
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {isLocationsLoading ? (
          <ActivityIndicator size="small" color="#4F46E5" />
        ) : (
          <View style={styles.listContainer}>
            <Text style={styles.listHeader}>Locations</Text>
            <FlatList
              data={locations}
              keyExtractor={(item) => item.id?.toString() || item}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={styles.listItemText}>{item.name || item}</Text>
                  <TouchableOpacity onPress={() => removeLocation(item)}>
                    <Text style={styles.deleteText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0F172A",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
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
    minWidth: 80,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
  listContainer: {
    backgroundColor: "#1E293B",
    borderRadius: 8,
    padding: 10,
  },
  listHeader: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#475569",
  },
  listItemText: {
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