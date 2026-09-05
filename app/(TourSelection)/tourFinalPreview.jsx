import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Colors } from '../../constants/Colors';

import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AntDesign } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import Collapsible from 'react-native-collapsible';
import { collection, getDocs, query, where} from 'firebase/firestore';
import { db } from '../../configs/FireBaseConfig';

const ReviewSection = ({ icon, title, text, styles }) => (
  <View style={styles.container}>
    {icon}
    <View style={styles.box}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  </View>
);

const AccordionItem = ({ title, expanded, toggleAccordion, renderContent }) => (
  <View style={styles.accordionItem}>
    <View style={[styles.header, expanded && styles.headerExpanded]}> 
      <Text style={[styles.title, expanded && styles.titleExpanded]}>{title}</Text> 
      <TouchableOpacity onPress={toggleAccordion}>
        <AntDesign name={expanded ? "caretdown" : "caretright"} size={20} color="#02954F" />
      </TouchableOpacity>
    </View>

    <Collapsible collapsed={!expanded}>
      <View style={styles.content}>{renderContent && renderContent()}</View>
    </Collapsible>
  </View>
);


const getDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dateArray = [];

  while (start <= end) {
    dateArray.push(new Date(start).toISOString().split('T')[0]);
    start.setDate(start.getDate() + 1);
  }

  return dateArray;
};

