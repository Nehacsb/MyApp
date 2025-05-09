import React, { useContext, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";
import AdminScreen from "../screens/AdminScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import Dashboard from "../components/dashboard";
import CreateRide from "../components/CreateRide";
import FindRide from "../components/FindRide";
import MyRides from "../components/MyRide";
import PendingRequests from "../components/PendingRequest";
import Header from "../components/Header";
import DomainManagement from "../components/DomainManagement";
import LocationManagement from "../components/LocationManagement";
import ChatFeature from "../components/ChatFeature";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import VerifyResetOtpScreen from "../screens/VerifyResetOtpScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import RideDetails from "../components/RideDetails"; 
import AboutUsScreen  from "../screens/AboutUsScreen";

import ProfileSidebar from "../components/ProfileSidebar";
import AddCab from "../components/AddCab";
const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, isLoading, isAdmin, adminConfirmed, setAdminConfirmed } = useContext(AuthContext);

  useEffect(() => {
    if (user && isAdmin && adminConfirmed === null) {
      Alert.alert(
        "Admin Mode",
        "Do you want to continue as Admin?",
        [
          {
            text: "No",
            onPress: () => setAdminConfirmed(false),
            style: "cancel"
          },
          { 
            text: "Yes", 
            onPress: () => setAdminConfirmed(true) 
          }
        ],
        { cancelable: false }
      );
    }
  }, [user, isAdmin, adminConfirmed]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          isAdmin && adminConfirmed ? ( // Only show AdminScreen if both conditions are met
            <>
            <Stack.Screen name="AdminScreen" component={AdminScreen} />
            <Stack.Screen name="DomainManagement" component={DomainManagement} />
            <Stack.Screen name="LocationManagement" component={LocationManagement} />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Dashboard"
                component={Dashboard}
                options={{ header: () => <Header /> }}
              />
              <Stack.Screen name="CreateRide" component={CreateRide} />
              <Stack.Screen name="FindRide" component={FindRide} />
              <Stack.Screen name="MyRides" component={MyRides} />
              <Stack.Screen name="PendingRequests" component={PendingRequests} />
              <Stack.Screen name="ChatFeature" component={ChatFeature} />
              <Stack.Screen name="ProfileSidebar" component={ProfileSidebar} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="RideDetails" component={RideDetails} />
              <Stack.Screen name="AddCab" component={AddCab} />
              <Stack.Screen name="AboutUs" component={AboutUsScreen} />
            </>
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="VerifyResetOtp" component={VerifyResetOtpScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;