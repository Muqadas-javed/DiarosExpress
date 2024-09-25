import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import backgroundImg from '../assets/background.png';

const LeaveDetailsScreen = ({route, navigation}) => {
  const {userData} = route.params || {};
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveData();
  }, [userData, navigation]);

  const fetchLeaveData = async () => {
    try {
      const response = await fetch('https://hrmfiles.com/api/leaves', {
        headers: {
          Authorization: `Bearer ${userData?.access_token}`, // Corrected string interpolation
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setLeaveData(Array.isArray(data) ? data : []); // Ensure leaveData is always an array
    } catch (error) {
      console.error('Error fetching leave data:', error);
      Alert.alert('Error', 'An error occurred while fetching leave data.');
      if (error.message === 'Network response was not ok') {
        Alert.alert(
          'Unauthorized',
          'Your session has expired. Please log in again.',
        );
        navigation.navigate('Login'); // Redirect to the login screen
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    Alert.alert(
      'Delete Request',
      'Are you sure you want to delete this leave request?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `https://hrmfiles.com/api/leaves/${id}`,
                {
                  // Corrected string interpolation for URL
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${userData?.access_token}`, // Corrected string interpolation
                  },
                },
              );
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              Alert.alert('Deleted', 'Leave request has been deleted.');
              fetchLeaveData(); // Refresh the list after deletion
            } catch (error) {
              console.error('Error deleting leave request:', error);
              Alert.alert(
                'Error',
                'An error occurred while deleting the leave request.',
              );
            }
          },
        },
      ],
    );
  };

  const renderItem = ({item}) => (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.statusIcon,
              {backgroundColor: item.status === '1' ? 'green' : 'orange'},
            ]}
          />
        </View>
        <Text style={styles.title}>{item.leave_type}</Text>
        <TouchableOpacity
          onPress={() => handleDelete(item.leave_id)}
          style={styles.deleteIcon}>
          <Ionicons name="trash" size={20} color="#CA282C" />
        </TouchableOpacity>
      </View>
      <Text style={styles.details}>
        Reason: {item.reason || 'No reason provided'}
      </Text>
      <Text style={styles.details}>Duration: {item.duration}</Text>
      <Text style={styles.details}>Date: {item.start_date || 'N/A'}</Text>
      <Text style={styles.employename}>{item.name || 'N/A'}</Text>
      <Text style={styles.details}>
        Status:{' '}
        <Text style={item.status === '1' ? styles.approved : styles.pending}>
          {item.status === '1' ? 'Approved' : 'Pending'}
        </Text>
      </Text>
    </View>
  );

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Leave Details</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : leaveData.length === 0 ? (
          <Text style={styles.noRecordText}>No leave record found</Text>
        ) : (
          <FlatList
            data={leaveData}
            renderItem={renderItem}
            keyExtractor={item => item.leave_id.toString()}
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
    padding: 10,
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
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#333',
    flex: 1,
  },
  deleteIcon: {
    padding: 5,
  },
  details: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  employename: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    color: 'black',
    fontWeight: 'bold',
  },
  approved: {
    color: 'green',
    fontWeight: 'bold',
  },
  pending: {
    color: '#CA282C',
    fontWeight: 'bold',
  },
  noRecordText: {
    fontSize: 20,
    color: '#CA282C',
    textAlign: 'center',
    marginTop: 280,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
});

export default LeaveDetailsScreen;
