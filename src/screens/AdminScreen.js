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
        const response = await fetch('http://192.168.225.180:5000/api/admin/authorized_domain');
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
      const response = await fetch('http://192.168.225.180:5000/api/admin/authorize_domain', {
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
      const response = await fetch('http://192.168.225.180:5000/api/admin/remove_domain', {
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
      const response = await fetch("http://192.168.225.180:5000/api/locations");
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
      const response = await fetch("http://192.168.225.180:5000/api/locations", {
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
      const locationId = locationToRemove._id || locationToRemove.id || locationToRemove;
      const response = await fetch(
        `http://192.168.225.180:5000/api/locations/${locationId}`, 
        { method: "DELETE" }
      );
      
      await handleResponse(response);
      setLocations(locations.filter(l => 
        (l._id || l.id || l) !== locationId
      ));
      Alert.alert("Success", "Location removed successfully");
    } catch (err) {
      console.error("Error removing location:", err);
      Alert.alert("Error", err.message || "Failed to remove location");
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
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#111827',
    marginRight: 10,
  },
  button: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 15,
    textAlign: 'center',
  },
  listContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listHeader: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  listItemText: {
    fontSize: 15,
    color: '#1F2937',
  },
  deleteText: {
    color: '#DC2626',
    fontWeight: '500',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 24,
    alignItems: 'center',
  },
});



export default AdminScreen;