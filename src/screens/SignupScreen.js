import React, { useState, useContext } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, TouchableWithoutFeedback, ActivityIndicator,
  ScrollView
} from "react-native";
import { AuthContext } from "../context/AuthContext";

const SignupScreen = ({ navigation }) => {
  const { signup, verifyOTP } = useContext(AuthContext);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");

  const genders = ["Male", "Female"];

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password || !phoneNumber || !gender) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);

      // First step: trigger signup to send OTP
      await signup(firstName, lastName, email, password, phoneNumber, gender);
      setOtpSent(true);
      alert("OTP sent to your email");
    } catch (error) {
      alert(error.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError("Please enter the OTP");
      return;
    }

    try {
      setIsSubmitting(true);
      await verifyOTP(email, otp);
      alert("Account created successfully!");
      navigation.navigate("Login");
    } catch (error) {
      setOtpError(error.message || "OTP verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Signup Form */}
        <View style={styles.signupContainer}>
          <Text style={styles.title}>Create an Account</Text>
          <Text style={styles.subtitle}>Join us and start your journey</Text>

          {!otpSent ? (
            <>
              <TextInput
                placeholder="First Name"
                placeholderTextColor="#9e9e9e"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
              />
              <TextInput
                placeholder="Last Name"
                placeholderTextColor="#9e9e9e"
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
              />

              {/* Gender Dropdown */}
              <TouchableOpacity 
                onPress={() => setDropdownVisible(true)} 
                style={[styles.input, {justifyContent: 'center'}]}
              >
                <Text style={{color: gender ? '#424242' : '#9e9e9e'}}>
                  {gender || "Select Gender"}
                </Text>
              </TouchableOpacity>
              <Modal visible={dropdownVisible} transparent animationType="fade">
                <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
                  <View style={styles.modalOverlay}>
                    <View style={styles.dropdownOptions}>
                      {genders.map((item) => (
                        <TouchableOpacity 
                          key={item} 
                          onPress={() => {
                            setGender(item);
                            setDropdownVisible(false);
                          }} 
                          style={styles.dropdownOption}
                        >
                          <Text style={styles.dropdownOptionText}>{item}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>

              <TextInput
                placeholder="Email"
                placeholderTextColor="#9e9e9e"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              <TextInput
                placeholder="Phone Number"
                placeholderTextColor="#9e9e9e"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                style={styles.input}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#9e9e9e"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            </>
          ) : (
            <>
              <TextInput
                placeholder="Enter OTP"
                placeholderTextColor="#9e9e9e"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                style={styles.input}
              />
              {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
            </>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={otpSent ? handleVerifyOtp : handleSignup}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>
                {otpSent ? "Verify OTP" : "Sign Up"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
  },
  signupContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 20,
    shadowColor: "#757575",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: "#424242",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#424242",
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#50ABE7",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginTop: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  link: {
    marginTop: 16,
    color: "#50ABE7",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
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
    borderColor: "#e0e0e0",
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  dropdownOptionText: {
    color: "#424242",
    fontSize: 16,
  },
  errorText: {
    color: "#f44336",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
});
export default SignupScreen;