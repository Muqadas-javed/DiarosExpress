import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';

// Import your images
import backgroundImg from '../assets/background.png';
import circle1 from '../assets/circle1.png';
import circle2 from '../assets/circle2.png';
import hand from '../assets/hand.png';
import punchOutImage from '../assets/punchout.png';
import frontImage from '../assets/Front.png';
import clock from '../assets/clock.png';
import clock1 from '../assets/clock1.png';

const HomeScreen = ({route}) => {
  const {userData} = route.params || {};
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [clockInDateTime, setClockInDateTime] = useState(null);
  const [pakistanDate, setPakistanDate] = useState('');
  const [pakistanTime, setPakistanTime] = useState('');
  const [timePassed, setTimePassed] = useState('00:00:00');

  const [clockInTime, setClockInTime] = useState('');

  
  

  
  useEffect(() => {
    const loadCheckInStatus = async () => {
      try {
        const status = await AsyncStorage.getItem('checkInStatus');
        const storedClockInDateTime = await AsyncStorage.getItem('clockInDateTime');
        const storedClockInTime = await AsyncStorage.getItem('clockInTime'); // Retrieve clock_in_time from AsyncStorage
  
        if (status !== null) {
          const checkedIn = JSON.parse(status);
          setHasCheckedIn(checkedIn);
  
          // If checked in, retrieve clockInDateTime and clockInTime
          if (checkedIn && storedClockInDateTime) {
            const clockInDateTime = new Date(storedClockInDateTime);
            setClockInDateTime(clockInDateTime);
          }
  
          // Set clockInTime from AsyncStorage if available
          if (storedClockInTime) {
            setClockInTime(storedClockInTime); // Update clockInTime state
          }
        }
      } catch (error) {
        console.error('Failed to load check-in status or clock-in time:', error);
      } finally {
        setLoading(false);
      }
    };
  
    loadCheckInStatus();
  }, []);
  
  // calculating time pass
  useEffect(() => {
    let interval = null;
  
    if (hasCheckedIn && clockInDateTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = now - clockInDateTime; // in milliseconds
  
        // Calculate the total seconds elapsed
        const totalSeconds = Math.floor(elapsed / 1000); 
  
        // Log the elapsed time in seconds
        // console.log('Elapsed Time (seconds):', totalSeconds);
  
        if (totalSeconds < 0) {
          setTimePassed('00:00:00');
          return;
        }
  
        // Format the elapsed time into hours, minutes, and seconds
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
  
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(
          minutes,
        ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
        setTimePassed(formattedTime); // Update the time passed state
  
        // Check if the time passed exceeds 12 hours (43200 seconds)
        if (totalSeconds >= 43200) {
          console.log('12 hours reached, auto check-out initiated.');
          handleCheckOut(); // Call check-out function
          clearInterval(interval); // Clear the interval once checked out
        }
      }, 1000);
    }
  
    // Cleanup the interval when the component unmounts or conditions change
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasCheckedIn, clockInDateTime]); // Run this effect when check-in status or clock-in time changes
  
  useEffect(() => {
    const updatePakistanTimeAndDate = () => {
      const timeOptions = {
        timeZone: 'Asia/Karachi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };

      const dateOptions = {
        timeZone: 'Asia/Karachi',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        weekday: 'long',
      };

      const timeFormatter = new Intl.DateTimeFormat([], timeOptions);
      const dateFormatter = new Intl.DateTimeFormat([], dateOptions);

      const formattedTime = timeFormatter.format(new Date());
      const [time, period] = formattedTime.split(' ');
      const capitalizedPeriod = period ? period.toUpperCase() : '';
      setPakistanTime(`${time} ${capitalizedPeriod}`);
      setPakistanDate(dateFormatter.format(new Date()));
    };

    updatePakistanTimeAndDate();
    const interval = setInterval(updatePakistanTimeAndDate, 1000);

    return () => clearInterval(interval);
  }, []);

  // Function to handle Check-In
  const handleCheckIn = async () => {
    if (hasCheckedIn) {
      Alert.alert('Already Checked In', 'You have already checked in.');
      return;
    }
  
    try {
      setLoading(true);
  
      const response = await axios.post(
        'https://hrmfiles.com/api/attendance/checkin',
        {
          employee_id: userData.data.employee_id,
    
        },
        {
          headers: {
            Authorization: `Bearer ${userData.access_token}`,
          },
        }
      );
  
      if (response.data && response.data.message === 'Check-in successful') {
        const { check_in_time, time_passed } = response.data.employee;
  
        // Format and store check-in time
        const now = new Date();
        setClockInTime(check_in_time);
        setTimePassed(time_passed);
        setClockInDateTime(now);
  
        // Save check-in data to AsyncStorage
        await AsyncStorage.setItem('checkInStatus', JSON.stringify(true));
        await AsyncStorage.setItem('clockInDateTime', now.toISOString());
        await AsyncStorage.setItem('clockInTime', check_in_time);
  
        setHasCheckedIn(true);
        Alert.alert('Check-In Successful', 'You have successfully checked in.');
      } else {
        Alert.alert('Check-In Failed', 'Unable to complete check-in. Try again.');
      }
    } catch (error) {
      console.error('Check-In Error:', error.response?.data || error.message);
      Alert.alert('Check-In Error', 'An error occurred during check-in.');
    } finally {
      setLoading(false);
    }
  };
  
  
  

  // Function to handle Check-Out
  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://hrmfiles.com/api/attendance/checkout',
        {
          employee_id: userData.data.employee_id,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.access_token}`,
          },
        },
      );

      if (response.data && response.data.message === 'Check-out successful') {
        setHasCheckedIn(false);
        setClockInTime('');
        setTimePassed('00:00:00');
        await AsyncStorage.setItem('checkInStatus', JSON.stringify(false)); // Save status
        setClockInTime('');
        setTimePassed('00:00:00');
        Alert.alert('Checked Out', 'You have successfully checked out.');
      } else {
        Alert.alert('Check-out failed', 'Please try again later.');
      }
    } catch (error) {
      console.error('Check-out Error:', error);
      Alert.alert(
        'Check-out Error',
        'An error occurred while checking out. Please try again later.',
      );
    } finally {
      setLoading(false);
    }
  };

  const imageUrl =
    userData.data.image_url || 'https://example.com/fallback-image.png';

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#CA282C" />
      </View>
    );
  }

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <Image source={{uri: imageUrl}} style={styles.image} />
          <View style={styles.profile}>
            <Text style={styles.userName}>HEY {userData.data.name}</Text>
            <Text style={styles.userRole}>{userData.data.role}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationIcon}
            onPress={() => navigation.navigate('Notifications', {userData})}>
            <Ionicons name="notifications" size={28} color="#CA282C" />
          </TouchableOpacity>
        </View>
        <Text style={styles.timeText}>{pakistanTime}</Text>
        <Text style={styles.dateText}>{pakistanDate}</Text>

        <TouchableOpacity
          style={styles.punchInButton}
          onPress={hasCheckedIn ? handleCheckOut : handleCheckIn}>
          <Image source={circle1} style={styles.circle1Image} />
          <Image source={circle2} style={styles.circle2Image} />
          <Text style={styles.punchInText}>
            {hasCheckedIn ? 'PUNCH OUT' : 'PUNCH IN'}
          </Text>
          <Image
            source={hasCheckedIn ? punchOutImage : hand}
            style={styles.handImage}
          />
          {hasCheckedIn && (
            <Image source={frontImage} style={styles.frontImage} />
          )}
        </TouchableOpacity>

        <View style={styles.clockRow}>
          <View style={styles.clockContainer}>
            <Image source={clock} style={styles.clockImage} />
            <Text style={styles.clockInTimeText}>
              {hasCheckedIn && clockInTime ? clockInTime : '10:00 AM'}
            </Text>
            <Text style={styles.clockText}>Punch In</Text>
          </View>

          <View style={styles.clockContainer}>
            <Image source={clock1} style={styles.clockImage} />
            <Text style={styles.clockInTimeText}>
              {hasCheckedIn && timePassed ? timePassed : '00:00:00'}
            </Text>
            <Text style={styles.clockText}>Total Hours</Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    padding: 20,
    alignItems: 'center',
    alignContent: 'center',
  },
  profileContainer: {
    marginTop: 10,
    flexDirection: 'row',
    marginLeft: -55,
    marginBottom: 50,
  },
  profile: {
    marginTop: 10,
  },
  userName: {
    fontSize: 24,
    color: '#333',
  },
  userRole: {
    fontSize: 18,
    color: '#666',
    textTransform: 'capitalize',
  },
  notificationIcon: {
    position: 'absolute',
    left: 290,
    top: -10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  image: {
    width: 70,
    height: 70,
    marginRight: 10,
    borderRadius: 50,
  },
  timeText: {
    fontSize: 50,
    fontWeight: '300',
    color: '#333',
  },
  dateText: {
    fontSize: 20,
    color: '#666',
  },
  punchInButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  circle1Image: {
    position: 'absolute',
    width: 190,
    height: 190,
    top: 20,
  },
  circle2Image: {
    position: 'absolute',
    width: 150,
    height: 150,
    top: 40,
  },
  punchInText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 140,
  },
  handImage: {
    position: 'absolute',
    width: 40,
    height: 60,
    top: 70,
  },
  frontImage: {
    position: 'absolute',
    width: 190,
    height: 195,
    top: 20,
  },
  // Styles for the clock row and images
  clockRow: {
    flexDirection: 'row',
    marginTop: 105,
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 15,
  },
  clockImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  clockInTimeText: {
    color: 'black',
    fontSize: 18,
    paddingTop: 8,
    fontWeight: '500',
  },
  clockContainer: {
    alignItems: 'center',
  },

  clockText: {
    color: '#666',
  },
});

export default HomeScreen;
