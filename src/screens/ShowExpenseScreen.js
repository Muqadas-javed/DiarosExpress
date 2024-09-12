import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, Image, ActivityIndicator, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import backgroundImg from '../assets/background.png';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ShowExpenseScreen = ({ navigation }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('https://hrmfiles.com/api/expense');
      const result = await response.json();
      if (result.success) {
        setExpenses(result.data);
      } else {
        setError('Failed to load expenses');
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`https://hrmfiles.com/api/expense/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        // Remove the deleted item from the expenses list
        setExpenses(expenses.filter(expense => expense.id !== id));
      } else {
        Alert.alert('Error', 'Failed to delete expense');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while deleting the expense');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteExpense(id), style: 'destructive' },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
        <Text style={styles.itemDate}>{item.date}</Text>
        {item.description ? (
          <Text style={styles.itemDescription}>{item.description}</Text>
        ) : null}
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item.id)}>
        <Ionicons name="trash-outline" size={20} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Expense</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddExpense')}>
          <Text style={styles.addButtonText}>ADD</Text>
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={expenses}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            numColumns={2}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'black',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CA282C',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 'auto',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  container: {
    flex: 1,
    padding: 15,
  },
  loader: {
    marginTop: 50,
  },
  itemContainer: {
    flex: 1,
    margin: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    position: 'relative', // Added for delete button positioning
  },
  itemImage: {
    width: '100%',
    height: 100,
    resizeMode:'cover',
    borderRadius:40,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  itemTextContainer: {
    padding: 15,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  itemPrice: {
    fontSize: 16,
    color: '#CA282C',
    marginVertical: 5,
  },
  itemDate: {
    fontSize: 14,
    color: '#777777',
  },
  itemDescription: {
    fontSize: 12,
    color: '#555555',
    marginTop: 5,
  },
  deleteButton: {
    position: 'absolute',
    top: 130,
    right: 10,
    padding: 5,
    borderRadius: 50,
  },
  listContent: {
    paddingBottom: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ShowExpenseScreen;
