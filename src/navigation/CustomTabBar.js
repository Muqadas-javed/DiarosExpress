// src/navigation/CustomTabBar.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { routes, index } = state;

  return (
    <View style={styles.container}>
      {routes.map((route, i) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;
        const isFocused = index === i;

        const onPress = () => {
          navigation.navigate(route.name);
        };

        // Get the filled or outline icon based on the focus state
        const IconComponent = () => (
          <Icon 
            name={isFocused ? options.tabBarIconFilled : options.tabBarIconOutline} 
            size={24} 
            color={isFocused ? 'yellow' : '#ddd'} 
          />
        );

        return (
          <TouchableOpacity
            key={i}
            onPress={onPress}
            style={[
              styles.tabButton, 
              isFocused && styles.tabButtonFocused // Apply focused style if the tab is focused
            ]}
          >
            <View style={styles.tabContent}>
              <IconComponent />
              {isFocused && <Text style={[styles.tabLabel, { color: isFocused ? 'white' : '#ddd' }]}>{label}</Text>}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#CA282C',
    padding: 10,
    borderRadius: 35,
    margin: 15,
    elevation: 5, 
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10, // Add padding for all tabs
  },
  tabButtonFocused: {
    backgroundColor: '#8B0000', // Dark red background for the selected tab
    borderRadius: 20, // Add some border radius for better look
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabLabel: {
    marginLeft: 5,
    fontSize: 16,
  },
});

export default CustomTabBar;
