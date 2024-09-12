import React from 'react';
import { View, Text, Image, StyleSheet,TouchableOpacity } from 'react-native';

const CardComponent = ({ image, text,onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.cardImage} />
      </View>
      <Text style={styles.cardText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    margin: 10,
    width: 100,
    height: 140,
    marginTop: 20,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 5, // for Android
    shadowColor: '#000', // for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  imageContainer: {
    width: '45%',  // Ensures the container takes up the full width of the card
    height: 60, // Adjust the height as needed
    backgroundColor: '#FFF2F2',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop:20,
    marginHorizontal:35,
    borderRadius: 20,

  },
  cardImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  cardText: {
    padding: 10,
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
});

export default CardComponent;
