// src/screens/NotificationScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
  Alert
} from 'react-native';
import backgroundImg from '../assets/background.png';
import Ionicons from 'react-native-vector-icons/Ionicons';

const NotificationScreen = ({ route, navigation }) => {
  const { userData } = route.params || {};
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('https://hrmfiles.com/api/announcement', {
        headers: {
          Authorization: `Bearer ${userData.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response URL:', response.url);

      const text = await response.text();

      if (response.headers.get('content-type')?.includes('application/json')) {
        const json = JSON.parse(text);
        // Sort notifications by date, newest first
        const sortedNotifications = json.announcements.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setNotifications(sortedNotifications);
      } else {
        console.error('Received non-JSON response:', text);
        Alert.alert(
          'Error',
          'Unable to fetch notifications. The server returned a non-JSON response.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert(
        'Error',
        'An error occurred while fetching notifications. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    // Format the date in a more appealing way
    const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Check if the notification date is in the future
    const isFutureDate = new Date(item.date) > new Date();

    return (
      <View style={styles.notificationCard}>
        <View
          style={[
            styles.statusIcon,
            { backgroundColor: isFutureDate ? 'green' : 'orange' },
          ]}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {item.title}
          </Text>
          <Text style={styles.message}>{item.message}</Text>
          <View style={styles.footer}>
            <Text style={styles.date}>{formattedDate}</Text>
            <Text style={styles.employeeName}>{item.employee_name}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Notifications</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#CA282C" />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 30,
  },
  headerText: {
    fontSize: 20,
    marginLeft: 10,
    fontWeight: '600',
    color: 'black',
  },
  list: {
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
  },
  statusIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black', // Default color for past and current dates
  },
  futureTitle: {
    color: 'black', // Color for future dates
  },
  message: {
    fontSize: 14,
    color: '#555',
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  employeeName: {
    fontSize: 12,
    color: '#999',
  },
});

export default NotificationScreen;
