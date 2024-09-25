import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import backgroundImg from '../assets/background.png';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

const PayslipScreen = ({route, navigation}) => {
  const {itemId, userData} = route.params || {}; // Get itemId and userData from route params
  const [payslipData, setPayslipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayslipData();
  }, [userData, itemId]);

  const fetchPayslipData = async () => {
    try {
      const response = await fetch(
        `https://hrmfiles.com/api/payslip/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${userData?.access_token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPayslipData(data); // Assumes data is specific to one payslip
    } catch (error) {
      console.error('Error fetching payslip data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      // Ensure userData is available
      if (!userData) {
        throw new Error('User data is not available.');
      }

      const htmlContent = `
        <div style="text-align: center; margin-bottom: 140px;">
          <h1 style="font-size: 40px; color: #555; margin-bottom: 10px; font-weight: bold;">Payslip</h1>
          <h2 style="font-size: 30px; color: #CA282C;">NaxasLimited</h2>
          <p style="font-size: 24px; color: #555;">Civic Center Bahria Phase 4</p>
        </div>
        
        <h2 style="font-size: 40px; color: #CA282C; margin-bottom: 50px; font-weight: bold;">${
          payslipData?.name || 'N/A'
        }</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
          <tr style="background-color: #CA282C; color: white;">
            <th style="border: 1px solid #ddd; padding: 14px; text-align: left;">Description</th>
            <th style="border: 1px solid #ddd; padding: 14px; text-align: left;">Value</th>
            <th style="border: 1px solid #ddd; padding: 14px; text-align: left;">Description</th>
            <th style="border: 1px solid #ddd; padding: 14px; text-align: left;">Value</th>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 14px;">Salary</td>
            <td style="border: 1px solid #ddd; padding: 14px;">${
              payslipData?.salary || 'N/A'
            }</td>
            <td style="border: 1px solid #ddd; padding: 14px;">Deduction Per Day</td>
            <td style="border: 1px solid #ddd; padding: 14px;">${
              payslipData?.absent_days_deduction || 'N/A'
            }</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 14px;">Absent Days</td>
            <td style="border: 1px solid #ddd; padding: 14px;">${
              payslipData?.total_absent_days
            }</td>
            <td style="border: 1px solid #ddd; padding: 14px;">Deduction Per Hour</td>
            <td style="border: 1px solid #ddd; padding: 14px;">${
              payslipData?.Late_hours_deduction || 'N/A'
            }</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 14px;">Leave Days</td>
            <td style="border: 1px solid #ddd; padding: 14px;">${
              payslipData?.paid_leaves
            }</td>
            <td style="border: 1px solid #ddd; padding: 14px;">Total Deduction</td>
            <td style="border: 1px solid #ddd; padding: 14px;">${
              payslipData?.total_deduction || 'N/A'
            }</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 14px;">Bonus</td>
            <td style="border: 1px solid #ddd; padding: 14px;">${
              payslipData?.bonus || 'N/A'
            }</td>
            <td style="border: 1px solid #ddd; padding: 14px;">Net Salary</td>
            <td style="border: 1px solid #ddd; padding: 14px;">${
              payslipData?.net_salary || 'N/A'
            }</td>
          </tr>
        </table>
        <div style="text-align: right; margin-bottom: 100px;font-size: 34px font-weight: medium">

        <h2>Net Pay: ${payslipData?.net_salary || 'N/A'}</h2>
        </div>      `;

      const options = {
        html: `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #CA282C; }
                p { font-size: 18px; color: #555; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; font-size: 24px}
                th { background-color: #CA282C; color: white; }
                td { text-align: left; }
              </style>
            </head>
            <body>
              ${htmlContent}
            </body>
          </html>
        `,
        fileName: 'Payslip',
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert('PDF generated at:', file.filePath);
      console.log('PDF generated at:', file.filePath);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', error.message || 'Could not generate PDF');
    }
  };

  const renderPayslipDetails = () => (
    <View style={styles.cardContainer}>
      <Text style={styles.title}>{payslipData?.name}</Text>
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons
            name="cash-outline"
            size={20}
            color="#CA282C"
            style={styles.icon}
          />
          <Text style={styles.detailText}>
            Salary:{' '}
            <Text style={styles.detailValue}>{payslipData?.salary}</Text>
          </Text>
        </View>
        <View style={styles.detailRow}>
          <FontAwesome
            name="gift"
            size={20}
            color="#CA282C"
            style={styles.icon}
          />
          <Text style={styles.detailText}>
            Bonus: <Text style={styles.detailValue}>{payslipData?.bonus}</Text>
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name="close-circle-outline"
            size={20}
            color="#CA282C"
            style={styles.icon}
          />
          <Text style={styles.detailText}>
            Deduction Per Day:{' '}
            <Text style={styles.detailValue}>
              {payslipData?.absent_days_deduction}
            </Text>
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons
            name="access-time"
            size={20}
            color="#CA282C"
            style={styles.icon}
          />
          <Text style={styles.detailText}>
            Deduction Per Hour:{' '}
            <Text style={styles.detailValue}>
              {payslipData?.Late_hours_deduction}
            </Text>
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name="remove-circle-outline"
            size={20}
            color="#CA282C"
            style={styles.icon}
          />
          <Text style={styles.detailText}>
            Total Deduction:{' '}
            <Text style={styles.detailValue}>
              {payslipData?.total_deduction}
            </Text>
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color="#CA282C"
            style={styles.icon}
          />
          <Text style={styles.detailText}>
            Total Absent Days:{' '}
            <Text style={styles.detailValue}>
              {payslipData?.total_absent_days}
            </Text>
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name="checkmark-done-outline"
            size={20}
            color="#CA282C"
            style={styles.icon}
          />
          <Text style={styles.detailText}>
            Total Leave Days :{' '}
            <Text style={styles.detailValue}>{payslipData?.paid_leaves}</Text>
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name="wallet-outline"
            size={20}
            color="#CA282C"
            style={styles.icon}
          />
          <Text style={styles.detailText}>
            Net Salary:{' '}
            <Text style={styles.detailValue}>{payslipData?.net_salary}</Text>
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Payslip Details</Text>
          <TouchableOpacity onPress={generatePDF} style={styles.downloadButton}>
            <Entypo name="download" size={26} color="#CA282C" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        ) : !payslipData ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payslip data available.</Text>
          </View>
        ) : (
          renderPayslipDetails()
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
    paddingVertical: 15,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingLeft: 10,
  },
  downloadButton: {
    paddingHorizontal: 10,
    paddingLeft: 120,
  },
  cardContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#CA282C',
    marginBottom: 10,
    textAlign: 'center',
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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

export default PayslipScreen;
