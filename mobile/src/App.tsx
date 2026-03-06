import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from './store/authStore';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import RemitoDetailScreen from './screens/RemitoDetailScreen';
import { ToastProvider } from 'react-native-toast-notifications';

const Stack = createStackNavigator();

export default function App() {
  const { isAuthenticated, loadUser, isLoading } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (isLoading) {
    return null; // Splash screen podría ser mostrado aquí
  }

  return (
    <ToastProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animationEnabled: true,
          }}
        >
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen
                name="RemitoDetail"
                component={RemitoDetailScreen as any}
                options={{ animationEnabled: true }}
              />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ToastProvider>
  );
}
