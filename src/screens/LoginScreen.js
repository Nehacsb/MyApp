import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, ScrollView } from "react-native";
import { AuthContext } from "../context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const { login, isAdmin } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Background Image (Now with proper sizing) */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../assets/login.jpeg')} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Login Form */}
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
          
          <TextInput
            placeholder="Email"
            placeholderTextColor="#9e9e9e"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#9e9e9e"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          
          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.link}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "#ffffff",
  },
  imageContainer: {
    paddingTop: 10,
    paddingBottom: 0, 
    width: '100%',
    height: 290, // Adjusted height to match the screenshot
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loginContainer: {
    backgroundColor: '#ffffff', // Changed to white to match screenshot
    borderRadius: 16,
    margin: 20,
    marginTop: 0, // Adjusted to match screenshot
    padding: 30, // Increased padding to match screenshot
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
    backgroundColor: "#50ABE7", // Changed from yellow to blue
    paddingVertical: 16, // Increased padding to match screenshot
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  link: {
    marginTop: 20,
    color: "#50ABE7", // Blue link color to match screenshot
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
});

export default LoginScreen;