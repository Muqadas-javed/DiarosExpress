import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import backgroundImg from '../assets/background.png';
import DatePicker from 'react-native-date-picker';

const AddExpenseScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const handleChooseImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets) {
        setImage(response.assets[0].uri);
      }
    });
  };

  const handleSubmit = async () => {
    if (!name || !price || !date || !image) {
      Alert.alert('Error', 'Please fill in all fields and select an image.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('date', date.toISOString().split('T')[0]); // Format date as YYYY-MM-DD
    formData.append('image', {
      uri: image,
      type: 'image/jpeg', // Or the appropriate MIME type for your image
      name: 'photo.jpg',
    });

    try {
      const response = await fetch('https://hrmfiles.com/api/expense', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = await response.json();
      if (result.success) {
        Alert.alert('Success', 'Expense added successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to add expense');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Dashboard</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          placeholder="Enter your Title here"
          value={name}
          onChangeText={setName}
          placeholderTextColor={'gray'}
          style={styles.textInput}
        />

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity onPress={() => setOpenDatePicker(true)}>
              <TextInput
                style={styles.textInput}
                placeholder="Date (YYYY-MM-DD)"
                value={date ? date.toISOString().split('T')[0] : ''}
                editable={false} // Disable manual input
                placeholderTextColor={'gray'}
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
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              placeholder="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={styles.textInput}
              placeholderTextColor={'gray'}
            />
          </View>
        </View>
        <Text style={styles.label}>Image</Text>

        <TouchableOpacity onPress={handleChooseImage} style={styles.imagePickerButton}>
          <Text style={styles.buttonText}>Choose Image</Text>
          <Ionicons name="camera" size={24} color="#CA282C" />
        </TouchableOpacity>
        {image && <Image source={{ uri: image }} style={styles.image} />}
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonTextadd}>Add Expense</Text>
          )}
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
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 20,
    marginLeft: 10,
    fontWeight: '600',
    color: 'black',
  },
  container: {
    padding: 20,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'black',
    marginHorizontal: 10,
    fontSize: 16,
  },
  buttonTextadd: {
    color: 'white',
    marginHorizontal: 10,
    fontSize: 16,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 8,
  },
  label: {
    fontSize: 18,
    color: 'black',
    paddingVertical: 10,
    paddingLeft:10,
  },
  textInput: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 10,
    color: 'black',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputContainer: {
    flex: 1,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#CA282C',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default AddExpenseScreen;
