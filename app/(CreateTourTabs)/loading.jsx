import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AI_PROMPT } from '../../configs/AiPrompt';
import { chatSession } from '../../configs/AiModal';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../../configs/FireBaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Loading() {
  const { WhoTravel, StartDate, EndDate, MinBugget, MaxBugget, Destination } = useLocalSearchParams();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(false);

  // Retrieve user email from AsyncStorage
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const userSession = await AsyncStorage.getItem('userSession');
        if (userSession) {
          const { email } = JSON.parse(userSession);
          setUserEmail(email);
          console.log("Retrieved User Email:", email);
        } else {
          console.error("User session not found in AsyncStorage.");
        }
      } catch (error) {
        console.error("Error retrieving user session:", error);
      }
    };

    fetchUserEmail();
  }, []);

  const calculateDaysAndNights = () => {
    if (!StartDate || !EndDate) return { days: 0, nights: 0 };

    const start = new Date(StartDate);
    const end = new Date(EndDate);

    const timeDiff = end - start;

    const days = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
    const nights = days - 1;

    return { days, nights };
  };

  const { days, nights } = calculateDaysAndNights();

  useEffect(() => {
    if (userEmail) {
      generateAiTrip();
    }
  }, [Destination, days, nights, MinBugget, MaxBugget, WhoTravel, userEmail]);

  const generateAiTrip = async () => {
    if (!userEmail) {
      console.error("User email not available. Cannot generate trip.");
      return;
    }

    setLoading(true);
    const FINAL_PROMPT = AI_PROMPT
      .replace('{Destination}', Destination)
      .replace('{days}', days)
      .replace('{nights}', nights)
      .replace('{MinBugget}', MinBugget)
      .replace('{MaxBugget}', MaxBugget)
      .replace('{WhoTravel}', WhoTravel);

    console.log(FINAL_PROMPT);

    try {
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const tripResponse = JSON.parse(result.response.text());

      const docId = Date.now().toString();
      await setDoc(doc(db, "UserTrips", docId), {
        userEmail,
        tripData: tripResponse,
        WhoTravel: WhoTravel,
        StartDate: StartDate,
        EndDate: EndDate,
        MinBugget: MinBugget,
        MaxBugget: MaxBugget,
        Destination: Destination,
        ID: docId
      });

      await AsyncStorage.setItem('UsingDocId', docId); // Dùng sau

      console.log("Trip data stored successfully.");
      router.push({
        pathname: '/tourStart',
        params: {docIdForEdit: docId}
      })
    } catch (error) {
      console.error("Error storing trip data:", error);
    } finally {
      setLoading(false);
    }

    // router.push({
    //   pathname: '/tourStart',
    //   params: {docIdForEdit: docId}
    // })
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.returnButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>

      <View style={styles.loadingContainer}>
        <Image
          source = {require('../../assets/images/loadingAnimation.gif')} // Replace with your desired loading image URL
          style={styles.loadingImage}
        />
        <Text style={styles.loadingText}>Đang tạo chuyến đi của bạn...</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  returnButton: {
    position: 'absolute',
    top: '10%',
    left: '6%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 99,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
});
