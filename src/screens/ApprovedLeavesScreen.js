import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList, Text, ImageBackground, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import backgroundImg from '../assets/background.png';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ApprovedLeavesScreen = ({ route, navigation }) => {
  const { userData } = route.params || {};

  const [markedDates, setMarkedDates] = useState({});
  const [presentDaysDetails, setPresentDaysDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await axios.get('https://hrmfiles.com/api/attendance', {
          headers: {
            Authorization: `Bearer ${userData?.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = response.data;
        const presentDays = data.present_days || {};
        const absentDays = data.absent_days || {};

        const markedDates = {};

        // Mark absent days in red
        for (const key in absentDays) {
          const date = absentDays[key];
          markedDates[date] = {
            selected: true,
            selectedColor: '#CA282C',
            selectedTextColor: 'white',
          };
        }

        // Mark today in orange if not already marked
        const today = new Date().toISOString().split('T')[0];
        if (!markedDates[today]) {
          markedDates[today] = {
            selected: true,
            selectedColor: '#E89C1E',
            selectedTextColor: 'white',
          };
        }

        // Prepare the list of present days' details
        const presentDaysList = [];
        for (const date in presentDays) {
          const clockInTime = presentDays[date].clock_in_time;
          const clockOutTime = presentDays[date].clock_out_time;
          const totalHours = calculateTotalHours(clockInTime, clockOutTime);

          presentDaysList.push({
            date,
            clockInTime: formatTime(clockInTime),
            clockOutTime: formatTime(clockOutTime),
            totalHours,
            formattedDate: formatDate(date),
          });
        }

        setMarkedDates(markedDates);
        setPresentDaysDetails(presentDaysList);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [userData]);

  const formatDate = (date) => {
    const dateObj = new Date(date);
    const dayNameOptions = { weekday: 'short' };
    const dayNumberOptions = { day: '2-digit' }; // Ensure two-digit format

    const dayName = dateObj.toLocaleDateString('en-US', dayNameOptions);
    const dayNumber = dateObj
      .toLocaleDateString('en-US', dayNumberOptions)
      .padStart(2, '0'); // Ensure two-digit format

    return { dayName, dayNumber };
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const calculateTotalHours = (clockInTime, clockOutTime) => {
    if (!clockInTime || !clockOutTime) return 'N/A';

    const [clockInHours, clockInMinutes] = clockInTime.split(':').map(Number);
    const [clockOutHours, clockOutMinutes] = clockOutTime.split(':').map(Number);

    // Create date objects for clock-in and clock-out
    const clockIn = new Date();
    clockIn.setHours(clockInHours, clockInMinutes, 0, 0);

    const clockOut = new Date();
    clockOut.setHours(clockOutHours, clockOutMinutes, 0, 0);

    // Calculate difference in milliseconds
    let diff = clockOut - clockIn;

    // Handle cases where clock-out is on the next day
    if (diff < 0) {
      diff += 24 * 60 * 60 * 1000; // add one day in milliseconds
    }

    // Convert milliseconds to hours and minutes
    const totalMinutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Format hours and minutes
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
  };

  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return today.toDateString() === date.toDateString();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Attendance History</Text>
      </View>
      <View style={styles.container}>
        <View style={styles.whiteBackground}>
          <Calendar
            markedDates={markedDates}
            markingType={'simple'}
            theme={{
              todayTextColor: '#CA282C',
              arrowColor: '#CA282C',
            }}
          />
          <FlatList
            data={presentDaysDetails}
            keyExtractor={(item) => item.date}
            renderItem={({ item }) => {
              const { dayName, dayNumber } = item.formattedDate;
              const backgroundColor = isToday(item.date) ? '#E89C1E' : '#6FAB55'; // Orange for today, green for previous days

              return (
                <View style={styles.card}>
                  <View style={styles.row}>
                    <View style={[styles.dateContainer, { backgroundColor }]}>
                      <Text style={styles.dateText}>{dayNumber}</Text>
                      <Text style={styles.dayName}>{dayName}</Text>
                    </View>
                    <View style={styles.timeBlock}>
                      <Text style={styles.timeValue}>{item.clockInTime}</Text>
                      <Text style={styles.timeLabel}>Punch In</Text>
                    </View>
                    <View style={styles.timeBlock}>
                      <Text style={styles.timeValue}>{item.clockOutTime}</Text>
                      <Text style={styles.timeLabel}>Punch Out</Text>
                    </View>
                    <View style={styles.timeBlock}>
                      <Text style={styles.timeValue}>{item.totalHours}</Text>
                      <Text style={styles.timeLabel}>Total Hours</Text>
                    </View>
                  </View>
                </View>
              );
            }}
            style={styles.list}
            contentContainerStyle={{ flexGrow: 1 }} // Ensure the FlatList is scrollable
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 20,
    marginLeft: 10,
    fontWeight: '600',
    color: 'black',
  },
  container: {
    flex: 1,
    padding: 10,
  },
  whiteBackground: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    flex: 1,
  },
  list: {
    marginTop: 10,
  },
  card: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    elevation: 2, // for shadow on Android
    shadowColor: '#000', // for shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  dateText: {
    fontWeight: 'bold',
    fontSize: 24,
    color: 'white',
  },
  dayName: {
    fontSize: 18,
    color: 'white',
    marginBottom: 5,
  },
  timeBlock: {
    flex: 1,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: 'gray',
  },
  timeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default ApprovedLeavesScreen;
