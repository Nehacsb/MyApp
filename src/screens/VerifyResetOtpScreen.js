import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Image } from "react-native";
import { AuthContext } from "../context/AuthContext";

const VerifyResetOtpScreen = ({ route, navigation }) => {
  const { verifyResetOtp } = useContext(AuthContext);
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { email } = route.params;

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyResetOtp(email, otp);
      navigation.navigate("ResetPassword", { email });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Lock Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../assets/location.jpeg')} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit OTP"
            placeholderTextColor="#9e9e9e"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleVerifyOtp}
            disabled={isSubmitting}
          >
            {isSubmitting ? 
              <ActivityIndicator color="#FFFFFF" /> : 
              <Text style={styles.buttonText}>Verify OTP</Text>
            }
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
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
    paddingTop: 50,
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  imageContainer: {
    
    width: '100%',
    height: 220,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 19,
  },
  image: {
    width: 300,
    height: 250,
    marginBottom: -5,
  },
  formContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 25,
    paddingVertical: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginHorizontal: 20,
    paddingTop: 40,
    marginTop: -25,
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

export default VerifyResetOtpScreen;