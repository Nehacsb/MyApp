import React, { useContext, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";
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

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, isLoading, isAdmin } = useContext(AuthContext);
  const [adminConfirmed, setAdminConfirmed] = useState(null); // Start as null to detect change

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (user && isAdmin && adminConfirmed === null) {
    return (
      <LoginScreen
        navigation={{
          navigate: (screen) => {
            if (screen === "AdminScreen") {
              setAdminConfirmed(true); // Admin pressed Yes
            } else {
              setAdminConfirmed(false); // Admin pressed No
            }
          },
        }}
      />
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          adminConfirmed ? (
            <Stack.Screen name="AdminScreen" component={AdminScreen} />
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
            </>
          )
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
