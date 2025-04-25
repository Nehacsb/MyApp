import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";

const ResetPasswordScreen = ({ route, navigation }) => {
  const { resetPassword } = useContext(AuthContext);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { email } = route.params;

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please enter and confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }

    /*if (newPassword.length < 6) {
      Alert.alert("Error", "Password should be at least 6 characters");
      return;
    }*/

    setIsSubmitting(true);
    try {
      await resetPassword(email, newPassword);
      Alert.alert("Success", "Password reset successfully", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Create a new password for {email}</Text>
      
      <TextInput
        placeholder="New Password"
        placeholderTextColor="#aaa"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={styles.input}
      />
      
      <TextInput
        placeholder="Confirm New Password"
        placeholderTextColor="#aaa"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />
      
      <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
      </TouchableOpacity>
    </View>
  );
};

// Use the same styles as ForgotPasswordScreen or customize as needed
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#111827",
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ResetPasswordScreen;