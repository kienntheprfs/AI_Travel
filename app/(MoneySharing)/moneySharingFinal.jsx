import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { query, collection, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../configs/FireBaseConfig';

import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';

const GAP = Dimensions.get('window').width - 300;
const FRAMEGAP = Dimensions.get('window').width - 315;

export default function MoneySharingFinal() {
  const router = useRouter();
  const { updatedCategories } = useLocalSearchParams();
  const [parsedCategories, setParsedCategories] = useState([]);
  const [totalPayments, setTotalPayments] = useState({});

  // Check session and fetch user name when the component mounts
  const [userName, setUserName] = useState('');
  useEffect(() => {
    const checkSession = async () => {
      const user = await AsyncStorage.getItem('userSession');
      if (user) {
        const userData = JSON.parse(user);
        fetchUserName(userData.email); // Fetch user's name
      }
    };
    checkSession();
  }, []);

  // Fetch the user name from Firestore based on the email
  const fetchUserName = async (email) => {
    try {
      const usersQuery = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(usersQuery);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]; // Get the first matching document
        const userData = userDoc.data();
        setUserName(userData.fullName || ''); // Use fullName or fallback to an empty string
      } else {
        console.warn('No matching user document found');
      }
    } catch (error) {
      console.error('Error fetching user name: ', error);
    }
  };

  useEffect(() => {
    try {
      if (updatedCategories) {
        const parsed = JSON.parse(updatedCategories);
        setParsedCategories(parsed);
      }
    } catch (error) {
      console.error('Error parsing categories:', error);
    }
  }, [updatedCategories]);

  useEffect(() => {
    if (parsedCategories.length > 0) {
      const payments = {}; // Store final payments
      
      parsedCategories.forEach((category) => {
        const totalValue = parseFloat(category.value);
        const participants = category.participants.map((p) => p.name);
        const payers = category.payers.map((p) => p.name);
  
        const perParticipantCost = totalValue / participants.length;
        const perPayerContribution = totalValue / payers.length;
  
        const balances = {}; // Track each person's net balance
        participants.forEach((participant) => {
          balances[participant] = (balances[participant] || 0) - perParticipantCost;
        });
  
        payers.forEach((payer) => {
          balances[payer] = (balances[payer] || 0) + perPayerContribution;
        });
  
        // Calculate payments
        participants.forEach((participant) => {
          if (balances[participant] < 0) {
            payers.forEach((payer) => {
              if (balances[payer] > 0) {
                const transfer = Math.min(-balances[participant], balances[payer]);
                const key = `${participant}->${payer}`;
                payments[key] = (payments[key] || 0) + transfer;
  
                balances[participant] += transfer;
                balances[payer] -= transfer;
              }
            });
          }
        });
      });
  
      // Consolidate payments to handle mutual debts
      const consolidatedPayments = {};
      Object.entries(payments).forEach(([key, value]) => {
        const [from, to] = key.split('->');
        const reverseKey = `${to}->${from}`;
        if (consolidatedPayments[reverseKey]) {
          consolidatedPayments[reverseKey] -= value;
          if (Math.abs(consolidatedPayments[reverseKey]) < 1e-2) {
            delete consolidatedPayments[reverseKey];
          }
        } else {
          consolidatedPayments[key] = value;
        }
      });
  
      // Remove near-zero payments
      const filteredPayments = Object.fromEntries(
        Object.entries(consolidatedPayments).filter(([_, value]) => Math.abs(value) > 1e-2)
      );
  
      setTotalPayments(filteredPayments);
    }
  }, [parsedCategories]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.firstHeaderContainer}>
        <View style={styles.userNameBox}>
          <View style={styles.imageBox}>
            <Image source={require('../../assets/images/character.png')} style={styles.userImage} />
          </View>
          <Text style={styles.userName}>{userName}</Text>
        </View>

        <View style={styles.notificationButton}>
          <Feather name="bell" size={30} color="black" />
        </View>
      </View>

      <Text style={styles.firstTitle}>Phân chia chi phí</Text>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderCell}>Tên mục</Text>
          <Text style={styles.tableHeaderCell}>Số tiền</Text>
          <Text style={styles.tableHeaderCell}>Nội dung</Text>
        </View>

        {parsedCategories.map((category, index) => {
          const totalValue = parseFloat(category.value);
          const participants = category.participants.map((p) => p.name);
          const payers = category.payers.map((p) => p.name);

          const perParticipantCost = (totalValue / participants.length).toFixed(0);
          const perPayerContribution = (totalValue / payers.length).toFixed(0);

          return (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{category.name}</Text>
              <Text style={styles.tableCell}>{category.value}</Text>
              <Text style={styles.tableCell}>
                Mỗi người tham gia trả: {perParticipantCost}{'\n'}Mỗi người ứng: {perPayerContribution}
              </Text>
            </View>
          );
        })}

        <Text style={styles.total}>
          <Text style={styles.totalBold}>Tổng kết:</Text>{'\n'}
          {Object.entries(totalPayments).map(([key, value]) => {
            const [from, to] = key.split('->');
            const formattedValue = Math.abs(value).toLocaleString(); // Format the number with commas

            if (value < 0) {
              // Reverse the transaction
              return (
                <Text key={key}>
                  <Text style={styles.totalBold}>{to}</Text> cần trả cho{' '}
                  <Text style={styles.totalBold}>{from}</Text> {formattedValue}{'\n'}
                </Text>
              );
            }
            return (
              <Text key={key}>
                <Text style={styles.totalBold}>{from}</Text> cần trả cho{' '}
                <Text style={styles.totalBold}>{to}</Text> {formattedValue}{'\n'}
              </Text>
            );
          })}
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.returnButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.button2Container}>
        <TouchableOpacity style={styles.returnHome} onPress={() => router.replace('/home')}>
          <Ionicons name="home-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D3EC9E',
  },
  firstHeaderContainer: {
    gap: GAP,
    marginTop: '15%',
    flexDirection:'row',
  },
  userNameBox: {
    backgroundColor: 'white',
    paddingLeft: 5,
    paddingRight: 30,
    paddingVertical: 5,
    borderRadius: 40,
    marginLeft: '5%',
    flexDirection:'row',
    width: 200,
  },
  imageBox: {
    backgroundColor: 'pink', 
    borderRadius: 99,
    height: 50,
  },
  userImage : {
    top: -30,
    width: 50, 
    height: 75,
  },
  userName: {
    marginTop: 16,
    marginLeft: 10,
    fontFamily: 'nunito-bold',
    textAlign:'center'
  },

  notificationButton: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 99,
  },

  firstTitle: {
    marginTop: 20,
    marginLeft: 20,
    fontSize: 24,
    fontFamily: 'nunito-bold',
    color: '#0A6138'
  },
  table: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 10,  // Optional: Add rounded corners to the table
    padding: 10,  // Optional: Add padding inside the table
    backgroundColor: '#E9EFDC',
    shadowColor: '#000',  // Shadow color
    shadowOffset: { width: 0, height: 4 },  
    shadowOpacity: 0.25, 
    shadowRadius: 6, 
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,  // Border between header and rows
    borderColor: '#0A6138',  // Set border color (black)
    backgroundColor:'#FFE68A',
    borderWidth:1
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    padding: 10,  // Optional: Add padding for better spacing
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,  // Border between rows
    borderColor: '#0A6138',  // Set border color (black)
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  tableCell: {
    flex: 1,
    fontFamily: 'nunito',
    padding: 10,  // Optional: Add padding for better spacing
  },
  total: {
    marginTop: 20,
    fontFamily: 'nunito',
    fontSize: 16,
    marginLeft: '5%',
  },
  totalBold: {
    fontFamily: 'nunito-bold',
    color: '#0A6138'
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: '5%'
  },
  returnHome: {
    marginRight: '4%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 99,
  },
  returnButton: {
    marginLeft: '5%',
    marginRight: '62%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 99,
  },

  button2Container: {
    alignSelf:'center',
    marginVertical:'56%',
  }
});
