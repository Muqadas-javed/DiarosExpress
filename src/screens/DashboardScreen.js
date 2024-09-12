import React from 'react';
import { View, FlatList, StyleSheet, Text, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import CardComponent from './CardComponent';
import backgroundImg from '../assets/background.png';
import Ionicons from 'react-native-vector-icons/Ionicons';

const images = {
  image1: require('../assets/clender.png'),
  image2: require('../assets/book.png'),
  image3: require('../assets/image3.png'),
  image4: require('../assets/image4.png'),
  image5: require('../assets/image5.png'),
  image6: require('../assets/image6.png'),
};

const data = [
  { id: '1', image: images.image1, text: 'Leave \n Request' },
  { id: '2', image: images.image2, text: 'Leave \nDetails' },
  { id: '3', image: images.image3, text: 'Attendance\nHistory' },
  { id: '4', image: images.image4, text: 'Payroll\nRegularization' },
  { id: '5', image: images.image5, text: 'Create\nNotification' },
  { id: '6', image: images.image6, text: 'Expense\nRegularization' },
];

const DashboardScreen = ({ route, navigation }) => {
  const { userData } = route.params || {};


  const handlePress = text => {
    if (text.includes('Request')) { 
      navigation.navigate('LeaveRequest', { userData });
    } else if (text.includes('Details')) {
      navigation.navigate('LeaveDetails', { userData });
    } else if (text.includes('Payroll')) {
      navigation.navigate('EmployeeDetails', { userData });
    } else if (text.includes('Attendance\nHistory')) {
      navigation.navigate('ApprovedLeaves', { userData });
    } else if (text.includes('Create\nNotification')) {
      if (userData.data.role === 'Employee') {
        Alert.alert(
          'Unauthorized',
          'You are not authorized to create notifications.',
          [{ text: 'OK' }]
        );
      } else {
        navigation.navigate('CreateNotification', { userData });
      }
    }
    else if (text.includes('Expense\nRegularization')) {
      if (userData.data.role === 'Employee') {
        Alert.alert(
          'Unauthorized',
          'You are not authorized to create notifications.',
          [{ text: 'OK' }]
        );
      } else {
        navigation.navigate('ShowExpense', { userData });
      }
    }
      };

  const renderItem = ({ item }) => (
    <CardComponent
      image={item.image}
      text={item.text}
      onPress={() => handlePress(item.text)}
    />
  );

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Dashboard</Text>
      </View>
      <View style={styles.overlay}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
        />
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
  overlay: {
    padding: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default DashboardScreen;
