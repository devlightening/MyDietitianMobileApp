import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { View, ActivityIndicator } from 'react-native';

// Auth Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Free Mode
import FreeHomeScreen from './src/screens/FreeHomeScreen';
import PremiumActivationScreen from './src/screens/PremiumActivationScreen';

// Premium Screens
import TodayScreen from './src/screens/TodayScreen';
import CheckIngredientsScreen from './src/screens/CheckIngredientsScreen';
import AlternativeResultScreen from './src/screens/AlternativeResultScreen';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

function AppNavigator() {
  const { isAuthenticated, isPremium, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : !isPremium ? (
        <>
          <Stack.Screen name="FreeHome" component={FreeHomeScreen} />
          <Stack.Screen name="ActivatePremium" component={PremiumActivationScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Today" component={TodayScreen} />
          <Stack.Screen name="CheckIngredients" component={CheckIngredientsScreen} />
          <Stack.Screen name="AlternativeResult" component={AlternativeResultScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}
