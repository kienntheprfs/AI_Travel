import { View, Text, Image, TouchableOpacity, ScrollView, TouchableHighlight, TextInput, Alert, TouchableWithoutFeedback, Keyboard, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Colors } from '../../constants/Colors';
import Feather from '@expo/vector-icons/Feather';
import { styles } from '../../styles/mytrip_style';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, query, where, doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '../../configs/FireBaseConfig';

// Function to get photo reference from Google Places API
const GetPhotoRef = async (PlaceName) => {
  try {
    const resp = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${PlaceName}&key=${process.env.EXPO_PUBLIC_PHOTO_GOOGLE_API_KEY}`
    );
    const result = await resp.json();
    return result?.results[0]?.photos[0]?.photo_reference;
  } catch (error) {
    console.error("Error fetching photo reference:", error);
    return null;
  }
};

function ResultDropDown({ visible, onClose, tour, onJoinTour, tourOwnerName }) {
  if (!visible || !tour) return null;

  return (
    <View style={styles.searchResultDropdown}>
      <Text style={styles.searchResultTitle}>
        Du lịch {tour.Destination} tạo bởi {tourOwnerName}
      </Text>
      <View style={styles.searchResultDateAndJoinButton}>
        <Text style={styles.searchResultDate}>
          {new Date(tour.StartDate).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})}
        </Text>
        <TouchableOpacity style={styles.tourJoinButton} onPress={() => onJoinTour(tour.id)}>
          <Text style={styles.tourJoinButtonText}>Tham gia</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MyTrip() {
  const router = useRouter();
  const [showCodePopup, setShowCodePopup] = useState(null);
  const [tours, setTours] = useState([]);
  const [showResultDropDown, setShowResultDropDown] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const [tourImages, setTourImages] = useState({}); // To store fetched images by tour ID
  const [tourOwnerName, setTourOwnerName] = useState('')

  useEffect(() => {
    const checkSession = async () => {
      const user = await AsyncStorage.getItem('userSession');
      if (user) {
        const userData = JSON.parse(user);
        setCurrentUserEmail(userData.email);
        fetchUserName(userData.email);
        fetchTours(userData.email);
      }
    };
    checkSession();
  }, []);

  const fetchUserName = async (email) => {
    try {
      const usersQuery = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(usersQuery);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        setUserName(userData.fullName || '');
      } else {
        console.warn('No matching user document found');
      }
    } catch (error) {
      console.error('Error fetching user name: ', error);
    }
  };

    // Hàm sao chép mã code vào clipboard
  const copyToClipboard = async (code) => {
    try {
      await Clipboard.setStringAsync(code); // Sao chép mã code vào clipboard
      Alert.alert('Thành công', 'Mã code đã được sao chép!'); // Hiển thị thông báo
    } catch (error) {
      console.error('Lỗi khi sao chép mã code: ', error);
      Alert.alert('Lỗi', 'Không thể sao chép mã code.'); // Hiển thị thông báo lỗi
    }
  };

  const fetchTours = async (userEmail) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'UserTrips'));
      const toursData = [];
      querySnapshot.forEach((doc) => {
        const tourData = doc.data();
        if (tourData.userEmail === userEmail) {
          toursData.push({ id: doc.id, ...tourData });
        }

        if (tourData.participants && tourData.participants.includes(userEmail)) {
          toursData.push({ id: doc.id, ...tourData });
        }
      });
      setTours(toursData);

      // Fetch images for each tour
      for (let tour of toursData) {
        const imageRef = await GetPhotoRef(tour.Destination);
        if (imageRef) {
          const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${imageRef}&key=${process.env.EXPO_PUBLIC_PHOTO_GOOGLE_API_KEY}`;
          setTourImages((prevImages) => ({ ...prevImages, [tour.id]: imageUrl }));
        }
      }

    } catch (error) {
      console.error('Error fetching tours: ', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTours(currentUserEmail);
  };

  const fetchSearchTourUserName = async (email) => {
    try {
      const usersQuery = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(usersQuery);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        setTourOwnerName(() => userData.fullName || '');
      } else {
        console.warn('No matching user document found');
      }
    } catch (error) {
      console.error('Error fetching user name: ', error);
    }
  };

  const searchTourById = async (id) => {
    try {
      const docRef = doc(db, 'UserTrips', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const tourData = docSnap.data();
        setSearchResult({ id: docSnap.id, ...tourData });
  
        // Fetch the owner's name before showing the dropdown
        await fetchSearchTourUserName(tourData.userEmail); // Đảm bảo fetch hoàn thành trước khi hiển thị dropdown
        setShowResultDropDown(true);
      } else {
        Alert.alert('Không tìm thấy', 'Không có tour nào với ID này.');
        setSearchResult(null);
        setShowResultDropDown(false);
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm tour: ', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tìm kiếm tour.');
    }
  };

  const handleJoinTour = async (tourId) => {
    try {
      const tourRef = doc(db, 'UserTrips', tourId);
      await updateDoc(tourRef, {
        participants: arrayUnion(currentUserEmail),
      });
      Alert.alert('Thành công', 'Bạn đã tham gia tour thành công!');
      setShowResultDropDown(false);
      fetchTours(currentUserEmail);
    } catch (error) {
      console.error('Lỗi khi tham gia tour: ', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tham gia tour.');
    }
  };

  const handleScroll = () => {
    setShowResultDropDown(false);
  };

  return (
    <TouchableWithoutFeedback onPress={() => { setShowResultDropDown(false); Keyboard.dismiss(); }}>
      <View style={{ backgroundColor: Colors.LIME_GREEN, flex: 1 }}>
        <View style={styles.headerContainer}>
          <View style={styles.firstHeaderContainer}>
            <View style={styles.userNameBox}>
              <View style={styles.imageBox}>
                <Image source={require('../../assets/images/character.png')} style={styles.userImage} />
              </View>
              <Text style={styles.userName}>{userName || 'Guest'}</Text>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchBarContainer}>
                <Feather name="search" size={20} color="#7D848D" />
                <TextInput
                  style={styles.searchBar}
                  placeholder="Nhập tour được chia sẻ"
                  placeholderTextColor="#7D848D"
                  value={searchText}
                  onChangeText={(text) => setSearchText(text)}
                  onFocus={() => setShowResultDropDown(true)}
                  onSubmitEditing={() => searchTourById(searchText)}
                />
              </View>

              <ResultDropDown 
                visible={showResultDropDown} 
                onClose={() => setShowResultDropDown(false)} 
                tour={searchResult} 
                onJoinTour={handleJoinTour}
                tourOwnerName={tourOwnerName}
              />
            </View>
          </View>
        </View>

        <Text style={styles.tourTitle}>Tour của tôi</Text>
        <View style={styles.bodyContainer}>
          <ScrollView 
            style={styles.tourScrollView} 
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.DARK_GREEN]}
                tintColor={Colors.DARK_GREEN}
              />
            }
          >
            {tours.map(tour => (
              <TouchableOpacity 
                key={tour.id} style={styles.tourCard} 
                onPress={() => 
                  router.push({ 
                    pathname: '/tourFinalPreview', 
                    params: { docId: tour.id } })
                }
              >
                <Image 
                  source={{ uri: tourImages[tour.id] }} 
                  style={styles.tourImage} 
                />
                
                <View style={styles.tourInfo}>
                  <Text style={styles.tourDestination}>{tour.Destination}</Text>
                  <Feather 
                    name="share-2" 
                    size={24} 
                    color="black" 
                    onPress={() => setShowCodePopup(showCodePopup === tour.id ? null : tour.id)}
                  />
                  {showCodePopup === tour.id && (
                    <View style={styles.codePopup}>
                      <Image source={require('../../assets/images/play.png')} style={styles.codeImage} />
                      <Text style={styles.codeText}>Mã code</Text>
                      <TouchableOpacity 
                        style={styles.codeBox} 
                        onPress={() => {
                          copyToClipboard(tour.id); 
                          setShowCodePopup(null);
                        }}
                      >
                        <Feather name="copy" size={16} color="#0A6138" />
                        <Text style={styles.tourCode}>{tour.id}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                
                <Text style={styles.tourDate}>{new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(tour.StartDate))}</Text>
                
                <TouchableOpacity style={styles.tourMarker}>
                  <Feather name="bookmark" size={20} color="white" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
