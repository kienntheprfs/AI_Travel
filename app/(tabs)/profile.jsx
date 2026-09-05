import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Ensure AsyncStorage is imported
import { useRouter } from 'expo-router';

export default function Profile() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userSession'); // Remove user session
      router.replace('auth/sign-in'); // Navigate to the home page after logout
    } catch (error) {
      console.log('Error removing user session: ', error);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const user = await AsyncStorage.getItem('userSession');
      if (user) {
        router.push('/home'); // Navigate to the home page if session exists
      }
    };
    checkSession();
  }, [router]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.LogoutButton} onPress={handleLogout}>
        <Text style={styles.LogoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.AVOCADO_GREEN
  },
  LogoutButton : {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: Colors.DARK_YELLOW,
    borderRadius: 20
  },
  LogoutText: {
    fontFamily: 'nunito',
    fontSize: 20
  }
})