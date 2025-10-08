import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
  Alert,
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
      const response = await fetch('https://mayfaircareagency.uk/api/announcement', {
        headers: {
          Authorization: `Bearer ${userData.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const text = await response.text();

      if (response.headers.get('content-type')?.includes('application/json')) {
        const json = JSON.parse(text);
        const sortedNotifications = json.announcements.sort(
          (a, b) => new Date(b.date) - new Date(a.date),
        );
        setNotifications(sortedNotifications);
      } else {
        Alert.alert(
          'Error',
          'Unable to fetch notifications. The server returned a non-JSON response.',
          [{ text: 'OK' }],
        );
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert(
        'Error',
        'An error occurred while fetching notifications. Please try again later.',
        [{ text: 'OK' }],
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async id => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this notification?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const response = await fetch(
                `https://mayfaircareagency.uk/api/announcement/${id}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${userData.access_token}`,
                    'Content-Type': 'application/json',
                  },
                },
              );

              if (response.ok) {
                setNotifications(prevNotifications =>
                  prevNotifications.filter(
                    notification => notification.id !== id,
                  ),
                );
                Alert.alert('Success', 'Notification deleted successfully.', [
                  { text: 'OK' },
                ]);
              } else {
                Alert.alert(
                  'Error',
                  'Failed to delete notification. Please try again.',
                  [{ text: 'OK' }],
                );
              }
            } catch (error) {
              console.error('Error deleting notification:', error);
              Alert.alert(
                'Error',
                'An error occurred while deleting the notification. Please try again later.',
                [{ text: 'OK' }],
              );
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }) => {
    const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

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
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <View style={styles.footer}>
            <Text style={styles.date}>{formattedDate}</Text>
            <Text style={styles.employeeName}>{item.employee_name}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => deleteNotification(item.id)}
          style={styles.delete}>
          <Ionicons name="trash" size={20} color="#CA282C" />
        </TouchableOpacity>
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
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('CreateNotification', { userData })
            }
            style={styles.addButton}>
            <Text style={styles.addButtonText}>Add</Text>
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#00557a" />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={item => item.id.toString()}
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
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'black',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00557a',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 'auto',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  list: {
    paddingBottom: 20,
  },
  delete: {
    paddingBottom: 45,
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
    color: 'black',
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
