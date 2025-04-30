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
} from "react-native";
import { pick, types } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const LocationManagement = () => {
  const navigation = useNavigation(); 
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
      const response = await fetch("https://myapp-hu0i.onrender.com/api/locations");
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
      const response = await fetch("https://myapp-hu0i.onrender.com/api/locations", {
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
      const response = await fetch(`https://myapp-hu0i.onrender.com/api/locations/${locationId}`, { method: "DELETE" });
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
          const response = await fetch('https://myapp-hu0i.onrender.com/api/locations', {
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
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#6cbde9" />
      </TouchableOpacity>
      
      <Text style={styles.title}>Location Management</Text>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Add location"
          placeholderTextColor="#a8c7df"
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />
        <TouchableOpacity style={styles.addButton} onPress={addLocation}>
          <LinearGradient 
            colors={['#87ceeb', '#50ABE7']} 
            start={{x: 0, y: 0}} 
            end={{x: 1, y: 0}}
            style={styles.addButtonGradient}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.uploadButton} onPress={uploadCSV}>
        <LinearGradient 
          colors={['#87ceeb', '#50ABE7']} 
          start={{x: 0, y: 0}} 
          end={{x: 1, y: 0}}
          style={styles.uploadButtonGradient}
        >
          <Text style={styles.uploadButtonText}>Upload XLSX</Text>
        </LinearGradient>
      </TouchableOpacity>

      {isLoading ? (
        <ActivityIndicator size="large" color="#6cbde9" style={styles.loader} />
      ) : (
        <View style={styles.listContainer}>
          <Text style={styles.listHeader}>Locations</Text>
          <FlatList
            data={locations}
            keyExtractor={(item) => item.id?.toString() || item}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.listItemText}>{item.name || item}</Text>
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => removeLocation(item)}
                >
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
    fontSize: 26,
    fontWeight: "700",
    color: "#50ABE7",
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
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#6cbde9",
    fontSize: 16,
    color: "#2c5d7c",
    marginRight: 10,
  },
  addButton: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  uploadButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uploadButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  listContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#6cbde9",
    shadowColor: "#87ceeb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  listHeader: {
    color: "#50ABE7",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(108, 189, 233, 0.3)",
  },
  listItemText: {
    fontSize: 16,
    color: "#2c5d7c",
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 14,
  },
  backButton: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2eef8",
  },
  loader: {
    marginTop: 30,
  },
});

export default LocationManagement;