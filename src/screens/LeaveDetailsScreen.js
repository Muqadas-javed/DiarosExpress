import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation'; // For location fetching
import axios from 'axios'; // For API request

const CheckinScreen = ({route}) => {
  const {userData} = route.params || {};

  const [loading, setLoading] = useState(false);
  
  const checkin = async () => {
    setLoading(true);
    
    // Fetch current location using Geolocation API
    Geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const data = {
          latitude: latitude,
          longitude: longitude,
        };

        // const token = 'your-authentication-token-here'; // Replace with actual token

        try {
          const response = await axios.post(
            'https://hrmfiles.com/api/attendance/checkinlocation',
            data,
            {
              headers: {
                Authorization: `Bearer ${userData.access_token}`,

                'Content-Type': 'application/json',
              },
            }
          );
          
          const { message, employee } = response.data;
          
          // Handle success response
          Alert.alert('Check-in', message, [
            {
              text: 'OK',
              onPress: () => console.log('Check-in successful:', employee),
            },
          ]);
          
        } catch (error) {
          console.error('Check-in failed:', error.response);
          Alert.alert('Error', 'Check-in failed. Please try again.');
        }
        
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        Alert.alert('Error', 'Failed to get location');
        console.error('Location error:', error);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Check-in Screen</Text>
      <Button
        title={loading ? 'Checking in...' : 'Check-in'}
        onPress={checkin}
        disabled={loading}
      />
    </View>
  );
};

export default CheckinScreen;
