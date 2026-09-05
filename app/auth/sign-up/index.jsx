import { View, Text, ImageBackground, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView, Image, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { styles } from '../../../styles/SignUp_style';
import { auth } from '../../../configs/FireBaseConfig';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from 'expo-router'
import { db } from '../../../configs/FireBaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignUp() {

  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const showDatePicker = () => {
    setShow(true);
  };

  const onChange = (event, selectedDate) => {
    setShow(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [fullName, setFullName] = useState();

  const router = useRouter();

  const OnCreateAccount = async () => {
    // Check if all fields are filled
    if (!email || !password || !fullName) {
      Alert.alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }
  
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Email không đúng định dạng");
      return;
    }
  
    // Validate password length
    if (password.length < 6) {
      Alert.alert("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
  
    try {
      // Create account using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Save user information to Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        birthDate: date.toISOString(), // Save date as ISO string for consistency
        createdAt: new Date().toISOString(),
      });
  
      // Save session to AsyncStorage
      await AsyncStorage.setItem('userSession', JSON.stringify({ uid: user.uid, email: user.email }));
  
      Alert.alert("Đăng ký thành công", "Tài khoản của bạn đã được tạo!");
      router.replace('/home');
    } catch (error) {
      const errorMessage = error.message;
      Alert.alert("Đăng ký thất bại", errorMessage);
    }
  };
  
  return (
    <ImageBackground source={require('../../../assets/images/Login_Page.jpg')} style={styles.SignUpPageBackGround}>
        <KeyboardAvoidingView behavior='padding' style = {styles.SignUpBox}>

          <Text style={styles.SignUpTitle}>Đăng Ký Tài Khoản</Text>

          <View style={{ marginTop: 15 }}>
            <TextInput style={styles.SignUpTextInput} placeholder="Họ và tên:" placeholderTextColor={'black'} onChangeText={(value) => setFullName(value)}/>
 
            <TextInput style={styles.SignUpTextInput} placeholder="Email:" placeholderTextColor={'black'} onChangeText={(value) => setEmail(value)}/>

            <TouchableOpacity onPress={showDatePicker}>
              <Text style={styles.SignUpTextInput}>{date.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {show && (
              <View style = {styles.DatePickerContainer}>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChange}
                  textColor='black'
                />
              </View>
            )}

            <TextInput style={styles.SignUpTextInput} placeholder="Mật khẩu:" placeholderTextColor={'black'} secureTextEntry={true} onChangeText={(value) => setPassword(value)}/>
          </View>

          <TouchableOpacity style = {styles.SignUpButton} onPress={OnCreateAccount}>
            <Text style = {styles.SignUpButtonText}>Lưu</Text>
          </TouchableOpacity>

          <Text style = {styles.SignUpBoxGoogleText}>hoặc Tiếp tục với</Text>

          <TouchableOpacity style = {styles.SignUpGoogleButton}>
            <Image source={require('../../../assets/images/Google_Icon.png')}/>
          </TouchableOpacity>

          <View style = {styles.signInContainer}>
            <Text style = {styles.signInText}>
              Bạn đã có tài khoản ? {' '}
            </Text>

            <TouchableOpacity onPress={() => router.push('/auth/sign-in')}>
              <Text style = {styles.signInButton}>
                Đăng nhập
              </Text>
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
    </ImageBackground>
  );
}


