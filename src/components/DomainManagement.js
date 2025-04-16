import React, { useState, useEffect } from "react";
import { View, Text, Platform,PermissionsAndroid,TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert, SafeAreaView, Button } from "react-native";
import { pick, types } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';

const DomainManagement = () => {
  const [domain, setDomain] = useState("");
  const [authorizedDomains, setAuthorizedDomains] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false); // To track if error occurs during upload

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
        const response = await fetch("http://192.168.225.207:5000/api/admin/authorized_domain");
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
      const response = await fetch("http://192.168.225.207:5000/api/admin/authorize_domain", {
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
      const response = await fetch("http://192.168.225.207:5000/api/admin/remove_domain", {
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

  const requestStoragePermission = async () => {
      if (Platform.OS === 'android') {
        try {
          let granted = false;
    
          if (Platform.Version >= 33) {
            // Android 13+ (API 33)
            const readMediaPermission = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
              {
                title: 'Media Permission Required',
                message: 'App needs access to your media to upload CSV files',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              }
            );
    
            granted = readMediaPermission === PermissionsAndroid.RESULTS.GRANTED;
          } else if (Platform.Version >= 30) {
            // Android 11 & 12
            const manageStoragePermission = await PermissionsAndroid.request(
              'android.permission.MANAGE_EXTERNAL_STORAGE'
            );
    
            granted = manageStoragePermission === PermissionsAndroid.RESULTS.GRANTED;
          } else {
            // Android 10 and below
            const readPermission = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
              {
                title: 'Storage Permission Required',
                message: 'App needs access to your storage to upload CSV files',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              }
            );
    
            granted = readPermission === PermissionsAndroid.RESULTS.GRANTED;
          }
    
          return granted;
        } catch (err) {
          console.warn('Permission error:', err);
          return false;
        }
      }
      return true;
    };

  // Upload XLSX file
  const uploadXLSX = async () => {
    setHasError(false); // Reset error state before starting upload
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) return;

    try {
      const [file] = await pick({ type: [types.allFiles] });

      if (!file || !file.uri || !file.name.toLowerCase().endsWith('.xlsx')) {
        Alert.alert('Invalid File', 'Please upload a valid XLSX file.');
        return;
      }

      const filePath = file.uri.replace('content://', ''); // Clean URI for Android content resolver

      const fileData = await RNFS.readFile(file.uri, 'base64');
      const workbook = XLSX.read(fileData, { type: 'base64' });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const nameColumnIndex = parsedData[0].findIndex((header) => header?.toString().toLowerCase() === 'domain');

      if (nameColumnIndex === -1) {
        Alert.alert('Error', 'XLSX must contain a "name" column');
        return;
      }

      const newDomains = parsedData
        .slice(1) // skip header row
        .map((row) => row[nameColumnIndex]?.trim())
        .filter(Boolean);

      console.log('Parsed domains:', newDomains);

      // Only proceed with domain upload if there are valid domains
      if (newDomains.length === 0) {
        Alert.alert('No Valid Domains', 'No valid domains were found in the uploaded file.');
        return;
      }

      setIsLoading(true); // Start loading state

      // Upload each domain
      for (const domainName of newDomains) {
        try {
          const response = await fetch('http://192.168.225.207:5000/api/admin/authorize_domain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: domainName }),
          });

          if (!response.ok) throw new Error(`Failed to add domain: ${domainName}`);
        } catch (error) {
          console.error(error);
          setHasError(true); // Set error state if any domain fails
          Alert.alert('Error', `Failed to add domain: ${domainName}`);
          break; // Stop on error and show alert
        }
      }

      if (!hasError) {
        Alert.alert('Success', 'XLSX domains uploaded successfully');
        fetchDomains(); // Refresh the list after uploading
      }
    } catch (err) {
      //fetchDomains();
      //console.error('Error uploading XLSX:', err);
      setHasError(true); // Set error state if an error occurs during the file reading or parsing
      //Alert.alert('Error', 'Failed to upload XLSX. Please try again.');
    } finally {
      setIsLoading(false); // Stop loading state
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

      <Button title="Upload XLSX" onPress={uploadXLSX} />

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
