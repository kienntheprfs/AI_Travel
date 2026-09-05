import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, ScrollView, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { query, collection, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../configs/FireBaseConfig';

import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';

const GAP = Dimensions.get('window').width - 300;

export default function MoneySharingTable() {
  const router = useRouter();
  const { participants, categories } = useLocalSearchParams();
  const parsedParticipants = participants ? JSON.parse(participants) : [];
  const parsedCategories = categories ? JSON.parse(categories) : [];

  const [collapsedStates, setCollapsedStates] = useState(parsedCategories.map(() => ({ thamGia: false, ungTien: false })));
  const [selectedParticipants, setSelectedParticipants] = useState(
    parsedCategories.map(() => ({ thamGia: [], ungTien: [] }))
  );

  useEffect(() => {
    console.log(parsedParticipants);
  }, []);

  const toggleCollapse = (index, key) => {
    const newStates = [...collapsedStates];
    newStates[index][key] = !newStates[index][key];
    setCollapsedStates(newStates);
  };

  const [updatedCategories, setUpdatedCategories] = useState(
    parsedCategories.map((category) => ({
      ...category,
      participants: [],
      payers: [],
    }))
  );

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

  const toggleParticipantSelection = (categoryIndex, key, person) => {
    // Update selectedParticipants
    setSelectedParticipants((prev) => {
      const newSelections = [...prev];
      const selectedList = newSelections[categoryIndex][key];
  
      if (selectedList.some((p) => p.name === person.name)) {
        newSelections[categoryIndex][key] = selectedList.filter((p) => p.name !== person.name);
      } else {
        newSelections[categoryIndex][key] = [...selectedList, person];
      }
  
      // Sync updatedCategories
      setUpdatedCategories((prevCategories) => {
        const newCategories = [...prevCategories];
        newCategories[categoryIndex][key === 'thamGia' ? 'participants' : 'payers'] =
          newSelections[categoryIndex][key];
        return newCategories;
      });
  
      return newSelections;
    });
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.tableContent}>
      <Text style={styles.tableContentText}>{item.name}</Text>
      <Text style={styles.tableContentText}>{item.value}</Text>
  
      {['thamGia', 'ungTien'].map((key) => (
        <View key={key} style={styles.collapsibleContainer}>
          <TouchableOpacity onPress={() => toggleCollapse(index, key)} style={styles.tableContentText}>
            <AntDesign
              name={collapsedStates[index][key] ? 'caretup' : 'caretdown'}
              size={16}
              color="#02954F"
              style={styles.collapsibleIcon}
            />
          </TouchableOpacity>
  
          {collapsedStates[index][key] && (
            <View style={styles.participantBox}>
              {parsedParticipants.map((person, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => toggleParticipantSelection(index, key, person)}
                  style={
                    selectedParticipants[index][key].some((p) => p.name === person.name)
                      ? styles.selectedParticipant
                      : styles.unselectedParticipant
                  }
                >
                  <Text style={[styles.tableContentText, {backgroundColor: person.color}]}>{person.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
  
          {/* Show Selected Participants with Background Color */}
          <View style={styles.selectedNamesContainer}>
            {selectedParticipants[index][key].map((participant, idx) => (
              <View
                key={idx}
                style={[styles.nameBox, { backgroundColor: participant.color || '#E0F7FA' }]}
              >
                <Text style={styles.nameBoxText}>{participant.name}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={parsedCategories}
      keyExtractor={(item, index) => `${item.name}-${index}`}
      renderItem={renderItem}
      ListHeaderComponent={
        <>
          <View style={styles.firstHeaderContainer}>
            <View style={styles.userNameBox}>
              <View style={styles.imageBox}>
                <Image
                  source={require('../../assets/images/character.png')}
                  style={styles.userImage}
                />
              </View>
              <Text style={styles.userName}>{userName}</Text>
            </View>
            <View style={styles.notificationButton}>
              <Feather name="bell" size={30} color="black" />
            </View>
          </View>
          <Text style={styles.firstTitle}>Phân chia chi phí</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText1}>Tên mục</Text>
            <Text style={styles.tableHeaderText1}>Số tiền</Text>
            <Text style={styles.tableHeaderText2}>Người tham gia</Text>
            <Text style={styles.tableHeaderText2}>Người ứng tiền</Text>
          </View>
        </>
      }
      ListFooterComponent={
        <View style={styles.Footer}>
          <TouchableOpacity style={styles.returnButton} onPress={() => router.back()}>
            <Text style={styles.nextButtonText}>Quay lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/moneySharingFinal',
                params: { updatedCategories: JSON.stringify(updatedCategories) },
              })
            }
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>Lưu</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PASTEL_GREEN,
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

  tableFrame: {
    backgroundColor: '#EBF7D4',
    borderRadius:10,
    width: 370,
    marginVertical:'5%',
    shadowColor: '#000',  // Shadow color
    shadowOffset: { width: 0, height: 4 },  
    shadowOpacity: 0.25, 
    shadowRadius: 6,   
    justifyContent: 'center',  // Centers vertically
    alignSelf:'center',
    paddingBottom:'4%'
  },

  tableHeader: {
    flexDirection:'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFE68A',
    borderBlockColor:'#0A6138',
    borderWidth:1, 
    marginTop:'4%',
    marginHorizontal:'2%',
  },

  tableHeaderText1: {
    fontFamily: 'nunito-bold',
    fontSize: 10,
    color:'#0A6138',
    width:60,
    paddingRight:'2%',
    textAlign:'center'
  },

  tableHeaderText2: {
    fontFamily: 'nunito-bold',
    fontSize: 10,
    color:'#0A6138',
    width:95,
    textAlign:'center',
    marginLeft:'6%'
  },

  tableContent: {
    flexDirection:'row',
    padding: 10,
    borderBlockColor:'#0A6138', 
    borderBottomWidth:1,
    borderRightWidth:1,
    borderLeftWidth:1,
    marginHorizontal:'2%',
    backgroundColor:'#EBF7D4',
    shadowColor: '#000',  // Shadow color
    shadowOffset: { width: 0, height: 4 },  
    shadowOpacity: 0.25, 
    shadowRadius: 6, 
  },

  tableContentText: {
    fontFamily: 'nunito-medium',
    fontSize: 10,
    color:'#000000',
    width:55,
    marginRight:'2%',
    marginVertical: '5%',
    alignSelf:'center',
    textAlign:'center',
    borderRadius: 20,
  },

  collapsibleContainer: {
    flex: 1,
    marginVertical: 4, 
  },
  
  collapsibleIcon: {
    marginLeft: '5%', 
    width: 68,
    paddingLeft:'90%',
  },

  participantBox: {
    marginTop: 8, 
    backgroundColor: '#A1D599', 
    borderRadius: 6, 
    width:62,
    marginRight:'8%',
    alignSelf:'flex-end',
  },
  
  returnButton: {
    backgroundColor: '#FFE68A',
    marginLeft: '12%',
    width: 75,
    height:30,
    borderRadius: 16,
    borderWidth:0.5,
    borderColor:'#DCD7D7',
    shadowColor: '#000',  // Shadow color
    shadowOffset: { width: 0, height: 2},  
    shadowOpacity: 0.5, 
    marginTop: '5%'
  },
    
  Footer: {
    flexDirection:'row'
  },

  nextButton: {
    backgroundColor: '#FFE68A',
    marginLeft: '42%',
    width: 75,
    height:30,
    borderRadius: 16,
    borderWidth:0.5,
    borderColor:'#DCD7D7',
    shadowColor: '#000',  // Shadow color
    shadowOffset: { width: 0, height: 2},  
    shadowOpacity: 0.5, 
    marginTop: '5%'
  },

  nextButtonText: {
    color: '#0A6138',
    fontSize: 10,
    fontFamily: 'nunito-bold',
    textAlign:'center',
    paddingVertical:'10%'
  },

  nameBox: {
    fontSize: 12,
    fontFamily: 'nunito-bold',
    marginVertical: 5,
    marginLeft: '15%',
    textAlign:'center',
    padding: 5,
    borderRadius: 99
  },
  selectedNamesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nameBoxText: {
    fontFamily: 'nunito',
    fontSize: 10
  }

});
