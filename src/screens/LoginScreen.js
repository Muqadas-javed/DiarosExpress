import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import backgroundImg from '../assets/background.png';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  // const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    try {
      const response = await axios.post('https://hrmfiles.com/api/login', {
        email,
        password,
      });
  
      if (response.data && response.data.access_token) {
        navigation.navigate('AppTabs', { userData: response.data }); // Pass userData here
      } else {
        Alert.alert('Login failed', 'Please check your credentials.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Login Error', 'An error occurred during login. Please try again later.');
    }
  };
  
  return (
    <ImageBackground source={backgroundImg} style={styles.backgroundImage}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          {/* <Text style={styles.welcomeText}>Welcome to </Text> */}
          <Text style={styles.companyname}>DiarosExpress</Text>

          <Text style={styles.title}>Email</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="grey"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Icon name="user-circle" size={20} style={styles.icon} />
          </View>
          <Text style={styles.title}>Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="grey"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.icon}
              onPress={() => setPasswordVisible((prev) => !prev)}>
              <Icon
                name={passwordVisible ? 'eye-slash' : 'eye'}
                size={20}
                color="grey"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 34,
    color: '#ca282c',
    fontWeight: '400',
    width: '100%',
    textAlign: 'center',
    paddingTop: 20, // Add some space from the top
  },
  companyname:{
    fontSize: 44,
    fontWeight: '900',

    color: '#ca282c',
    marginBottom: 90,
  },
  title: {
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
    marginBottom: 10,
    width: '100%',
    paddingLeft: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  input: {
    height: 45,
    flex: 1,
    borderColor: 'gray',
    borderWidth: 0.7,
    paddingLeft: 10,
    borderRadius: 13,
    color: 'grey',
  },
  icon: {
    position: 'absolute',
    right: 10,
    color: 'grey',
  },
  loginButton: {
    backgroundColor: '#ca282c',
    padding: 15,
    borderRadius: 30,
    width: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginScreen;
