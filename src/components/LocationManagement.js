import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  PermissionsAndroid,
  Linking,
  Button,
} from "react-native";
import { pick, types } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import Papa from 'papaparse';
import XLSX from 'xlsx';


const LocationManagement = () => {
  const [location, setLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleResponse = async (response) => {
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      const error = contentType?.includes("application/json")
        ? (await response.json()).error
        : await response.text();
      throw new Error(error ||` HTTP Error! Status: ${response.status}`);
    }
    return contentType?.includes("application/json") ? await response.json() : await response.text();
  };

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://10.0.2.2:5000/api/locations");
      const data = await handleResponse(response);
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching locations:", err);
      Alert.alert("Error", "Failed to load locations. Please check your backend endpoint.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const addLocation = async () => {
    const trimmedLocation = location.trim();
    if (!trimmedLocation) return;

    try {
      const response = await fetch("http://10.0.2.2:5000/api/locations", {
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

  const removeLocation = async (locationToRemove) => {
    try {
      const locationId = locationToRemove._id || locationToRemove.id || locationToRemove;
      const response = await fetch(`http://10.0.2.2:5000/api/locations/${locationId}`, { method: "DELETE" });
      await handleResponse(response);
      setLocations(locations.filter(l => (l._id || l.id || l) !== locationId));
      Alert.alert("Success", "Location removed successfully");
    } catch (err) {
      console.error("Error removing location:", err);
      Alert.alert("Error", err.message || "Failed to remove location");
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
  
  

  const uploadCSV = async () => {
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
      const nameColumnIndex = parsedData[0].findIndex((header) => header?.toString().toLowerCase() === 'name');
  
      if (nameColumnIndex === -1) {
        Alert.alert('Error', 'XLSX must contain a "name" column');
        return;
      }
  
      const newLocations = parsedData
        .slice(1) // skip header row
        .map((row) => row[nameColumnIndex]?.trim())
        .filter(Boolean);

      console.log('Parsed locations:', newLocations);
  
      for (const locName of newLocations) {
        try {
          const response = await fetch('http://192.168.225.207:5000/api/locations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: locName }),
          });
  
          if (!response.ok) throw new Error(`Failed to add location: ${locName}`);
        } catch (error) {
          console.error(error);
        }
      }
  
      Alert.alert('Success', 'XLSX locations uploaded successfully');
      fetchLocations();
    } catch (err) {
      console.error('Error uploading XLSX:', err);
      Alert.alert('Error', 'Failed to upload XLSX. Please try again.');
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Location Management</Text>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Add location"
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />
        <TouchableOpacity style={styles.addButton} onPress={addLocation}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <Button title="Upload CSV" onPress={uploadCSV} />

      {isLoading ? (
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

export default LocationManagement;
