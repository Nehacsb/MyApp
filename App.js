import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";


export default function App() {
  console.log('Se2123rver starting...');
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}