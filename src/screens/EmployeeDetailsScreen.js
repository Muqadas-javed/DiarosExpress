import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo'; // Added missing Entypo import

const EmployeeDetailsScreen = ({ route, navigation }) => {
  const { userData } = route.params || {};
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch payroll data from the API
  const fetchPayrollData = async () => {
    try {
      const response = await fetch('https://mayfaircareagency.uk/api/payslip-uploads', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userData?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payroll data');
      }

      const json = await response.json();
      setPayrollData(json.data.employeesData);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, []);


  // Render each item in the list
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.employeeName}>
        {item.first_name} {item.last_name}
      </Text>
      <TouchableOpacity
        style={styles.pdfButton}
        onPress={() => Linking.openURL(item.pdf)}
      >
        <Text style={styles.pdfButtonText}>View Payslip</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Payslip Details</Text>

      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00557a" />
      ) : (
        <FlatList
          data={payrollData}
          keyExtractor={(item, index) => `${item.payslip_upload_id}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    elevation: 2,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginBottom: 10,
  },
  pdfButton: {
    backgroundColor: '#00557a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  pdfButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EmployeeDetailsScreen;
