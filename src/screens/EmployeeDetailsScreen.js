import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import backgroundImg from '../assets/background.png';

const EmployeeDetailsScreen = ({ route, navigation }) => {
  const { userData } = route.params || {};
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayrollData();
  }, [userData]);

  const fetchPayrollData = async () => {
    try {
      const response = await fetch('https://hrmfiles.com/api/payroll', {
        headers: {
          Authorization: `Bearer ${userData?.access_token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPayrollData(data);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <Text style={styles.title}>{item.name}</Text>
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons name="cash" size={20} color="#CA282C" style={styles.icon} />
          <Text style={styles.detailText}>
            Salary: <Text style={styles.detailValue}>{item.salary}</Text>
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="gift" size={20} color="#CA282C" style={styles.icon} />
          <Text style={styles.detailText}>
            Bonus: <Text style={styles.detailValue}>{item.bonus}</Text>
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="file-tray-outline" size={20} color="#CA282C" style={styles.icon} />
          <Text style={styles.detailText}>
            Deduction: <Text style={styles.detailValue}>{item.total_deduction}</Text>
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={20} color="#CA282C" style={styles.icon} />
          <Text style={styles.detailText}>
            Net Salary: <Text style={styles.detailValue}>{item.net_salary}</Text>
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.payslipButton}
        onPress={() => navigation.navigate('Payslip', { itemId: item.id, userData })}
      >
        <Text style={styles.payslipButtonText}>See Your Payslip</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Payroll Details</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        ) : payrollData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payroll data available.</Text>
          </View>
        ) : (
          <FlatList
            data={payrollData}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id || Math.random())}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 15,
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
  cardContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#555',
  },
  detailValue: {
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  payslipButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#CA282C',
    borderRadius: 5,
    alignItems: 'center',
  },
  payslipButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight:"bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
  },
});

export default EmployeeDetailsScreen;
