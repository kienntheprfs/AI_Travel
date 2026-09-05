import { StyleSheet } from "react-native";
import { Colors } from '../constants/Colors'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ACD9A5',
  },
  returnButton: {
    position: 'absolute',
    marginTop: '15%',
    marginLeft: '6%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 99,
  },
  selectBugget: {
    marginTop: '40%',
    marginHorizontal: '6%',
  },
  selectBuggetTitle: {
    fontFamily: 'nunito-bold',
    fontSize: 28,
  },
  MinMaxBuggetBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '10%',
  },
  MinBuggetBox: {
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },
  MaxBuggetBox: {
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },
  labelMinMaxValue: {
    marginTop: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontFamily: 'nunito-bold',
  },
  labelMinMaxText: {
    fontFamily: 'nunito-bold',
    color: Colors.DARK_GREEN,
  },
  sliderContainer: {
    alignItems: 'center',
  },
  continueButton: {
    padding: 15,
    backgroundColor: Colors.LIGHT_YELLOW,
    borderRadius: 30,
    marginLeft: '65%',
    marginRight: '6%',
    marginTop: '5%'
  },
  continueButtonText: {
    textAlign: 'center',
    fontFamily: 'nunito-bold',
    color: Colors.DARK_GREEN
  }
});
