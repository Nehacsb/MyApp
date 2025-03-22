import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";
import { AuthContext } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import Dashboard from "../components/dashboard";
import CreateRide from "../components/CreateRide"; // Import CreateRide
import FindRide from "../components/FindRide"; // Import FindRide
import MyRides from "../components/MyRide"; // Import MyRides
import PendingRequests from "../components/PendingRequest"; // Import PendingRequests
import Header from "../components/Header";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, isLoading } = useContext(AuthContext);

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
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;