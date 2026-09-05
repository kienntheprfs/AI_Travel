import { StyleSheet, Text, View, TouchableOpacity, TextInput, Dimensions, Image } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import {styles} from '../../styles/search_style'

const WIDTH = Dimensions.get('window').width - 100;

export default function Search() {
  const {WhoTravel, StartDate, EndDate, MinBugget, MaxBugget} = useLocalSearchParams();
  const router = useRouter();

  const [destination, setDestination] = useState('')

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.returnButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>

      <View style={styles.SearchContainer}>
        <Text style={styles.SearchBoxTitle}>Nơi bạn muốn đến</Text>

        <View style={styles.SearchBox}>
          <AntDesign name="search1" size={24} color="black" style={{marginRight: 15}}/>

          <TextInput 
            placeholder='Tìm kiếm địa điểm' 
            placeholderTextColor="black" 
            style={{width: WIDTH}}
            value={destination}
            onChangeText={(value) => setDestination(value)}
          />

        </View>
      </View>

      <TouchableOpacity
        style={[styles.continueButton, !destination.trim() && {opacity: 0.5}]}
        disabled={!destination.trim()}
        onPress={() => {
          router.push({
            pathname: 'review',
            params: {
              WhoTravel : WhoTravel, 
              StartDate: StartDate, 
              EndDate: EndDate, 
              MinBugget: MinBugget, 
              MaxBugget: MaxBugget,
              Destination: destination.trim(),
            },
          });
        }}
      >
        <Text style={styles.continueButtonText}>Tiếp tục</Text>
      </TouchableOpacity>
    </View>
  )
}