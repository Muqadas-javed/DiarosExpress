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
import Geolocation from 'react-native-geolocation-service';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {Platform} from 'react-native';
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
  const [locationLoading, setLocationLoading] = useState(false);
  const [userCurrentLocation, setUserCurrentLocation] = useState(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [clockInDateTime, setClockInDateTime] = useState(null);
  const [pakistanDate, setPakistanDate] = useState('');
  const [pakistanTime, setPakistanTime] = useState('');
  const [timePassed, setTimePassed] = useState('00:00:00');

  const [clockInTime, setClockInTime] = useState('');

  // Function to get location permission
  const getLocationPermission = async () => {
    let permission;

    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    } else if (Platform.OS === 'android') {
      permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    }

    const result = await check(permission);
    if (result === RESULTS.GRANTED) {
      return true;
    }

    const requestResult = await request(permission);
    return requestResult === RESULTS.GRANTED;
  };

  // Function to get location
  const getLocation = async () => {
    const isLocationEnabled = await getLocationPermission();
    if (isLocationEnabled) {
      setLocationLoading(true);
      Geolocation.getCurrentPosition(
        position => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserCurrentLocation(loc);
          setLocationLoading(false);
        },
        error => {
          console.error(error);
          Alert.alert('Error', 'Failed to get location');
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    } else {
      Alert.alert('Permission Denied', 'Location permission not granted.');
    }
  };

  // Pre-fetch location and check-in status on screen load
  useEffect(() => {
    const fetchCheckInStatus = async () => {
      try {
        const storedCheckInStatus = await AsyncStorage.getItem('checkInStatus');
        if (storedCheckInStatus !== null) {
          setHasCheckedIn(JSON.parse(storedCheckInStatus));
        }
      } catch (error) {
        console.error('Failed to fetch check-in status', error);
      }
    };

    fetchCheckInStatus();
    getLocation();
  }, []);
  useEffect(() => {
    const loadCheckInStatus = async () => {
      try {
        const status = await AsyncStorage.getItem('checkInStatus');
        const storedClockInDateTime = await AsyncStorage.getItem(
          'clockInDateTime',
        );

        if (status !== null) {
          const checkedIn = JSON.parse(status);
          setHasCheckedIn(checkedIn);

          // If checked in, retrieve clockInDateTime
          if (checkedIn && storedClockInDateTime) {
            const clockInDateTime = new Date(storedClockInDateTime);
            setClockInDateTime(clockInDateTime);
          }
        }
      } catch (error) {
        console.error(
          'Failed to load check-in status or clock-in time:',
          error,
        );
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

        // Auto check-out if timePassed exceeds 12:00:00 (43200 seconds)
        if (totalSeconds >= 43200) {
          handleCheckOut();
          clearInterval(interval); // Clear interval once checked out
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasCheckedIn, clockInDateTime]);

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
      const response = await axios.post(
        'https://hrmfiles.com/api/attendance/checkinlocation',
        {
          employee_id: userData.data.employee_id,
          latitude: userCurrentLocation.latitude,
          longitude: userCurrentLocation.longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.access_token}`,
          },
        },
      );

      if (response.data && response.data.message === 'Check-in successful') {
        const {check_in_time, time_passed, clock_in_date} =
          response.data.employee; // Corrected access to employee object
        const clockInDateTimeString = `${clock_in_date}T${check_in_time}`;
        const clockInDateTime = new Date(clockInDateTimeString);

        // Update states
        setClockInTime(check_in_time);
        setTimePassed(time_passed);
        setClockInDateTime(clockInDateTime); // Ensure this is set correctly

        // Save clockInDateTime and checkInStatus to AsyncStorage
        await AsyncStorage.setItem('clockInDateTime', clockInDateTimeString);
        await AsyncStorage.setItem('checkInStatus', JSON.stringify(true)); // Save status
        setHasCheckedIn(true);
        Alert.alert('Check-In Successful', 'You have successfully checked in.');
      } else {
        Alert.alert('Check-In Failed', 'Please try again later.');
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
        <ActivityIndicator size="large" color="#ffffff" />
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
