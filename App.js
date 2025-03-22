import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Dashboard');

  const handleButtonClick = (screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'CreateRide':
        return <CreateRide onBack={() => setCurrentScreen('Dashboard')} />;
      case 'FindRide':
        return <FindRide onBack={() => setCurrentScreen('Dashboard')} />;
      case 'MyRides':
        return <MyRide onBack={() => setCurrentScreen('Dashboard')} />;
      case 'PendingRequests':
        return <PendingRequest onBack={() => setCurrentScreen('Dashboard')} />;
      default:
        return <Dashboard onButtonClick={handleButtonClick} />;
    }
  };

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
