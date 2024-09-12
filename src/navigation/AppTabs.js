import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import DashboardScreen from '../screens/DashboardScreen';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const AppTabs = ({ route }) => {
  const { userData } = route.params || {};

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = '';

          switch (route.name) {
            case 'Attendance':
              iconName = focused ? 'reader' : 'reader-outline';
              break;
            case 'Profile ':
              iconName = focused ? 'person-sharp' : 'person-outline';
              break;
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            default:
              iconName = 'home'; // Default icon
          }

          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: focused ? '#8B0000' : 'transparent', // Dark red background if focused
                borderRadius: 20,
                padding: 8,
              }}
            >
              <Icon
                name={iconName}
                size={size}
                color={focused ? 'yellow' : color} // Icon color change
              />
              {focused && (
                <Text style={{ color: 'white', marginLeft: 3 }}>{route.name}</Text>
              )}
            </View>
          );
        },
        tabBarLabel: () => null, // Remove default labels
        tabBarActiveTintColor: '#fff', // Active tint color for icons and labels
        tabBarInactiveTintColor: '#ddd', // Inactive tint color for icons and labels
        tabBarStyle: {
          backgroundColor: '#CA282C', // Tab bar background color
          borderTopWidth: 0,
          margin: 10,
          height: 60,
          borderRadius: 30, // Optional: remove the top border
        },
      })}
    >
      <Tab.Screen
        name="Attendance"
        component={HomeScreen}
        initialParams={{ userData }}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        initialParams={{ userData }}
        options={{ headerShown: false }}

      />
      <Tab.Screen
        name="Profile "
        component={HistoryScreen}
        initialParams={{ userData }}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default AppTabs;
