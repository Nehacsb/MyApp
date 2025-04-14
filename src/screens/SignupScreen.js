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
    backgroundColor: "#FFFFFF", // clean white background
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1F2937", // dark slate gray
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563", // medium gray for subtitle
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#F3F4F6", // very light gray for inputs
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#1F2937",
    fontSize: 16,
    marginBottom: 16,
  },
  dropdownTrigger: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    marginBottom: 16,
  },
  dropdownText: {
    color: "#1F2937",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownOptions: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  dropdownOptionText: {
    color: "#1F2937",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#111827", // formal Uber-like black
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  link: {
    marginTop: 20,
    color: "#2563EB", // clean blue accent
    fontSize: 15,
    textAlign: "center",
    fontWeight: "500",
  },
});


export default SignupScreen;
