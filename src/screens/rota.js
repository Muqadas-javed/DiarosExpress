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

const RotaScreen = ({ route, navigation }) => {
  const { userData } = route.params || {};
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from the API
  const fetchData = async () => {
    try {
      const response = await fetch('https://mayfaircareagency.uk/api/rotas', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userData?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const json = await response.json();
      setData(json.data);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return { day, month }; // Returns an object with day and month
  };

  // Function to handle accepting a shift
  const acceptShift = async (shiftId) => {
    try {
      const response = await fetch(`https://mayfaircareagency.uk/api/shift/accept/${shiftId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userData?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to accept shift');
      }

      // Update the shift status locally after acceptance
      setData((prevData) => {
        return prevData.map((employee) => ({
          ...employee,
          shifts: employee.shifts.map((shift) =>
            shift.id === shiftId ? { ...shift, status: '1' } : shift
          ),
        }));
      });

      Alert.alert('Success', 'Shift accepted');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Function to handle rejecting a shift
  const rejectShift = async (shiftId) => {
    try {
      const response = await fetch(`https://mayfaircareagency.uk/api/shift/reject/${shiftId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userData?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reject shift');
      }

      // Update the shift status locally after rejection
      setData((prevData) => {
        return prevData.map((employee) => ({
          ...employee,
          shifts: employee.shifts.map((shift) =>
            shift.id === shiftId ? { ...shift, status: '2' } : shift
          ),
        }));
      });

      Alert.alert('Success', 'Shift rejected');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Render shifts with formatted date and simplified status text
  const renderShifts = (shifts) => {
    return shifts.length > 0 ? (
      shifts.map((shift, index) => {
        const { day, month } = formatDate(shift.date);

        // Determine status text and background color
        let statusText = '';
        let dateBackgroundStyle = {};
        let statusStyle = {}; // Added variable for status styling

        if (shift.status === '1') {
          statusText = <Text style={[styles.statusText, styles.accepted]}>Accepted</Text>;
          dateBackgroundStyle = styles.dateAccepted;
          statusStyle = styles.accepted; // Assign the 'accepted' style
        } else if (shift.status === '2') {
          statusText = <Text style={[styles.statusText, styles.rejected]}>Rejected</Text>;
          dateBackgroundStyle = styles.dateRejected;
          statusStyle = styles.rejected; // Assign the 'rejected' style
        } else {
          // If status is "0" (Pending), display both "Accepted" and "Rejected"
          statusText = (
            <View>
              <TouchableOpacity
                onPress={() => acceptShift(shift.id)} // Call acceptShift API
                style={styles.acceptedButton}
              >
                <Text style={[styles.statusText, styles.accepted]}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => rejectShift(shift.id)} // Call rejectShift API
                style={styles.rejectedButton}
              >
                <Text style={[styles.statusText, styles.rejected]}>Reject</Text>
              </TouchableOpacity>
            </View>
          );
          dateBackgroundStyle = styles.datePending; // Set style for pending status
        }

        return (
          <View key={index} style={[styles.card, { backgroundColor: '#F8F8F8' }]}>
            <View style={styles.row}>
              <View style={[styles.dateContainer, dateBackgroundStyle]}>
                <Text style={styles.dateDay}>{day}</Text>
                <Text style={styles.dateMonth}>{month}</Text>
              </View>
              <View style={styles.cardDetails}>
                <Text style={styles.shiftType}>{shift.shift_type.toUpperCase()}</Text>
                <Text style={styles.shiftTime}>
                  {shift.start_time} - {shift.end_time}
                </Text>
                <Text style={styles.cardText}>{shift.add_duty}</Text>
              </View>
              <View style={styles.statusContainer}>
                {statusText}
              </View>
            </View>
          </View>
        );
      })
    ) : (
      <Text style={styles.noDataText}>No shifts available</Text>
    );
  };

  // Render leaves with formatted date
  const renderLeaves = (leaves) => {
    return leaves.length > 0 ? (
      leaves.map((leave, index) => {
        const { day, month } = formatDate(leave.date);

        return (
          <View key={index} style={[styles.card, styles.leaveCard]}>
            <View style={styles.row}>
              <View style={styles.leavedateContainer}>
                <Text style={styles.dateDay}>{day}</Text>
                <Text style={styles.dateMonth}>{month}</Text>
              </View>
              <View style={styles.cardDetails}>
                <Text style={styles.leavetype}>
                  <Text style={styles.leavetype}></Text>{leave.leave_type}
                </Text>
                <Text style={styles.leavereason}>
                  <Text style={styles.cardLabel}></Text>{' '}
                  {leave.reason || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        );
      })
    ) : (
      <Text style={styles.noDataText}>No leaves available</Text>
    );
  };

  // Render each employee's shifts and leaves
  const renderItem = ({ item }) => (
    <View style={styles.employeeContainer}>
      <Text style={styles.employeeName}>{item.name}</Text>
      <Text style={styles.sectionTitle}>Shifts:</Text>
      {renderShifts(item.shifts)}
      <Text style={styles.sectionTitle}>Leaves:</Text>
      {renderLeaves(item.leaves)}
    </View>
  );

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}> Rota </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#00557a" />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.employee_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </ImageBackground>
  );
};

// Styles remain the same


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
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
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  listContainer: {
    paddingBottom: 20,
  },
  employeeContainer: {
    marginBottom: 10, // Reduced margin for smaller item spacing
    padding: 3, // Reduced padding for more compact layout
  },
  employeeName: {
    fontSize: 18, // Slightly smaller font size
    fontWeight: 'bold',
    marginBottom: 5, // Reduced margin
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16, // Slightly smaller section title font size
    fontWeight: '600',
    marginTop: 5, // Reduced margin
    marginBottom: 5, // Reduced margin
    color: '#555',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4, // Reduced padding for row
  },
  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70, // Reduced width
    height: 70, // Reduced height
    borderRadius: 8,
    marginRight: 10, // Reduced margin
  },
  dateDay: {
    fontSize: 24, // Reduced font size for day
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dateMonth: {
    fontSize: 16, // Reduced font size for month
    color: '#ffffff',
  },
  dateAccepted: {
    backgroundColor: 'green',
  },
  dateRejected: {
    backgroundColor: 'red',
  },
  datePending: {
    backgroundColor: '#E89C1E',
  },
  cardDetails: {
    flex: 1,
    paddingLeft: 5,
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6, // Reduced padding
    borderRadius: 15,
  },
  shiftType: {
    // Reduced padding top
    fontSize: 16, // Slightly smaller font size
    fontWeight: 'bold',
    color: '#000',
  },
  shiftTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  statusText: {
    fontSize: 10, // Reduced font size for status text
    textAlign: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  accepted: {
    color: 'green',
    borderColor: 'green',
    borderWidth: 1,
    borderRadius: 16,
  },
  rejected: {
    color: 'red',
    borderColor: 'red',
    borderWidth: 1,
    borderRadius: 16,
  },
  buttonsContainer: {
    flexDirection: 'column',
    marginRight: -19,
    justifyContent: 'flex-end',
    marginTop: 8, // Reduced margin
  },
  acceptedButton: {
    marginBottom: 8, // Reduced space between buttons
  },
  rejectedButton: {
    marginTop: 4, // Reduced space between buttons
  },
  card: {
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
    marginBottom: 8, // Reduced margin between cards
    padding: 1, // Reduced padding in the card
    elevation: 1, // Reduced elevation for less shadow
  },
  leavedateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70, // Reduced width
    height: 70, // Reduced height
    borderRadius: 8,
    marginRight: 10, // Reduced margin
    backgroundColor: '#E89C1E', // Added background color
  },
  leaveCard: {
    backgroundColor: '#F8F8F8',
  },
  leavetype: {
    paddingTop: 2, // Reduced padding top
    fontSize: 20, // Slightly smaller font size
    fontWeight: 'bold',
    color: '#000',
  },
  leavereason: {
    paddingTop: 2, // Reduced padding top
    fontSize: 14, // Slightly smaller font size
    color: '#000',
  },
  cardText: {
    fontSize: 12, // Smaller font size for text
    marginVertical: 2,
    color: 'black',
  },
  noDataText: {
    fontSize: 12, // Smaller font size for no data text
    color: '#888',
    fontStyle: 'italic',
  },
});


export default RotaScreen;
