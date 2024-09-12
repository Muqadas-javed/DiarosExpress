// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import LeaveRequestScreen from './src/screens/LeaveRequestScreen';
import LeaveDetailsScreen from './src/screens/LeaveDetailsScreen';
import EmployeeDetailsScreen from './src/screens/EmployeeDetailsScreen'
import ApprovedLeavesScreen from './src/screens/ApprovedLeavesScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import CreateNotification from './src/screens/CreateNotification';
import ShowExpenseScreen from './src/screens/ShowExpenseScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import PayslipScreen from './src/screens/PayslipScreen';
import AppTabs from './src/navigation/AppTabs'; // Import the bottom tabs

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AppTabs" component={AppTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Notifications" component={NotificationScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="LeaveRequest" component={LeaveRequestScreen}  options={{ headerShown: false }}/>
        <Stack.Screen name="LeaveDetails" component={LeaveDetailsScreen}  options={{ headerShown: false }}/>
        <Stack.Screen name="EmployeeDetails" component={EmployeeDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ApprovedLeaves" component={ApprovedLeavesScreen}  options={{ headerShown: false }}/>
        <Stack.Screen name="CreateNotification" component={CreateNotification} options={{ headerShown: false }}/>
        <Stack.Screen name="ShowExpense" component={ShowExpenseScreen} options={{ headerShown: false }}/> 
        <Stack.Screen name="AddExpense" component={AddExpenseScreen}  options={{ headerShown: false }}/>
        <Stack.Screen name="Payslip" component={PayslipScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
