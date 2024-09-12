// src/screens/HistoryScreen.js
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import backgroundImg from '../assets/background.png';
import {useNavigation} from '@react-navigation/native';
const CustomAlert = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{message}</Text>
          <View style={styles.modalbuttonContainer}>
            <TouchableOpacity style={styles.modalbutton} onPress={onClose}>
              <Text style={styles.modalbuttonText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalbutton} onPress={onConfirm}>
              <Text style={styles.modalbuttonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const HistoryScreen = ({route}) => {
  const {userData} = route.params || {};
  const imageUrl =
    userData?.data?.image_url || 'https://example.com/fallback-image.png';
  const [alertType, setAlertType] = useState('');
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [isTermsModalVisible, setTermsModalVisible] = useState(false);
  const navigation = useNavigation();
  const handleTermsModalOpen = () => {
    setTermsModalVisible(true);
  };

  const handleTermsModalClose = () => {
    setTermsModalVisible(false);
  };
  const handleConfirm = () => {
    if (alertType === 'delete') {
      navigation.navigate('Login');
    } else if (alertType === 'logout') {
      navigation.navigate('Login'); // Navigate to Login screen
    }
    setAlertVisible(false);
  };

  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.imageWrapper}>
          <Image source={{uri: imageUrl}} style={styles.image} />
          <View style={styles.circle}>
            <Image source={{uri: imageUrl}} style={styles.image} />
          </View>
        </View>
        <View style={styles.userinfo}>
          <Text style={styles.username}>{userData.data.name}</Text>
          <Text style={styles.usermail}>{userData.data.email}</Text>
        </View>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleTermsModalOpen}>
            <View style={styles.iconBtn}>
              <Icon name={'shield-checkmark'} size={18} color="#CA282C" />
              <Text style={styles.buttonText}>Privacy Policy</Text>
              <Icon
                name={'chevron-forward'}
                size={18}
                color="black"
                style={styles.iconArrow}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleTermsModalOpen}>
            <View style={styles.iconBtn}>
              <Icon name={'reader-sharp'} size={18} color="#CA282C" />
              <Text style={styles.buttonText}>Terms and Conditions</Text>
              <Icon
                name={'chevron-forward'}
                size={18}
                color="black"
                style={styles.iconArrow}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => {
              setAlertType('delete');
              setAlertVisible(true);
            }}>
            <View style={styles.iconBtn}>
              <Icon name={'trash-bin-sharp'} size={18} color="#CA282C" />
              <Text style={styles.buttonText}>Delete Account</Text>
              <Icon
                name={'chevron-forward'}
                size={18}
                color="black"
                style={styles.iconArrow}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => {
              setAlertType('logout');
              setAlertVisible(true);
            }}>
            <View style={styles.iconBtn}>
              <Icon name={'log-out'} size={18} color="#CA282C" />
              <Text style={styles.buttonText}>Log Out</Text>
              <Icon
                name={'chevron-forward'}
                size={18}
                color="black"
                style={styles.iconArrow}
              />
            </View>
          </TouchableOpacity>
        </View>

        <CustomAlert
          visible={isAlertVisible}
          onClose={() => setAlertVisible(false)}
          onConfirm={handleConfirm}
          title="Confirmation"
          message="Are you sure you want to proceed?"
          confirmText="YES"
        />

        <Modal
          animationType="slide"
          transparent={true}
          visible={isTermsModalVisible}
          onRequestClose={handleTermsModalClose}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Terms and Conditions</Text>
              <View style={styles.modalTextContainer}>
                <Text style={styles.bulletPoint}>• Maximum of 2 leaves allowed per month; extra leaves will result in salary deduction.</Text>
                <Text style={styles.bulletPoint}>• A one-month notice period is required before resignation.</Text>
                <Text style={styles.bulletPoint}>• Bonus awarded for extra hours worked or if no leaves are taken.</Text>
              </View>

              <TouchableOpacity
                style={styles.modalbutton}
                onPress={handleTermsModalClose}>
                <Text style={styles.modalbuttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  circle: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: '#CA282C',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },

  userinfo: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  username: {
    fontWeight: '600',
    fontSize: 28,
    color: 'black',
  },
  usermail: {
    fontSize: 14,
    color: 'black',
  },
  buttonGroup: {
    marginTop: 20,
    width: '80%',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  buttonContainer: {
    padding: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    justifyContent: 'space-between',
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#CA282C',
    fontWeight: 'bold',
    paddingLeft: 10,
    fontSize: 16,
  },
  iconArrow: {
    marginLeft: 'auto',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    paddingBottom: 6,
    width:'90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 24,
  },
  modalTextContainer: {
    marginBottom: 15,
  },
  bulletPoint: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 15,
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  modalbuttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalbutton: {
    backgroundColor: '#CA282C',
    borderRadius: 5,
    width: 80,
    alignItems: 'center',
    padding: 10,
    marginLeft: 10,
  },
  modalbuttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
