import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth * 0.92; // Tăng kích thước card lên 6/7 chiều rộng màn hình
const cardHeight = cardWidth;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    // flex: 1,
  },
  bodyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: '20%',
  },
  firstHeaderContainer: {
    // gap: screenWidth - 300,
    marginTop: '15%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userNameBox: {
    backgroundColor: 'white',
    paddingHorizontal: 10, // Giảm padding ngang để tiết kiệm không gian
    paddingVertical: 5,
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center', // Căn giữa các phần tử theo chiều dọc
    width: '33%', // Chiếm 1/3 chiều rộng màn hình
    justifyContent: 'flex-start', // Căn các phần tử về phía bên trái
    marginLeft: '5%',
  },
  imageBox: {
    backgroundColor: 'pink',
    borderRadius: 99,
    width: 40, // Giữ nguyên kích thước hình ảnh
    height: 40, // Giữ nguyên kích thước hình ảnh
    justifyContent: 'center',
    alignItems: 'center',
  },
  userImage: {
    width: 40, // Giữ nguyên kích thước hình ảnh
    height: 60, // Giữ nguyên kích thước hình ảnh
    borderRadius: 25, // Bo góc để phù hợp với kích thước
    top: -12,
  },
  userName: {
    fontFamily: 'nunito-bold',
    fontSize: 12, // Giảm kích thước chữ để phù hợp với không gian nhỏ hơn
    marginLeft: 8, // Khoảng cách giữa hình ảnh và chữ
    flexShrink: 1, // Cho phép chữ co lại nếu không đủ không gian
    overflow: 'hidden', // Ẩn phần chữ vượt quá kích thước
    whiteSpace: 'nowrap', // Ngăn chữ xuống dòng
    textOverflow: 'ellipsis', // Hiển thị dấu "..." nếu chữ quá dài
  },
  notificationButton: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 99,
  },
  secondHeaderContainer: {
    marginTop: '5%',
    marginLeft: '7%',
    position: 'relative', // Cần thiết để định vị hình ảnh calligraphy line
  },
  calligraphyLine: {
    position: 'absolute',
    bottom: -10, // Điều chỉnh vị trí dọc
    right: '20%', // Điều chỉnh vị trí ngang
    width: 150, // Điều chỉnh kích thước hình ảnh
    height: 20, // Điều chỉnh kích thước hình ảnh
    resizeMode: 'contain', // Đảm bảo hình ảnh không bị méo
  },
  secondHeaderContainerTitleText: {
    fontFamily: 'nunito-bold',
    fontSize: 30,
  },
  firstBodyContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    marginHorizontal: '5%',
    // alignItems: 'center',
  },
  tourTitle: {
    fontFamily: 'nunito-bold',
    fontSize: 20,
    color: Colors.DARK_GREEN,
    marginLeft: '5%',
    paddingVertical: '2%',
    marginTop:'5%'
  },
  viewAllText: {
    fontFamily: 'nunito',
    fontSize: 12,
    color: Colors.DARK_GREEN,
  },
  tourScrollView: {
    paddingVertical: 10,
  },
  tourCard: {
    backgroundColor: '#FFE68A',
    borderRadius: 20,
    marginHorizontal: 10,
    width: cardWidth, // Sử dụng chiều rộng mới
    height: cardHeight, // Giữ nguyên chiều cao hoặc điều chỉnh nếu cần
    padding: 14,
    marginBottom: 20, // Thêm khoảng cách giữa các card
    // Hiệu ứng shadow để tạo cảm giác nổi
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 6,
    // Border xung quanh card
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    // Giảm độ đậm của border ở bottom
    borderBottomWidth: 0.5, // Giảm độ dày của border ở bottom
    borderBottomColor: 'rgba(255, 255, 255, 0.2)', // Giảm độ đậm của border ở bottom
  },
  tourImage: {
    width: '100%',
    height: '75%',
    borderRadius: 17,
  },
  tourDestination: {
    fontFamily: 'Nunito',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#1B1E28',
    // marginTop: 10,
    marginLeft: '1%',
    flexShrink: 1,
  },
  tourDate: {
    fontFamily: 'Nunito',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.5,
    color: '#7D848D',
    marginLeft: '1%',
    zIndex: 1,
  },
  tourMarker: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(27, 30, 40, 0.2)',
    width: 34,
    height: 34,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(30px)',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F9',
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
    flex: 1,
    marginLeft: 10,
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 6,
    position: 'relative',
    zIndex: 2,
  },
  searchResultDropdown: {
    position: 'absolute',
    top: 20,
    left:9,
    padding: 10,
    paddingTop: 30,
    backgroundColor: '#F4ECAE',
    zIndex: 1,
    width: '88%',
    // height: 100,
    elevation: 5,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    
    
    color: '#7D848D',
  },
  searchResultTitle: {
    fontFamily: 'Nunito',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
    letterSpacing: 0.5,
    textAlign: 'left',
    marginBottom: 5,
    // textDecorationLine: 'underline',
    textDecorationSkipInk: 'none',

  },
  searchResultDate: {
    color: '#7D848D',
    flexShrink: 1,
    fontFamily: 'Nunito',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 15,
    letterSpacing: 0.5,
    textAlign: 'left',
    textDecorationSkipInk: 'none',
  },
  searchResultDateAndJoinButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tourJoinButton: {
    backgroundColor: '#0A6138',
    borderRadius: 20,
  },
  tourJoinButtonText: {
    color: '#A1D599',
    fontFamily: 'Nunito',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
    borderRadius: 18,
    paddingHorizontal: 10,
    // paddingVertical: 1,
    textDecorationSkipInk: 'none',
    flexShrink: 1,
  },
  searchBar: {
    flex: 1,
    height: 40,
    fontFamily: 'Nunito',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.3,
    color: '#7D848D',
    zIndex: 2,
  },
  tourInfo: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codePopup: {
    position: 'absolute',
    top: 35,
    right: -25,
    backgroundColor: '#D5E9D2',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 25,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#DCD7D7',
    borderWidth: 1,
    elevation: 10,
    // width: screenWidth * 0.62
  },
  codeText: {
    fontFamily: 'Nunito',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13.64,
    color: '#0A6138',
    marginRight: 5,
  },
  codeBox: {
    backgroundColor: '#F8F7F7',
    padding: 4,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#DCD7D7',
    borderWidth: 1,
    // width: 200,
  },
  codeImage: {
    width: 20,
    top: -17,
    right: 25,
    position: 'absolute',
    zIndex: 1000,

  },
  tourCode: {
    fontFamily: 'Nunito',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13.64,
    color: '#7D848D',
    marginRight: 5,
  },
});