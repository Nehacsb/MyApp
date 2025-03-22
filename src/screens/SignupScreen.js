import React, { useState, useContext } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, TouchableWithoutFeedback, ActivityIndicator,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

const SignupScreen = ({ navigation }) => {
  const { signup } = useContext(AuthContext);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genders = ["Male", "Female"];

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password || !phoneNumber || !gender) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(firstName, lastName, email, password, phoneNumber, gender);
      navigation.navigate("Login");
    } catch (error) {
      alert(error.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectGender = (selectedGender) => {
    setGender(selectedGender);
    setDropdownVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput placeholder="First Name" value={firstName} onChangeText={setFirstName} style={styles.input} />
      <TextInput placeholder="Last Name" value={lastName} onChangeText={setLastName} style={styles.input} />
      
      {/* Gender Dropdown */}
      <TouchableOpacity onPress={() => setDropdownVisible(true)} style={styles.dropdownTrigger}>
        <Text style={styles.dropdownText}>{gender || "Select Gender"}</Text>
      </TouchableOpacity>
      <Modal visible={dropdownVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.dropdownOptions}>
              {genders.map((item) => (
                <TouchableOpacity key={item} onPress={() => selectGender(item)} style={styles.dropdownOption}>
                  <Text style={styles.dropdownOptionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 10 },
  dropdownTrigger: {
    width: "100%", padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 10,
    justifyContent: "center", backgroundColor: "#fff",
  },
  dropdownText: { color: "#000" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  dropdownOptions: { width: "80%", backgroundColor: "#fff", borderRadius: 8, padding: 10 },
  dropdownOption: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  dropdownOptionText: { color: "#000" },
  button: { backgroundColor: "#007BFF", padding: 12, borderRadius: 8, width: "100%", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  link: { marginTop: 10, color: "#007BFF" },
});

export default SignupScreen;
