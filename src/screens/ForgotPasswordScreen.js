import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Image } from "react-native";
import { AuthContext } from "../context/AuthContext";

const ForgotPasswordScreen = ({ navigation }) => {
  const { forgotPassword } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      navigation.navigate("VerifyResetOtp", { email });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Lock Image positioned to touch the form */}
        {/* <View style={styles.imageContainer}>
          <Image 
            source={require('../../assets/location.jpeg')} 
            style={styles.image}
            resizeMode="contain"
          />
        </View> */}

        <View style={styles.formContainer}>
          <Text style={styles.title}>Reset Your Password</Text>
          <Text style={styles.subtitle}>We'll send a verification code to your email</Text>
          
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#9e9e9e"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSendOtp} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Send Verification Code</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  imageContainer: {
    width: '100%',
    height: 250,
    justifyContent: 'flex-end',  // Aligns image to bottom
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 19,  // Pulls form up closer to image
  },
  image: {
    width: 300,  // Increased size
    height: 240,
    marginBottom: -5,  // Removes space below image
  },
  formContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },  // Shadow on top
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginHorizontal: 20,  // Full width
    paddingTop: 40,  // Extra space at top
    marginTop: -25,  // Overlaps with image
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#424242",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#757575",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  input: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#424242",
    fontSize: 16,
    marginBottom: 18,
  },
  button: {
    backgroundColor: "#50ABE7",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    shadowColor: "#ffd300",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 18,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#757575",
    fontSize: 15,
    fontWeight: "500",
  },
});


export default ForgotPasswordScreen;