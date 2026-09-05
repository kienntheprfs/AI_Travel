import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';

import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';

import Collapsible from 'react-native-collapsible';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../configs/FireBaseConfig';

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

export default function TourFinal() {
  const router = useRouter();
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [lowerTotalEstimatedCost, setLowerTotalEstimatedCost] = useState(0);
  const [upperTotalEstimatedCost, setUpperTotalEstimatedCost] = useState(0);
  const [userTrips, setUserTrips] = useState([]);
  const [dateRange, setDateRange] = useState([]);

  const { docIdForEdit } = useLocalSearchParams();

  useEffect(() => {
    const GetMyTrips = async () => {
      try {
        if (docIdForEdit) {
          const tripDoc = await getDoc(doc(db, 'UserTrips', docIdForEdit));
          if (tripDoc.exists()) {
            setUserTrips([tripDoc.data()]);
          } else {
            console.error("No trip found for docId:", docIdForEdit);
          }
        }
      } catch (error) {
        console.error("Error fetching user trips:", error);
      }
    };

    GetMyTrips();
  }, [docIdForEdit]);

  useEffect(() => {
    if (userTrips.length > 0) {
      const { StartDate, EndDate } = userTrips[0];
      const dates = getDateRange(StartDate, EndDate);
      setDateRange(dates);

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

  useEffect(() => {
    if (selectedLocations.length > 0) {
      let lowerCost = 0;
      let upperCost = 0;
  
      selectedLocations.forEach((location) => {
        if (location.ticket_price) {
          lowerCost += location.ticket_price;
          upperCost += location.ticket_price;    
        }
      });
  
      setLowerTotalEstimatedCost(lowerCost);
      setUpperTotalEstimatedCost(upperCost);
    }
  }, [selectedLocations]);

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


  const renderLocations = (dayKey) => {
    const matchedLocations = selectedLocations.filter(
      (location) => location.day_visit === dayKey
    );

    if (!matchedLocations || matchedLocations.length === 0) {
      return <Text style={styles.noLocationsText}>Bạn không có lịch trình trong ngày hôm nay</Text>;
    }

    return (
      <ScrollView>
        {matchedLocations.map((location, index) => {
          const photoRef = photoRefs[location.placeName];
          const photoUri = photoRef
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${process.env.EXPO_PUBLIC_PHOTO_GOOGLE_API_KEY}`
            : null;

          return (
            <View key={`${dayKey}-location${index}`} style={styles.customBox}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.image} />
              ) : (
                <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
                  <Text>Loading...</Text>
                </View>
              )}
              <View style={styles.contentWrapper}>
                <Text style={styles.locaName}>{location.placeName}</Text>
                <Text style={styles.subText}>{location.details}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.returnButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>

      <View style={styles.headTextContainer}>
        <Text style={styles.headText}>Lịch trình của bạn</Text>
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

      <TouchableOpacity
        style={styles.ContinueButton}
        onPress={() => {
          router.push(docIdForEdit ? {
            pathname: '/tourTransport',
            params: {
              lowerTotalEstimatedCost: lowerTotalEstimatedCost,
              upperTotalEstimatedCost: upperTotalEstimatedCost,
              docIdForEdit: docIdForEdit,
            }
          } : {
            pathname: '/tourTransport',
            params: {
              lowerTotalEstimatedCost: lowerTotalEstimatedCost,
              upperTotalEstimatedCost: upperTotalEstimatedCost
            }})
        }}
      >
        <Text style={styles.ContinueText}>Tiếp tục</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9EFC8',
  },
  returnButton: {
    position: 'absolute',
    marginTop: '15%',
    marginLeft: '6%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 99,
  },
  nextButton: {
    position: 'absolute',
    marginTop: '15%',
    marginLeft: '80%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 99,
  },
  headTextContainer: {
    marginTop:'35%',
    marginLeft:'8%',
  },
  headText: {
    color:'black',
    fontFamily:'nunito-bold',
    fontSize: 20
  },
  accordionItem: {
    marginTop:'8%',
    marginLeft:'6%',
    marginRight:'6%',
    borderRadius:20,
    backgroundColor: '#A1D59963',
    overflow: 'hidden',
    elevation: 2,
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
  ContinueButton:{
    marginVertical:'10%',
    marginLeft:'72%',
    backgroundColor:'#FFDF6B',
    borderRadius:15,
    width:85,
    height:30,
  },
  ContinueText:{
    alignSelf:'center',
    fontFamily:'nunito',
    fontWeight:600,
    fontSize:16,
    color:'#02954F',
    padding:3,
  },
  noLocationsText: {
    textAlign: 'center',
    fontFamily: 'nunito',
    height: 25,
    fontSize: 13
  }
})