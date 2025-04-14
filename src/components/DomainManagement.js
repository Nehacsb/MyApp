// components/DomainManagement.js
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert, SafeAreaView } from "react-native";

const DomainManagement = () => {
  const [domain, setDomain] = useState("");
  const [authorizedDomains, setAuthorizedDomains] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to handle API responses
  const handleResponse = async (response) => {
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      const error = contentType?.includes("application/json")
        ? (await response.json()).error
        : await response.text();
      throw new Error(error || `HTTP Error! Status: ${response.status}`);
    }
    return contentType?.includes("application/json") ? await response.json() : await response.text();
  };

  // Fetch authorized domains on mount
  useEffect(() => {
    const fetchDomains = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://10.0.2.2:5000/api/admin/authorized_domain");
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
      const response = await fetch("http://10.0.2.2:5000/api/admin/authorize_domain", {
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
      const response = await fetch("http://10.0.2.2:5000/api/admin/remove_domain", {
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Domain Management</Text>
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Add authorized domain"
          style={styles.input}
          value={domain}
          onChangeText={setDomain}
        />
        <TouchableOpacity style={styles.addButton} onPress={addDomain}>
          <Text style={styles.addButtonText}>Add</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 24,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 16,
    color: "#111827",
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    // Shadow styling
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 15,
  },
  listContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  listHeader: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  listItemText: {
    fontSize: 15,
    color: "#1F2937",
  },
  deleteText: {
    color: "#DC2626",
    fontWeight: "500",
    fontSize: 14,
  },
});

export default DomainManagement;
