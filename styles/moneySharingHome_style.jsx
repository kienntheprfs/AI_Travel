import { StyleSheet, Dimensions } from 'react-native'
import { Colors } from '../constants/Colors'

const GAP = Dimensions.get('window').width - 300;
const FRAMEGAP = Dimensions.get('window').width - 318;

export const styles = StyleSheet.create({
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
      marginBottom: 4,
      fontSize: 24,
      fontFamily: 'nunito-bold',
      color: '#0A6138'
    },

    bodyText: {
      marginVertical: '4%',
      marginLeft: 20,
      marginRight:'10%',
      fontSize: 12,
      fontFamily: 'nunito-bold',
      color: '#0A6138',
    },

    bodyAddCategories: {
      flexDirection:'column',
      marginVertical: 12,
    },

    bodyMoney: {
      flexDirection: 'row',
      width:'30%',
    },

    bodyAddMoney1: {
      height: 32,
      marginVertical: '6%',
      marginLeft: '8%',
      borderWidth: 1,
      padding: 7,
      width: '94%',
      backgroundColor: 'white',
      borderColor:'#DCD7D7',
      borderRadius:16,
    },

    bodyAddMoney2: {
      height: 32,
      marginVertical: '3%',
      borderWidth: 1,
      padding: 8,
      width: '34%',
      backgroundColor: 'white',
      borderColor:'#DCD7D7',
      borderRadius:16,
    },

    // Nguoi ung tien
    
    plusIcon: {
      color:'#0A6138',
      marginRight:'-1%'
    },

    MoneyIcon: {
      position: 'relative',
      color:'#0A6138',
      marginLeft: '90%',
      marginTop: '-25%'
    },

    input: {
      fontFamily: 'nunito',
      fontSize: 12,
      color: '#000000'
    },

    nameBox: {
      fontSize: 12,
      fontFamily: 'nunito-bold',
      marginVertical: 8,
      marginHorizontal: 10,
      textAlign:'center'
    },


    returnButton: {
      padding: 15,
      backgroundColor: 'white',
      borderRadius: 99,
      marginLeft: '5%',
      marginRight: '81%',
      marginBottom: '20%'
    },
    nextButton: {
      backgroundColor: '#FFE68A',
      marginLeft: '75%',
      width: 75,
      height:30,
      borderRadius: 16,
      borderWidth:0.5,
      borderColor:'#DCD7D7',
      shadowColor: '#000',  // Shadow color
      shadowOffset: { width: 0, height: 2},  
      shadowOpacity: 0.5, 
    },

    nextButtonText: {
      color: '#0A6138',
      fontSize: 10,
      fontFamily: 'nunito-bold',
      textAlign:'center',
      paddingVertical:'10%'
    },
 
});