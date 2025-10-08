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
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Sound from 'react-native-sound';

// Images
import backgroundImg from '../assets/background.png';
import hand from '../assets/hand.png';
import punchOutImage from '../assets/punchout.png';
import clock from '../assets/clock.png';
import clock1 from '../assets/clock1.png';

Sound.setCategory('Playback');

const HomeScreen = ({ route }) => {
  const { userData } = route.params || {};
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [clockInDateTime, setClockInDateTime] = useState(null);
  const [pakistanDate, setPakistanDate] = useState('');
  const [pakistanTime, setPakistanTime] = useState('');
  const [timePassed, setTimePassed] = useState('00:00:00');
  const [clockInTime, setClockInTime] = useState('');

  const playCheckInSound = () => {
    const sound = new Sound(require('../assets/Booster.wav'), Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Check-in Sound Load Error:', error);
        return;
      }
      sound.setVolume(1.0);
      sound.play(() => sound.release());
    });
  };

  const playCheckOutSound = () => {
    const sound = new Sound(require('../assets/Booster.wav'), Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Check-out Sound Load Error:', error);
        return;
      }
      sound.setVolume(1.0);
      sound.play(() => sound.release());
    });
  };

  useEffect(() => {
    const loadCheckInStatus = async () => {
      try {
        const status = await AsyncStorage.getItem('checkInStatus');
        const storedClockInDateTime = await AsyncStorage.getItem('clockInDateTime');
        const storedClockInTime = await AsyncStorage.getItem('clockInTime');

        if (status !== null) {
          const checkedIn = JSON.parse(status);
          setHasCheckedIn(checkedIn);

          if (checkedIn && storedClockInDateTime) {
            const clockInDateTime = new Date(storedClockInDateTime);
            setClockInDateTime(clockInDateTime);
          }

          if (storedClockInTime) {
            setClockInTime(storedClockInTime);
          }
        }
      } catch (error) {
        console.error('Failed to load check-in data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCheckInStatus();
  }, []);

  useEffect(() => {
    let interval = null;

    if (hasCheckedIn && clockInDateTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = now - clockInDateTime;
        const totalSeconds = Math.floor(elapsed / 1000);

        if (totalSeconds < 0) {
          setTimePassed('00:00:00');
          return;
        }

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const formattedTime = `${String(hours).padStart(2, '0')}:${String(
          minutes
        ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        setTimePassed(formattedTime);
        if (totalSeconds >= 1000) {
          console.log('10 hours reached, auto check-out.');
          handleCheckOut();
          clearInterval(interval);
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

  const handleCheckIn = async () => {
    if (hasCheckedIn) {
      Alert.alert('Already Checked In', 'You have already checked in.');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        'https://mayfaircareagency.uk/api/attendance/checkin',
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

        const now = new Date();
        setClockInTime(check_in_time);
        setTimePassed(time_passed);
        setClockInDateTime(now);

        await AsyncStorage.setItem('checkInStatus', JSON.stringify(true));
        await AsyncStorage.setItem('clockInDateTime', now.toISOString());
        await AsyncStorage.setItem('clockInTime', check_in_time);

        setHasCheckedIn(true);
        playCheckInSound();
        Alert.alert('Check-In Successful', 'You have successfully checked in.');
      } else {
        Alert.alert('Check-In Failed', 'Unable to complete check-in.');
      }
    } catch (error) {
      console.error('Check-In Error:', error.response?.data || error.message);
      Alert.alert('Check-In Error', 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://mayfaircareagency.uk/api/attendance/checkout',
        {
          employee_id: userData.data.employee_id,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.access_token}`,
          },
        }
      );

      if (response.data && response.data.message === 'Check-out successful') {
        setHasCheckedIn(false);
        setClockInTime('');
        setTimePassed('00:00:00');
        await AsyncStorage.setItem('checkInStatus', JSON.stringify(false));
        playCheckOutSound();
        Alert.alert('Checked Out', 'You have successfully checked out.');
      } else {
        Alert.alert('Check-out failed', 'Please try again later.');
      }
    } catch (error) {
      console.error('Check-out Error:', error);
      Alert.alert('Check-out Error', 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const totalAllowedSeconds = 36000;
  const timePassedSeconds = timePassed
    .split(':')
    .reduce((acc, val, i) => acc + parseInt(val) * [3600, 60, 1][i], 0);
  const progressPercentage = Math.min((timePassedSeconds / totalAllowedSeconds) * 100, 100);

  const imageUrl = userData.data.image_url || 'https://example.com/fallback-image.png';

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00557a" />
      </View>
    );
  }

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          <View style={styles.profile}>
            <Text style={styles.userName}>HEY {userData.data.name}</Text>
            <Text style={styles.userRole}>{userData.data.role}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationIcon}
            onPress={() => navigation.navigate('Notifications', { userData })}
          >
            <Ionicons name="notifications" size={28} color="#00557a" />
          </TouchableOpacity>
        </View>

        <Text style={styles.timeText}>{pakistanTime}</Text>
        <Text style={styles.dateText}>{pakistanDate}</Text>

        <TouchableOpacity style={styles.punchInButton} onPress={hasCheckedIn ? handleCheckOut : handleCheckIn}>
          <AnimatedCircularProgress
            size={190}
            width={12}
            fill={progressPercentage}
            tintColor="#00557a"
            backgroundColor="#f2f2f2"
            rotation={0}
          >
            {
              () => (
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.punchInText}>
                    {hasCheckedIn ? 'PUNCH OUT' : 'PUNCH IN'}
                  </Text>
                  <Image
                    source={hasCheckedIn ? punchOutImage : hand}
                    style={styles.handImage}
                  />

                </View>
              )
            }
          </AnimatedCircularProgress>
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
    left: 250,
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
  },
  punchInText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  handImage: {
    width: 40,
    height: 60,
    marginTop: 10,
  },
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