const GetPhotoRef = async (placeName) => {
  try {
    const resp = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${placeName}&key=${process.env.EXPO_PUBLIC_PHOTO_GOOGLE_API_KEY}`
    );
    const result = await resp.json();
    return result?.results[0]?.photos[0]?.photo_reference;
  } catch (error) {
    console.error("Error fetching photo reference:", error);
    return null;
  }
};

export default function TourFinalPreview() {
  const router = useRouter();
  const { docId } = useLocalSearchParams();
  const [userTrips, setUserTrips] = useState([]);
  const [Budget, setBudget] = useState('');
  const [Destination, setDestination] = useState('');
  const [StartDate, setStartDate] = useState('');
  const [EndDate, setEndDate] = useState('');
  const [WhoTravel, setWhoTravel] = useState('');
  const [selectedTransport, setSelectedTransport] = useState('');
  const [dateRange, setDateRange] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const GetMyTrips = async () => {
      if (!docId) return;
      try {
        const q = query(collection(db, 'UserTrips'), where('ID', '==', docId));
        const querySnapshot = await getDocs(q);
        const trips = [];
        querySnapshot.forEach((doc) => {
          trips.push(doc.data());
        });
        setUserTrips(trips);

        if (trips.length > 0) {
          const trip = trips[0];
          setDestination(trip.Destination || '');
          setStartDate(trip.StartDate || '');
          setEndDate(trip.EndDate || '');
          setWhoTravel(trip.WhoTravel || '');

          // Handle Budget
          if (trip.lowerCost === trip.upperCost) {
            setBudget(formatNumber(trip.lowerCost) + ' đồng / người');
          } else {
            setBudget(
              `${formatNumber(trip.lowerCost)} - ${formatNumber(trip.upperCost)} đồng / người`
            );
          }

          // Find Selected Transport
          const transportation = trip.tripData?.transportation || {};
          const selectedTransportKey = Object.keys(transportation).find(
            (key) => transportation[key]?.isSelectedTransport
          );
          setSelectedTransport(selectedTransportKey || 'Không có phương tiện được chọn');
        }
      } catch (error) {
        console.error('Error fetching user trips:', error);
      }
    };

    GetMyTrips();
  }, [docId]);


  useEffect(() => {
    if (userTrips.length > 0) {
      const dates = getDateRange(StartDate, EndDate);
      setDateRange(dates);

      // Preselect locations with day_visit
      const allLocations = userTrips[0]?.tripData?.places_to_visit || [];
      const preselectedLocations = allLocations
        .filter((location) => location.day_visit !== "None")
        .map((location) => ({
          ...location,
          day_visit: location.day_visit,
        }));
      setSelectedLocations(preselectedLocations);
    }
  }, [userTrips]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const formatNumber = (number) =>
    number ? number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';

  const transportTitles = {
    flight: 'Máy bay',
    train: 'Tàu hỏa',
    bus: 'Xe khách',
    'self-drive': 'Tự lái',
  };

  const [photoRefs, setPhotoRefs] = useState({});

  useEffect(() => {
    if (userTrips.length > 0) {
      const fetchPhotoReferences = async () => {
        const allLocations = userTrips[0]?.tripData?.places_to_visit || [];
        const photoPromises = allLocations.map(async (location) => {
          const ref = await GetPhotoRef(location.placeName);
          return { placeName: location.placeName, photoRef: ref };
        });

        const photoResults = await Promise.all(photoPromises);
        const photoRefMap = photoResults.reduce((acc, curr) => {
          if (curr.photoRef) acc[curr.placeName] = curr.photoRef;
          return acc;
        }, {});

        setPhotoRefs(photoRefMap);
      };

      fetchPhotoReferences();
    }
  }, [userTrips]);

  const [destinationPhotoRef, setDestinationPhotoRef] = useState(null);

  useEffect(() => {
    const fetchDestinationPhoto = async () => {
      if (Destination) {
        const photoRef = await GetPhotoRef(Destination);
        setDestinationPhotoRef(photoRef);
      }
    };

    fetchDestinationPhoto();
  }, [Destination]);

  const renderLocations = (dayKey) => {
    const matchedLocations = selectedLocations.filter((location) => location.day_visit === dayKey);

    if (!matchedLocations || matchedLocations.length === 0) {
      return <Text style={styles.noLocationsText}>Bạn không có lịch trình trong ngày hôm nay</Text>;
    }

    return (
      <ScrollView>
        {matchedLocations.map((location, index) => (
          <View key={`${dayKey}-location${index}`} style={styles.customBox}>
            <Image
              source={
                photoRefs[location.placeName]
                  ? {
                      uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRefs[location.placeName]}&key=${process.env.EXPO_PUBLIC_PHOTO_GOOGLE_API_KEY}`,
                    }
                  : require('../../assets/images/imageTourStart_nhatho.jpg') // Fallback image
              }
              style={styles.image}
            />
            <View style={styles.contentWrapper}>
              <View style={styles.headCA}>
                <Text style={styles.locaName}>{location.placeName}</Text>
                <View style={styles.IconWrapper}>
                  <Feather name="navigation" size={16} color="black" />
                </View>
              </View>
              <Text style={styles.subText}>{location.details}</Text>
              <View style={styles.ContentDetail}>
                <View style={styles.IconDetail}>
                  <Feather name="clock" size={14} color="black" />
                </View>
                <Text style={styles.textDetail}>Thời gian tham quan: {location.best_time_to_visit}</Text>
              </View>
              <View style={styles.ContentDetail}>
                <Ionicons name="ticket-outline" size={15} color="black" />
                <Text style={styles.textDetail}>Giá vé: {location.ticket_price.toLocaleString()} đồng</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    )
  };

  return (
    <ScrollView style={styles.container}>
      {destinationPhotoRef ? (
        <Image
          source={{
            uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${destinationPhotoRef}&key=${process.env.EXPO_PUBLIC_PHOTO_GOOGLE_API_KEY}`,
          }}
          style={{ width: '100%', height: 250 }}
        />
      ) : (
        <Image
          source={require('../../assets/images/tourFinalPreviewHeroimage.png')}
          style={{ width: '100%', height: 250 }}
        />
      )}

      <View style={{ flexDirection: 'row', position: 'relative' }}>
        <TouchableOpacity style={{ position: 'absolute', top: 17, right: 60 }}>
          <Feather name="share-2" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ position: 'absolute', top: 17, right: 20 }}
          onPress={() => {
            router.push({
              pathname: '/tourStart',
              params: {
                docIdForEdit: docId
              }
            })
          }}
        >
          <Feather name="edit-2" size={20} color="black" />
        </TouchableOpacity>
      </View>

      <ReviewSection
        icon={<Ionicons name="location-outline" size={26} color="black" />}
        title="Điểm đến"
        text={Destination}
        styles={styles.common}
      />

      <ReviewSection
        icon={<Feather name="calendar" size={26} color="black" />}
        title="Thời gian"
        text={`${formatDate(StartDate)} - ${formatDate(EndDate)} (${StartDate && EndDate ? (new Date(EndDate) - new Date(StartDate)) / (1000 * 60 * 60 * 24) + 1 : 0} ngày)`}
        styles={styles.common}
      />

      <ReviewSection
        icon={<AntDesign name="hearto" size={26} color="black" />}
        title="Tận hưởng chuyến đi"
        text={WhoTravel}
        styles={styles.common}
      />

      <ReviewSection
        icon={<FontAwesome name="money" size={24} color="black" />}
        title="Dự trù kinh phí chuyến đi"
        text={Budget}
        styles={styles.common}
      />

      <ReviewSection
        icon={
          selectedTransport === 'bus' ? (
            <MaterialIcons name="directions-bus" size={24} color="black" />
          ) : selectedTransport === 'flight' ? (
            <MaterialCommunityIcons name="airplane" size={26} color="black" />
          ) : selectedTransport === 'train' ? (
            <FontAwesome5 name="train" size={24} color="black" />
          ) : selectedTransport === 'self-drive' ? (
            <Feather name="truck" size={24} color="black" />
          ) : (
            <Feather name="help-circle" size={24} color="black" />
          )
        }
        title="Phương tiện di chuyển"
        text={transportTitles[selectedTransport] || 'Không có phương tiện được chọn'}
        styles={styles.common}
      />

      <View style={styles.reviewSchedule}>
        <Feather name="map" size={24} color="black" />
        <Text style={styles.reviewScheduleTitle}>Lịch trình</Text>
        </View>
        {dateRange.map((date, index) => {
          const formattedDate = new Date(date).toLocaleDateString('vi-VN');
          return (
            <AccordionItem
              key={`day${index}`}
              title={`Ngày ${index + 1} - ${formattedDate}`}
              expanded={expandedIndex === index}
              toggleAccordion={() => setExpandedIndex(expandedIndex === index ? null : index)}
              renderContent={() => renderLocations(`day${index}`)}
            />
          );
        })}
      
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
    backgroundColor: '#FFE68A',
    paddingBottom:'10%'
  },
  reviewSchedule: {
    marginHorizontal: '3%',
    alignItems: 'center',
    marginTop: '3%',
    flexDirection:'row',
    
  },
  reviewScheduleTitle: {
    fontFamily: 'nunito',
    fontSize: 14,
    marginLeft: 10,
    lineHeight: 20,
    letterSpacing: 0.5,
    marginLeft: 12,
  
  }
  ,
  common: {
    container: {
      flexDirection: 'row',
      marginHorizontal: '3%',
      marginTop: '5%',
      marginBottom: '1%'
    },
    box: {
      marginTop: -6,
      marginLeft: 10
    },
    title: {
      fontFamily: 'nunito',
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: 0.5,
      textAlign: 'left',
      color: '#1B1E28'
    },
    text: {
      fontFamily: 'nunito',
      fontSize: 14,
      fontWeight: '800',
      lineHeight: 20,
      letterSpacing: 0.5,
      textAlign: 'left',
      color: '#0A6138'
    },
  },
  accordionItem: {
    marginTop:'5%',
    marginLeft:'6%',
    marginRight:'6%',
    borderRadius:20,
    backgroundColor: '#A1D59963',
    overflow: 'hidden',
    elevation: 2,
    marginBottom:'2%'
  },
  header: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius:20,
    flexDirection:'row',
    justifyContent:'space-between',
  },
  headerExpanded:{
    backgroundColor:'#A1D599',
  },
  title: {
    color: 'black',
    marginLeft:'3%',
    fontSize: 16,
    fontFamily: 'nunito',
  },
  titleExpanded:{
    fontFamily:'nunito-bold',
  },
  content: {
    padding: 5,
    maxHeight:300,
  },
  customBox: {
    marginTop: '0.1%',
    marginBottom:'2%',
    backgroundColor: Colors.LIGHT_YELLOW,
    padding: 8,
    borderRadius: 16,
  },
  contentWrapper:{
    marginLeft:'2%',
  },
  image: {
    width: '100%',
    height: 165,
    marginBottom:'2%',
    borderRadius: 16,
  },
  headCA:{
    flexDirection:'row',
    justifyContent:'space-between',
  },
  locaName:{
    fontSize:16,
    fontWeight: 600,
    fontFamily:'nunito',
  },
  IconWrapper:{
    marginTop:'1%',
    marginRight:'2%',
    flexDirection:'row',
    justifyContent:'space-between=',
    justifyContent:'flex-end',
    gap:'10%',
  },
  subText:{
    fontFamily:'nunito',
    fontSize:13,
    fontWeight:600,
  },
  ContentDetail:{
    marginTop:'2%',
    flexDirection:'row',
    justifyContent:'space-between=',
    gap:'1%',
  },
  textDetail:{
    color:'#7D848D',
    fontFamily:'nunito',
    fontSize:13,
    fontWeight:400,
    maxWidth:'97%',
  },
  IconDetail:{
    marginTop:'0.6%'
  },
  noLocationsText: {
    textAlign: 'center',
    fontFamily: 'nunito',
    height: 25,
    fontSize: 13
  },

  button2Container: {
    alignSelf:'center',
    marginVertical:'2%',
    paddingBottom: '5%'
  },

  returnHome: {
    marginRight: '4%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 99,
  },
});
