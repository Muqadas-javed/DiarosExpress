import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import backgroundImg from '../assets/background.png';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';

const CreateNotification = ({route, navigation}) => {
  const {userData} = route.params || {};
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const handleSubmit = async () => {
    if (!title || !message || !date) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    try {
      const response = await fetch('https://hrmfiles.com/api/announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userData.access_token}`,
        },
        body: JSON.stringify({
          title,
          message,
          date: date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        }),
      });

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(
            responseData.message || 'Failed to create notification',
          );
        }

        Alert.alert('Success', 'Notification created successfully.');
        navigation.goBack();
      } else {
        const responseText = await response.text();
        console.error('Unexpected response format:', responseText);
        Alert.alert(
          'Error',
          'Failed to create notification. Unexpected response format.',
        );
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      Alert.alert('Error', error.message || 'Failed to create notification.');
    }
  };

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Add Notification</Text>
        </View>
        <Text style={styles.label}>Title</Text>

        <TextInput
          placeholder="Enter your Title here"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={'black'}
          style={styles.textInput}
        />

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity onPress={() => setOpenDatePicker(true)}>
          <TextInput
            style={styles.textInput}
            placeholder="Date (YYYY-MM-DD)"
            value={date ? date.toISOString().split('T')[0] : ''}
            editable={false} // Disable manual input
            placeholderTextColor={'black'}
          />
        </TouchableOpacity>
        <DatePicker
          modal
          mode="date"
          open={openDatePicker}
          date={date || new Date()}
          minimumDate={new Date()} // Disable previous dates
          onConfirm={selectedDate => {
            setOpenDatePicker(false);
            setDate(selectedDate);
          }}
          onCancel={() => setOpenDatePicker(false)}
        />

        <Text style={styles.label}>Message</Text>
        <TextInput
          style={styles.textInputMsg}
          placeholder="Enter your Message here"
          value={message}
          onChangeText={setMessage}
          placeholderTextColor={'black'}
          multiline
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
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
  },
  label: {
    fontSize: 18,
    color: 'black',
    paddingVertical: 10,
  },
  textInput: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 10,
    color: 'black',
  },
  textInputMsg: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    color: 'black',
  },
  submitButton: {
    backgroundColor: '#ca282c',
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 40,
  },
  submitButtonText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
});

export default CreateNotification;
