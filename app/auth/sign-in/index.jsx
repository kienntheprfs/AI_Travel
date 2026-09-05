import { View, Text, ImageBackground, TextInput, TouchableOpacity, KeyboardAvoidingView, Image, Alert, AppState } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { styles } from '../../../styles/SignIn_style';
import { useRouter } from 'expo-router';
import { auth } from '../../../configs/FireBaseConfig';
import { signInWithEmailAndPassword } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignIn() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const router = useRouter();
  const appState = useRef(AppState.currentState);

  // Check session on app load
  useEffect(() => {
    const checkSession = async () => {
      const user = await AsyncStorage.getItem('userSession');
      if (user) {
        router.push('/home'); // Navigate to the home page if session exists
      }
    };
    checkSession();
  }, []);

  // Monitor app state and clear session when app closes
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        // App is transitioning to background or closing
        await AsyncStorage.removeItem('userSession');
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => subscription.remove(); // Clean up the listener
  }, []);

  const OnSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Email không đúng định dạng");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        // Save session to AsyncStorage
        await AsyncStorage.setItem('userSession', JSON.stringify({ uid: user.uid, email: user.email }));

        router.push('/home'); // Navigate to home page
      })
      .catch((error) => {
        console.log(error.code, error.message);
        Alert.alert("Đăng nhập thất bại");
      });
  };

  return (
    <ImageBackground source={require('../../../assets/images/Login_Page.jpg')} style={styles.SignInPageBackGround}>
      <KeyboardAvoidingView behavior='padding' style={styles.SignInBox}>
        <Text style={styles.SignInTitle}>Đăng nhập</Text>
        
        <View style={{ marginTop: 15 }}>
          <TextInput
            style={styles.SignInTextInput}
            placeholder="Email:"
            placeholderTextColor={'black'}
            onChangeText={(value) => setEmail(value)}
          />
          <TextInput
            style={styles.SignInTextInput}
            placeholder="Mật khẩu:"
            placeholderTextColor={'black'}
            secureTextEntry={true}
            onChangeText={(value) => setPassword(value)}
          />
        </View>

        <TouchableOpacity style={styles.SignInButton} onPress={OnSignIn}>
          <Text style={styles.SignInButtonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <Text style={styles.SignInBoxGoogleText}>hoặc Tiếp tục với</Text>

        <TouchableOpacity style={styles.SignInGoogleButton}>
          <Image source={require('../../../assets/images/Google_Icon.png')} />
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Bạn đã có tài khoản ? {' '}</Text>

          <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
            <Text style={styles.signUpButton}>Đăng ký</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
