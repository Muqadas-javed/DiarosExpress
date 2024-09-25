import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

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

  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pakistanTime, setPakistanTime] = useState('');
  const [pakistanDate, setPakistanDate] = useState('');
  const [clockInTime, setClockInTime] = useState('');
  const [timePassed, setTimePassed] = useState('');
  const [clockInDateTime, setClockInDateTime] = useState(null);

  // Load check-in status and clock-in timestamp from AsyncStorage
  useEffect(() => {
    const loadCheckInStatus = async () => {
      try {
        const status = await AsyncStorage.getItem('checkInStatus');
        const savedClockInDateTime = await AsyncStorage.getItem(
          'clockInDateTime',
        );

        if (status !== null) {
          setHasCheckedIn(JSON.parse(status));
        }

        if (savedClockInDateTime) {
          const dateTime = new Date(savedClockInDateTime);
          setClockInDateTime(dateTime);
          // Format clock-in time for display
          const timeFormatter = new Intl.DateTimeFormat([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          });
          const formattedClockInTime = timeFormatter.format(dateTime);
          setClockInTime(formattedClockInTime);
        }

        // Remove time_pass from AsyncStorage as it will be calculated locally
        await AsyncStorage.removeItem('timePassed');
        setTimePassed('');
      } catch (error) {
        console.error(
          'Failed to load check-in status or clock-in time:',
          error,
        );
      }
    };

    const checkInStatus = async () => {
      try {
        const response = await axios.get(
          'https://hrmfiles.com/api/attendance/status',
          {
            headers: {
              Authorization: `Bearer ${userData.access_token}`,
            },
            params: {
              employee_id: userData.data.employee_id,
            },
          },
        );

        const checkedIn = response.data.checked_in;
        setHasCheckedIn(checkedIn);
        await AsyncStorage.setItem('checkInStatus', JSON.stringify(checkedIn));

        if (
          checkedIn &&
          response.data.attendance &&
          response.data.attendance.clock_in_time
        ) {
          const {clock_in_time} = response.data.attendance;
          // Combine date and time into a full timestamp
          const clockInDateTimeString = `${clock_in_time}`;
          const clockInDateTime = new Date(clockInDateTimeString);

          setClockInDateTime(clockInDateTime);
          await AsyncStorage.setItem(
            'clockInDateTime',
            clockInDateTime.toISOString(),
          );

          // Format clock-in time for display
          const timeFormatter = new Intl.DateTimeFormat([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          });
          const formattedClockInTime = timeFormatter.format(clockInDateTime);
          setClockInTime(formattedClockInTime);

          // Initialize timePassed to zero
          setTimePassed('00:00:00');
        }
      } catch (error) {
        // console.error('Check-in Status Error:', error);
      } finally {
        setLoading(false);
      }
    };

    const initialize = async () => {
      await loadCheckInStatus();
      await checkInStatus();
    };

    initialize();
  }, [userData.access_token, userData.data.employee_id]);

  // Update Pakistan time and date every second
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

  // Calculate elapsed time since clock-in
  useEffect(() => {
    let interval = null;

    if (hasCheckedIn && clockInDateTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = now - clockInDateTime; // in milliseconds

        if (elapsed < 0) {
          setTimePassed('00:00:00');
          return;
        }

        const totalSeconds = Math.floor(elapsed / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const formattedTime = `${String(hours).padStart(2, '0')}:${String(
          minutes,
        ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        setTimePassed(formattedTime);
        // Optionally, save to AsyncStorage if needed
        // await AsyncStorage.setItem('timePassed', formattedTime);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, []);

  // Handle Check-In
  const handleCheckIn = async () => {
    if (hasCheckedIn) {
      Alert.alert('Already Checked In', 'You have already checked in.');
      return;
    }

    try {
      const response = await axios.post(
        'https://hrmfiles.com/api/attendance/checkin',
        {
          employee_id: userData.data.employee_id,
        },
        {
          headers: {
            Authorization: `Bearer ${userData?.access_token}`,
          },
        },
      );
      const result = response.data;

      if (response.data && response.data.message === 'Check-in successful') {
        const {clock_in_time} = result.attendance;
        const clockInDateTimeString = `${clock_in_time}`;
        const clockInDateTime = new Date(clockInDateTimeString);
        setClockInDateTime(clockInDateTime);
        setClockInTime(
          new Intl.DateTimeFormat([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }).format(clockInDateTime),
        );
        setHasCheckedIn(true);
        setTimePassed('00:00:00'); // Reset elapsed time to 0
        // Save check-in status and time in AsyncStorage
        await AsyncStorage.setItem('checkInStatus', JSON.stringify(true));
        await AsyncStorage.setItem(
          'clockInDateTime',
          clockInDateTime.toISOString(),
        );

        // await AsyncStorage.setItem('checkInStatus', JSON.stringify(true));
        // await AsyncStorage.setItem('clockInTime', clock_in_time);
        // await AsyncStorage.setItem('timePassed', time_pass);
        Alert.alert('Checked In', 'You have successfully checked in.');
      } else {
        Alert.alert('Check-in failed', 'Please try again later.');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        Alert.alert('Already Checked In', 'You have already checked in.');
      } else {
        console.error('Check-in Error:', error);
        Alert.alert(
          'Check-in Error',
          'An error occurred while checking in. Please try again later.',
        );
      }
    }
  };

  // Handle Check-Out
  const handleCheckOut = async () => {
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
        setTimePassed('');
        setClockInDateTime(null);
        await AsyncStorage.setItem('checkInStatus', JSON.stringify(false));
        await AsyncStorage.removeItem('clockInDateTime');
        // Remove time_pass if it was stored
        await AsyncStorage.removeItem('timePassed');
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
    }
  };

  const imageUrl =
    userData.data.image_url || 'https://example.com/fallback-image.png';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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
              {timePassed ? timePassed : '00:00:00'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    alignItems: 'center',
    alignContent: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    marginBottom: 70,
    alignItems: 'center',
    width: '100%',
    position: 'relative', // To position the notification icon correctly
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
    right: 0, // Adjusted to position correctly
    top: -10,
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
    justifyContent: 'center',
    width: 200, // Adjust as needed
    height: 200, // Adjust as needed
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 120,
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
    marginTop: 70,
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
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
