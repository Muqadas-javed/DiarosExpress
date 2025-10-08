import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from 'react-native';
import backgroundImg from '../assets/background.png';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';

const RotaScreen = ({ route, navigation }) => {
  const { userData } = route.params || {};
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState({});

  const fetchShifts = async () => {
    try {
      const response = await fetch('https://mayfaircareagency.uk/api/shifts', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userData?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shifts');
      }

      const json = await response.json();
      setShifts(json.shifts);
      markDates(json.shifts); // Mark dates based on shifts
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const formattedDate = date.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
    return { day, month, formattedDate };
  };

  const markDates = (shifts) => {
    const dates = {};
    shifts.forEach((shift) => {
      const { formattedDate } = formatDate(shift.date);
      let color = '';

      // Set the background color based on the status
      if (shift.status === 'accepted') {
        color = 'green';
      } else if (shift.status === 'rejected') {
        color = 'red';
      } else if (shift.status === 'pending') {
        color = 'orange';
      }

      // Mark the date with the status color (using selectedColor for background color)
      dates[formattedDate] = {
        selected: true,
        selectedColor: color, // Full date background color
        selectedTextColor: 'white', // Text color for the date number
      };
    });
    setMarkedDates(dates);
  };

  const renderShift = ({ item }) => {
    const { day, month } = formatDate(item.date);

    let statusActions = null;
    let dateBackgroundStyle = styles.datePending;

    if (item.status === 'accepted') {
      statusActions = <Text style={[styles.statusText, styles.accepted]}>Accepted</Text>;
      dateBackgroundStyle = styles.dateAccepted;
    } else if (item.status === 'rejected') {
      statusActions = <Text style={[styles.statusText, styles.rejected]}>Rejected</Text>;
      dateBackgroundStyle = styles.dateRejected;
    } else if (item.status === 'pending') {
      statusActions = <Text style={[styles.statusText, styles.pendingText]}>Pending</Text>;
      dateBackgroundStyle = styles.datePending;
    }

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.dateContainer, dateBackgroundStyle]}>
            <Text style={styles.dateDay}>{day}</Text>
            <Text style={styles.dateMonth}>{month}</Text>
          </View>
          <View style={styles.cardDetails}>
            <Text style={styles.shiftType}>{item.shift_type.toUpperCase()}</Text>
            <Text style={styles.shiftTime}>
              {item.start_time} - {item.end_time}
            </Text>
            <Text style={styles.cardText}>{item.add_duty}</Text>
            <Text style={styles.cardNote}>{item.employee_name}</Text>
          </View>
          <View style={styles.statusContainer}>{statusActions}</View>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Shifts</Text>
        </View>

        {/* Calendar */}
        <Calendar
          markedDates={markedDates}
          markingType="simple"
          theme={{
            todayTextColor: '#00adf5',
            selectedDayBackgroundColor: '#00adf5',
            selectedDayTextColor: '#ffffff',
            dotColor: '#00adf5',
            arrowColor: 'orange',
          }}
          style={styles.calendar}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#00557a" />
        ) : (
          <FlatList
            data={shifts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderShift}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  headerText: {
    fontSize: 20,
    marginLeft: 10,
    fontWeight: '600',
    color: 'black',
  },
  backgroundImage: { flex: 1, resizeMode: 'cover' },
  listContainer: { paddingBottom: 20, backgroundColor: 'white', },
  calendar: { marginBottom: 0 },
  card: { backgroundColor: '#f9f9f9', marginVertical: 8, padding: 10, borderRadius: 8 },
  row: { flexDirection: 'row', alignItems: 'center', },
  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70, // Reduced width
    height: 70, // Reduced height
    borderRadius: 8,
    marginRight: 10, // Reduced margin
  },
  dateDay: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  dateMonth: { fontSize: 16, color: '#ffffff' },
  datePending: { backgroundColor: '#E89C1E' },
  dateAccepted: { backgroundColor: 'green' },
  dateRejected: { backgroundColor: 'red' },
  cardDetails: { flex: 1, marginLeft: 10 },
  shiftType: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  shiftTime: { fontSize: 14, fontWeight: 'bold', color: '#555' },
  cardText: { fontSize: 14, color: '#999' },
  cardNote: { fontSize: 12, color: '#999' },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 10,
    textAlign: 'center',
    color: 'black',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  accepted: { borderColor: '#4CAF50', borderWidth: 1, color: '#4CAF50' },
  rejected: { borderColor: '#CA282C', borderWidth: 1, color: '#CA282C' },
  pendingText: { borderColor: '#E89C1E', borderWidth: 1, color: '#E89C1E' },
});

export default RotaScreen;
