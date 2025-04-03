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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>
      <Text style={styles.subtitle}>Join us and start your journey</Text>
      
      <TextInput placeholder="First Name" placeholderTextColor="#aaa" value={firstName} onChangeText={setFirstName} style={styles.input} />
      <TextInput placeholder="Last Name" placeholderTextColor="#aaa" value={lastName} onChangeText={setLastName} style={styles.input} />
      
      {/* Gender Dropdown */}
      <TouchableOpacity onPress={() => setDropdownVisible(true)} style={styles.dropdownTrigger}>
        <Text style={styles.dropdownText}>{gender || "Select Gender"}</Text>
      </TouchableOpacity>
      <Modal visible={dropdownVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.dropdownOptions}>
              {genders.map((item) => (
                <TouchableOpacity key={item} onPress={() => { setGender(item); setDropdownVisible(false); }} style={styles.dropdownOption}>
                  <Text style={styles.dropdownOptionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <TextInput placeholder="Email" placeholderTextColor="#aaa" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Phone Number" placeholderTextColor="#aaa" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" style={styles.input} />
      <TextInput placeholder="Password" placeholderTextColor="#aaa" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#0F172A", // Deep dark blue background
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#94A3B8", // Light grayish blue
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#1E293B", // Dark grayish blue
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 15,
  },
  dropdownTrigger: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    marginBottom: 15,
    justifyContent: "center",
  },
  dropdownText: { color: "#ffffff" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  dropdownOptions: { width: "80%", backgroundColor: "#1E293B", borderRadius: 8, padding: 10 },
  dropdownOption: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#94A3B8" },
  dropdownOptionText: { color: "#ffffff" },
  button: {
    backgroundColor: "#4F46E5", // Royal blue
    padding: 15,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    color: "#60A5FA", // Soft blue
    fontSize: 16,
  },
});

export default SignupScreen;
