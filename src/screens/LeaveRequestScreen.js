import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import backgroundImg from '../assets/background.png';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import axios from 'axios';

const LeaveRequestScreen = ({route, navigation}) => {
  const {userData} = route.params || {};

  const [isModalVisible, setModalVisible] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openToDatePicker, setOpenToDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [isDateSelected, setIsDateSelected] = useState(false);
  const [isToDateSelected, setIsToDateSelected] = useState(false);

  const [items] = useState([
    {label: 'Sick Leave', value: 'SICK'},
    {label: 'Vacation Leave', value: 'VACATION'},
    {label: 'Maternity Leave', value: 'MATERNITY'},
  ]);
  const [selectedLeaveType, setSelectedLeaveType] =
    useState('Select Leave Type');
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [reason, setReason] = useState('');

  const formatDate = date => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleItemSelected = item => {
    setSelectedLeaveType(item.label);
    setModalVisible(false);
  };

  const renderItemList = () => {
    return items.map(item => (
      <TouchableOpacity
        key={item.value}
        onPress={() => handleItemSelected(item)}
        style={styles.modalItem}>
        <Text style={styles.modalItemText}>{item.label}</Text>
      </TouchableOpacity>
    ));
  };

  const handleDurationSelect = option => {
    setSelectedDuration(option);
  };

  const handleSubmit = async () => {
    if (!userData || !userData.access_token) {
      Alert.alert('Error', 'No valid token found.');
      return;
    }

    try {
      const response = await axios.post(
        'https://hrmfiles.com/api/leaves',
        {
          leave_type: selectedLeaveType,
          start_date: selectedDate.toISOString().split('T')[0],
          end_date: toDate.toISOString().split('T')[0],
          duration: selectedDuration,
          reason: reason,
        },
        {
          headers: {
            Authorization: `Bearer ${userData.access_token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.message === 'Leave request submitted successfully.') {
        Alert.alert('Success', 'Leave request submitted successfully.');
        navigation.goBack();
      } else {
        Alert.alert(
          'Error',
          'Failed to submit leave request. Please try again.',
        );
      }
    } catch (error) {
      if (error.response) {
        Alert.alert(
          'Error',
          `Error: ${
            error.response.data.message ||
            'An error occurred. Please try again.'
          }`,
        );
      }
    }
  };

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Leave Request</Text>
        </View>
        <ScrollView contentContainerStyle={{paddingBottom: 20}}>
          <Text style={styles.label}>Leave Type</Text>
          <TouchableOpacity style={styles.dropdownview} onPress={toggleModal}>
            <View style={styles.dropdownContent}>
              <Text style={styles.dropdownText}>{selectedLeaveType}</Text>
              <Ionicons name="caret-down" size={16} color="#ca282c" />
            </View>
          </TouchableOpacity>
          <Modal
            transparent={true}
            animationType="slide"
            visible={isModalVisible}
            onRequestClose={toggleModal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalStyle}>{renderItemList()}</View>
            </View>
          </Modal>
          <Text style={styles.label}>Date</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setOpenDatePicker(true)}>
              <View style={styles.datefield}>
                <Text style={styles.dropdownText}>
                  {isDateSelected ? formatDate(selectedDate) : 'From'}
                </Text>
                <Ionicons
                  name="calendar"
                  size={20}
                  color="#ca282c"
                  style={styles.calendarIcon}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setOpenToDatePicker(true)}>
              <View style={styles.datefield}>
                <Text style={styles.dropdownText}>
                  {isToDateSelected ? formatDate(toDate) : 'To'}
                </Text>
                <Ionicons
                  name="calendar"
                  size={20}
                  color="#ca282c"
                  style={styles.calendarIcon}
                />
              </View>
            </TouchableOpacity>
          </View>
          <DatePicker
            modal
            mode="date"
            open={openDatePicker}
            date={selectedDate}
            minimumDate={new Date()} // Disable previous dates
            onConfirm={date => {
              setOpenDatePicker(false);
              setSelectedDate(date);
              setIsDateSelected(true);
            }}
            onCancel={() => {
              setOpenDatePicker(false);
            }}
          />
          <DatePicker
            modal
            mode="date"
            open={openToDatePicker}
            date={toDate}
            minimumDate={selectedDate || new Date()} // Disable previous dates and ensure 'To' date is after 'From' date
            onConfirm={date => {
              setOpenToDatePicker(false);
              setToDate(date);
              setIsToDateSelected(true);
            }}
            onCancel={() => {
              setOpenToDatePicker(false);
            }}
          />
          <Text style={styles.label}>Duration</Text>
          <View style={styles.durationOptions}>
            {['Single Day', 'Multi Day', 'Half Day'].map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  selectedDuration === option.toLowerCase() &&
                    styles.selectedOption,
                ]}
                onPress={() => handleDurationSelect(option.toLowerCase())}>
                <Text
                  style={[
                    styles.optionText,
                    selectedDuration === option.toLowerCase() &&
                      styles.selectedOptionText,
                  ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Reason</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={2}
            placeholder="Enter your reason here..."
            placeholderTextColor="grey"
            value={reason}
            onChangeText={text => setReason(text)}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
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
  container: {
    paddingHorizontal: 20,
    flex: 1,
  },
  label: {
    fontSize: 18,
    color: 'black',
    paddingVertical: 10,
  },
  dropdownview: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
  },
  dropdownContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: 'black',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Adding a semi-transparent background
  },
  modalStyle: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalItem: {
    paddingVertical: 10,
  },
  modalItemText: {
    fontSize: 18,
    color: 'black', // Ensuring text color is black
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  dateButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  datefield: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarIcon: {
    marginLeft: 5,
  },
  durationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    flex: 1,
    marginHorizontal: 5,
  },
  selectedOption: {
    backgroundColor: '#ca282c',
  },
  optionText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    fontSize: 16,
    color: 'black',
  },
  submitButton: {
    backgroundColor: '#ca282c',
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 50,
  },
  submitButtonText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
});

export default LeaveRequestScreen;
