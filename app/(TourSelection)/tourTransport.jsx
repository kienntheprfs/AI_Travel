import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../configs/FireBaseConfig';

import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TourTransport() {
  const router = useRouter();
  const { lowerTotalEstimatedCost, upperTotalEstimatedCost, docIdForEdit } = useLocalSearchParams();
  const [userTrips, setUserTrips] = useState([]);
  const [transportation, setTransportation] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [lowerCost, setLowerCost] = useState(parseInt(lowerTotalEstimatedCost) || 0);
  const [upperCost, setUpperCost] = useState(parseInt(upperTotalEstimatedCost) || 0);
  const [docId, setDocId] = useState();

  useEffect(() => {
    const GetMyTrips = async () => {
      try {
        let trips = [];
        if (docIdForEdit) {
          const tripDoc = await getDoc(doc(db, 'UserTrips', docIdForEdit));
          if (tripDoc.exists()) {
            trips = [tripDoc.data()];
            setDocId(docIdForEdit);
          } else {
            console.error("No trip found for docId:", docIdForEdit);
          }
        }

        setUserTrips(trips);

        if (trips.length > 0) {
          const transportationData = trips[0]?.tripData?.transportation || {};
          const mappedTransportation = Object.keys(transportationData).map((key) => {
            const transport = transportationData[key];
            const isSelected = transport.isSelectedTransport || false;
            return {
              id: key,
              title:
                key === 'bus'
                  ? 'Xe khách'
                  : key === 'flight'
                  ? 'Máy bay'
                  : key === 'train'
                  ? 'Tàu hỏa'
                  : 'Tự lái',
              icon:
                key === 'bus' ? (
                  <MaterialIcons name="directions-bus" size={24} color="black" />
                ) : key === 'flight' ? (
                  <MaterialCommunityIcons name="airplane" size={26} color="black" />
                ) : key === 'train' ? (
                  <FontAwesome5 name="train" size={24} color="black" />
                ) : (
                  <Feather name="truck" size={24} color="black" />
                ),
              details: transport.details || 'Tự lái phương tiện của bạn theo kế hoạch cá nhân.',
              price: transport.price || 0,
              bookingUrl: transport.booking_url || '#',
              isSelected,
            };
          });

          const sortedTransportation = mappedTransportation.sort((a, b) => {
            if (a.id === 'self-drive') return 1;
            if (b.id === 'self-drive') return -1;
            return 0;
          });

          setTransportation(sortedTransportation);

          const selected = sortedTransportation.find((t) => t.isSelected);
          let initialLowerCost = parseInt(lowerTotalEstimatedCost) || 0;
          let initialUpperCost = parseInt(upperTotalEstimatedCost) || 0;

          if (selected) {
            initialLowerCost += selected.price;
            initialUpperCost += selected.price;
            setSelectedTransport(selected.id);
          }

          // Set initial costs
          setLowerCost(initialLowerCost);
          setUpperCost(initialUpperCost);
        }
      } catch (error) {
        console.error("Error fetching user trips:", error);
      }
    };

    if (docIdForEdit) {
      GetMyTrips();
    }
  }, [docIdForEdit]);

  const handleSelect = (id, price) => {
    setSelectedTransport((prevSelected) => {
      if (prevSelected === id) {
        // Unselect transport, subtract cost
        setLowerCost((prevCost) => prevCost - price);
        setUpperCost((prevCost) => prevCost - price);
        return null; // Deselect transport
      } else {
        // Select new transport, add cost
        // Subtract previous transport's cost if it's selected
        if (prevSelected) {
          const prevTransport = transportation.find((t) => t.id === prevSelected);
          if (prevTransport) {
            const prevPrice = prevTransport.price || 0;
            setLowerCost((prevCost) => prevCost - prevPrice);
            setUpperCost((prevCost) => prevCost - prevPrice);
          }
        }
        setLowerCost((prevCost) => prevCost + price);
        setUpperCost((prevCost) => prevCost + price);
        return id; // Select new transport
      }
    });
  };

  const handleSaveTripData = async () => {
    if (!userTrips.length) {
      console.error("No trips found for the user.");
      return;
    }

    // Cập nhật transportation
    const currentTransportation = userTrips[0]?.tripData?.transportation || {};
    const updatedTransportation = Object.keys(currentTransportation).reduce((acc, key) => {
      acc[key] = {
        ...currentTransportation[key],
        isSelectedTransport: key === selectedTransport, // Chỉ set true cho phương tiện được chọn
      };
      return acc;
    }, {});

    try {
      // Ensure you're targeting the correct trip using the document ID from userTrips
      const tripDocRef = doc(db, "UserTrips", docId);

      // Use setDoc to replace the entire document, with a merge option to only update the relevant fields
      await setDoc(
        tripDocRef,
        {
          tripData: {
            transportation: updatedTransportation,
          },
          lowerCost: lowerCost,
          upperCost: upperCost,
        },
        { merge: true } // merge ensures only updated fields are written, not the entire document
      );
      console.log("Trip data updated successfully in Firebase.");
      router.push({
        pathname: '/tourFinalPreview',
        params: { docId: docId },
      });
    } catch (error) {
      console.error("Error updating trip data in Firebase:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.returnButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Hãy chọn phương tiện phù hợp nhé!</Text>

      <ScrollView style={{ marginTop: '5%' }}>
        <View style={styles.cardContainer}>
          {transportation.length > 0 ? (
            transportation.map((option) => (
              <View key={option.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    {option.icon}
                    <Text style={styles.cardTitle}>{option.title}</Text>
                  </View>
                  <TouchableOpacity onPress={() => { handleSelect(option.id, option.price); }}>
                    <Feather
                      name={selectedTransport === option.id ? "check" : "plus-circle"}
                      size={16}
                      color={selectedTransport === option.id ? "#02954F" : "black"}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.iconTextContainer}>
                    <Ionicons name="information-circle-outline" size={16} color="black" />
                    <Text style={styles.cardText}>{option.details}</Text>
                  </View>
                  <View style={styles.iconTextContainer}>
                    <Ionicons name="pricetag-outline" size={16} color="black" />
                    <Text style={styles.cardText}>Giá vé: {option.price.toLocaleString()} đồng</Text>
                  </View>
                </View>

                {option.bookingUrl !== '#' && (
                  <TouchableOpacity style={styles.button} onPress={() => router.push(option.bookingUrl)}>
                    <Text style={styles.buttonText}>Đặt vé</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <Text>Không có phương tiện vận chuyển cho chuyến đi này</Text>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.continueButton} onPress={handleSaveTripData}>
        <Text style={styles.continueButtonText}>Lưu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F2D4',
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
  title: {
    marginTop: '32%',

    fontFamily: 'nunito-bold',
    fontSize: 18,
    textAlign: 'center',
    color: 'black'
  },
  cardContainer: {
    marginHorizontal: '5%',
    backgroundColor: '#A1D59963',
    borderRadius: 15,
    padding: 10,
  },
  card: {
    backgroundColor: '#FFE68A',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'column',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardTitle: {
    fontFamily: 'nunito',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: 0.5,
    textAlign: 'left',
    textDecorationSkipInk: 'none',
    textUnderlinePosition: 'from-font',
    marginLeft: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: {
    // marginLeft: 30,
    // backgroundColor: 'red'
  },
  cardText: {
    fontFamily: 'nunito',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 16,
    marginLeft: 12,
    letterSpacing: 0.3,
    textAlign: 'left',
    textDecorationSkipInk: 'none',
    textUnderlinePosition: 'from-font',
    maxWidth:'90%',
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginLeft: 2,
    // backgroundColor: 'blue'
  },
  button: {
    backgroundColor: '#02954F',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: 'flex-end',

  },
  buttonText: {
    color: '#FFE68A',
    fontFamily: 'nunito-bold',
    fontSize: 12,
  },
  continueButton: {
    padding:5,
    backgroundColor: '#FFDF6B',
    borderRadius: 30,
    marginLeft: '72%',
    marginRight: '10%',
    marginBottom: '5%',
    marginTop: '2%',
    width:85,
    height:30,
    
  },
  continueButtonText: {
    textAlign: 'center',
    fontFamily: 'nunito-bold',
    color: '#02954F'
  }
});
