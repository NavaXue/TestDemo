/**
 * Message detail View.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavigationActions, StackActions } from 'react-navigation';
import {
  View,
  Text,
  TextInput,
  Image,
  ImageBackground,
  Keyboard,
  Platform,
  TouchableOpacity,
  Alert,
  Button,
  Dimensions,
  BackHandler,
  ScrollView,
  Animated,
  StyleSheet,
  SafeAreaView,
  NetInfo,
  WebView,
  Linking
} from 'react-native';
import {
  ViewWithLoader,
  HomeHeader,
} from '../../components/common';
import CurrentTheme from '../../assets/themes';
import Constants from '../../constants';
import styles1 from './style';
//import * as Progress from 'react-native-progress';
import Progressbar from '../Progressbar';
import Passwordinvalid from '../Passwordinvalid';
import MoreView from '../HomeView/MoreView';
import { performMaskEmail } from '../../PublicFunctions';

const { width: screenWidth, height: viewHeight } = Dimensions.get('window');

let width = Dimensions.get('window').width;
let height = Dimensions.get('window').height;

var messagePath;
var messageID;
var messageSubId;
var readedFlag;
var ReferenceNum;


class MessageDetails extends Component {
  TAG = 'MESSAGEVIEWDETAIL';

  constructor(props) {
    super(props);

    const { params } = this.props.navigation.state;
    //messageDate = params.date;
    messagePath = params.HtmlLink;
    messageID = params.id;
    messageSubId = params.subId;
    ReferenceNum = params.ReferenceNum;
    readedFlag = params.readedFlag
    this.state = {
      // uri: 'https://www.rwgenting.com/employees-communique/',
      // showUnread: params.showUnread,
      uri: messagePath,
    };
    this.scrollView = null;
  }

  componentDidMount() {
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      //console.log('Initial, type: ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType);
      if (connectionInfo.type == 'none') {
        Alert.alert('Connection failed', 'Please check your connection and try again.');
      } else {
        // if (readedFlag == 'N') {
        //   this.updateReadFlag();
        // }
        this.updateReadFlag();
      }
    });

    // this.backHandler = BackHandler.addEventListener('hardwareBackPress',
    //   () => {
    //     this.onBack();
    //     return true;
    //   });

    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide
    );
  }

  componentWillUnmount() {
    // this.backHandler.remove();
  }

  _keyboardDidShow = e => {
    if (Platform.OS === 'ios' && height === 812) {
      this.setState({
        keyboardHeight: e.endCoordinates.height - 35,
      });
    } else if (Platform.OS === 'ios') {
      this.setState({
        keyboardHeight: e.endCoordinates.height,

      });
    } else {
    }
  };

  _keyboardDidHide = () => {
  };

  componentWillReceiveProps = nextProps => {
    //console.log('WIll Receive Props Sign IN', nextProps);
  };

  updateReadFlag = () => {
    var url = Constants.BPMMobileAPI+"/BPMMobileAPI/api/SaveMobileReadedMessage";
    return fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        'EmployeeNum': Constants.URL_PARAM.USER_ID,
        'ID': messageID.toString(),
        'SubID': messageSubId.toString(),
        'ReadedFlag': 'Y',
        'ReferenceNum': ReferenceNum,
        'Token': Constants.URL_PARAM.TOKEN
      }),
    }).then((response) => response.json()).then(
      (response) => {
        var state = response.status;
        if (state) {
          //console.log('state', state);
          //console.log('messagePath', messagePath);
          //console.log('messageID', messageID);
          //console.log('messageSubId', messageSubId);
          //console.log('readedFlag', readedFlag);
        }
        else {
          if (response.firstObj == 'Session Timeout, please login again.') {
            Constants.TOOL_BAR.LOGINCARD = true;
            const resetAction = NavigationActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: Constants.SCREENS.SIGNIN
                })
              ]
            });
            this.props.navigation.dispatch(resetAction);
          }

        }
      }).catch((error) => {
        console.error(error);
      });
  }

  _onError = () => {
    Alert.alert(
      'Failed', 'Please try again.',
      [{
        text: 'OK',
        onPress: () => {
          this.onBack();
        }
      }]
    );
  }

  onBack = () => {
    this.props.navigation.state.params.refresh();
    this.props.navigation.dispatch(NavigationActions.back());
  }

  onNavigateCalendar = () => {
    this.props.navigation.navigate(Constants.SCREENS.CALENDAR);
  };

  onRosterView = () => {
    this.props.navigation.navigate(Constants.SCREENS.ROSTERVIEW);
  }

  onMoreView = () => {
    this.refs.moreview.setModalVisible(true);
    this.refs.moreview.receive(this);
  }

  onTrainingView = () => {
    this.props.navigation.navigate(Constants.SCREENS.INTERNAL_TRAINING);
  }

  onPPMView = () => {
    this.props.navigation.navigate(Constants.SCREENS.PPMVIEW);
  }

  onHostelView = () => {
    this.props.navigation.navigate(Constants.SCREENS.HOSTEL);
  }

  onLearnView = () => {
    var learnUrl = "https://ilearn.rwgenting.com/";
    Linking.canOpenURL(learnUrl).then(supported => {
      if (!supported) {
        Alert.alert('Note', 'Page cannot be opened.');
      } else {
        return Linking.openURL(learnUrl);
      }
    }).catch(err => {
      Alert.alert('Note', 'Page cannot be opened.');
    });
  }

  onPayslipView = () => {
    var verificationMessage;
    if (Constants.URL_PARAM.EmployeeType == 'S') {
      if (Constants.URL_PARAM.EmailAddress.length > 0) {
        var emailAddress = Constants.URL_PARAM.EmailAddress;
        // var emialAdd1 = emailAddress.substring(0, 1);
        // var emailAdd2 = emailAddress.substring(emailAddress.indexOf("@") - 1);
        // emailAddress = emialAdd1 + '******' + emailAdd2;
        verificationMessage = 'Please confirm your email address is ' + performMaskEmail(emailAddress) + '. If the email address is not the same as your current email address, kindly update it using ePersonal Profile System before you can proceed further.'
        Alert.alert('Payslip', verificationMessage,
          [{
            text: 'OK',
            onPress: () => {
              this.onSendOTP();
            }
          },
          {
            text: 'CANCEL',
            onPress: () => {
              this.refs.progressbar.setModalVisible(false);
            }
          }
          ]);
      }
      else {
        Alert.alert('Payslip', 'There is no email address record found in system. Please kindly update it using ePersonal Profile System before you can proceed further.')
      }
    }
    else {
      if (Constants.URL_PARAM.PhoneNumber.length > 0) {
        var telephone = Constants.URL_PARAM.PhoneNumber;
        //var telep1 = telephone.substring(0, telephone.length-4);
        var telep2 = telephone.substring(telephone.length - 4);
        //telephone = telep1 + 'xxx' + telep2;
        // telephone = 'XXXXXXX' + telep2;
        telephone = '*******' + telep2;
        verificationMessage = 'Please confirm your mobile phone number is ' + telephone + '. If the phone number is not the same as your current mobile phone number, kindly update it using ePersonal Profile System before you can proceed further.'

        Alert.alert('Payslip', verificationMessage,
          [{
            text: 'OK',
            onPress: () => {
              this.onSendOTP();
              // this.props.navigation.navigate(Constants.SCREENS.PAYSLIPVIEW,
              //   {
              //     refresh: (isRefresh) => this.refreshData(isRefresh)
              //   });
            }
          },
          {
            text: 'CANCEL',
            onPress: () => {
              this.refs.progressbar.setModalVisible(false);
            }
          }
          ]);
      }
      else {
        Alert.alert('Payslip', 'There is no phone number record found in system. Please kindly update it using ePersonal Profile System before you can proceed further.')
      }
    }
  }

  onSendOTP = async () => {
    this.refs.progressbar.setModalVisible(true);
    var url = Constants.BPMMobileAPI+'/BPMMobileAPI/api/GenerateIdentifyingCode'
    return fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        'iToken': Constants.URL_PARAM.TOKEN,
        'EmployeeNum': Constants.URL_PARAM.USER_ID,
        //'TelephoneNum': Constants.URL_PARAM.PhoneNumber
        'TelOrEmail': Constants.URL_PARAM.EmployeeType == 'S' ? Constants.URL_PARAM.EmailAddress : Constants.URL_PARAM.PhoneNumber
      }),
    }).then((response) => response.json())
      .then((result) => {
        if (result.status == false) {
          if (result.firstObj == 'Session Timeout, please login again.') {
            Constants.TOOL_BAR.LOGINCARD = true;
            const resetAction = NavigationActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: Constants.SCREENS.SIGNIN
                })
              ]
            });
            this.props.navigation.dispatch(resetAction);
          } else {
            this.refs.progressbar.setModalVisible(false);
            Alert.alert('PAYSLIP', result.firstObj);
          }
          return;
        }
        this.refs.progressbar.setModalVisible(false);
        this.props.navigation.navigate(Constants.SCREENS.SMSVIEW,
          {
            refresh: (isRefresh) => this.refreshData(isRefresh)
          });

      })

  }

  onNavigateHome = () => {
    const backAction = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'home' })],
    })
    this.props.navigation.dispatch(backAction);
  }
  _onMessage = (e) => {
    var url = e.nativeEvent.data;
    if (Platform.OS === 'android' && url.indexOf('.pdf') != -1) {
      url = 'http://docs.google.com/gview?embedded=true&url=' + url
    }
    Linking.openURL(url).catch(err => console.error('An error occurred', err))
  }

  _injectJavaScript = () => ` 
    var a = document.getElementsByTagName('a');
      for(var i = 0; i < a.length; i++) {
        var url = a[i].href;
        if (url.indexOf('.pdf')) {
          a[i].onclick = function (event) {
            window.postMessage(this.href);
            event.preventDefault();
          }
        }      
      }`


  render() {
    const {
      isLoading,
      isRetrieving,
      isButton,
    } = this.state;
    const {
      navigation
    } = this.props;
    if (isButton) Animated.timing(this.bottomBookingAnimation, { toValue: 1, duration: 500 }).start();
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <React.Fragment
          testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.001" : undefined}
          accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.001" : undefined}>
          <ViewWithLoader
            isLoading={isLoading}
            isRetrieving={isRetrieving}
            testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.002" : undefined}
            accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.002" : undefined}>
            <View style={styles1.container}
              testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.003" : undefined}
              accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.003" : undefined}>
              <Animated.View
                style={[
                  styles.homeHeaderContainer, { height: 60 }
                ]}
                testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.004" : undefined}
                accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.004" : undefined}
              >
                <View style={{ marginLeft: 0, flexDirection: 'row', alignItems: 'center' }}
                  testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.005" : undefined}
                  accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.005" : undefined}>
                  <TouchableOpacity

                    onPress={() => this.onBack()}
                    testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.006" : undefined}
                    accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.006" : undefined}>
                    <Image
                      resizeMode='contain'
                      style={{ height: 23, marginStart: 8 }}
                      source={CurrentTheme.imagePalette.backArrowIconRed}
                      testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.007" : undefined}
                      accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.007" : undefined} />
                  </TouchableOpacity>
                  <Image
                    resizeMode='contain'
                    style={{ height: 35, width: 35, marginStart: 3 }}
                    source={CurrentTheme.imagePalette.messageIcon}
                    testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.008" : undefined}
                    accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.008" : undefined} />
                  <Text allowFontScaling={false} style={[styles.headerText, { fontSize: 17, marginTop: Platform.OS === 'ios' ? 8 : 0 }]}
                    testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.009" : undefined}
                    accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.009" : undefined}>&nbsp;&nbsp;COMMUNIQUE DETAIL</Text>
                </View>
              </Animated.View>

              <View style={{ height: '83%', left: 0, margin: 5 }}
                testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.010" : undefined}
                accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.010" : undefined}>
                <WebView
                  //renderError={this._onError()}
                  onMessage={this._onMessage}
                  style={{ flex: 1 }}
                  source={{ uri: this.state.uri }}
                  injectedJavaScript={this._injectJavaScript()}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                />

              </View>

              {/* bottom munue icon bar */}
              <View style={[styles.bottomBar, { borderColor: 'gray', borderWidth: 1, }]}
                testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.011" : undefined}
                accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.011" : undefined}>
                <TouchableOpacity
                  style={{ width: Constants.URL_PARAM.ShowPayslip ? (width / 5) : (width / 4) }}
                  onPress={() => this.onNavigateHome()}
                  testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.012" : undefined}
                  accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.012" : undefined}>
                  <Image resizeMode="contain" style={[styles.imageStyle, { height: '45%', marginTop: 7, }]} source={CurrentTheme.imagePalette.homeIcon1}
                    testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.013" : undefined}
                    accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.013" : undefined}></Image>
                  <Text allowFontScaling={false} style={{ fontFamily: CurrentTheme.fontFamily.bold, fontSize: 10, alignSelf: 'center', marginTop: Platform.OS === 'ios' ? 2 : 0 }}>HOME</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ width: Constants.URL_PARAM.ShowPayslip ? (width / 5) : (width / 4) }}
                  onPress={() => this.onNavigateCalendar()}
                  testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.014" : undefined}
                  accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.014" : undefined}>
                  <Image resizeMode="contain" style={[styles.imageStyle, { height: '45%', marginTop: 7, }]} source={CurrentTheme.imagePalette.leaveIcon1}
                    testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.015" : undefined}
                    accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.015" : undefined}></Image>
                  <Text allowFontScaling={false} style={{ fontFamily: CurrentTheme.fontFamily.bold, fontSize: 10, alignSelf: 'center', marginTop: Platform.OS === 'ios' ? 2 : 0 }}>LEAVE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ width: Constants.URL_PARAM.ShowPayslip ? (width / 5) : (width / 4) }}
                  onPress={() => this.onBack()}
                  testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.016" : undefined}
                  accessible={false}
                  accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.016" : undefined}
                >
                  {Constants.URL_PARAM.ShowUnread && <Image resizeMode="contain" style={{ marginTop: 4, marginBottom: -14, height: 10, width: 10, marginRight: width / 15 - 8, alignSelf: 'flex-end' }} source={CurrentTheme.imagePalette.redDot}
                    testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.017" : undefined}
                    accessible={false}
                    accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.017" : undefined}
                  ></Image>}
                  <Image resizeMode="contain" style={[styles.imageStyle, { height: '50%', marginTop: 7, }]} source={CurrentTheme.imagePalette.messageIcon}
                    testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.018" : undefined}
                    accessible={false}
                    accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.018" : undefined}
                  ></Image>
                  <Text allowFontScaling={false} style={{ fontFamily: CurrentTheme.fontFamily.bold, fontSize: 10, alignSelf: 'center', marginTop: Platform.OS === 'ios' ? -1 : -3 }}>COMMUNIQUE</Text>
                </TouchableOpacity>

                {/* {Constants.URL_PARAM.ShowRoster && <TouchableOpacity
                  style={{ width: width / 5 }}
                  onPress={() => this.onRosterView()}
                  testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.019" : undefined}
                  accessible={false}
                  accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.019" : undefined}
                >
                  <Image resizeMode="contain" style={[styles.imageStyle, { height: '50%', marginTop: 7, }]} source={CurrentTheme.imagePalette.rosterIcon}
                    testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.020" : undefined}
                    accessible={false}
                    accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.020" : undefined}
                  ></Image>
                  <Text allowFontScaling={false} style={{ fontFamily: CurrentTheme.fontFamily.bold, fontSize: 10, alignSelf: 'center', marginTop: Platform.OS === 'ios' ? -1 : -3 }}>ROSTER</Text>
                </TouchableOpacity>} */}

                {Constants.URL_PARAM.ShowPayslip && <TouchableOpacity
                  style={{ width: width / 5 }}
                  onPress={() => this.onPayslipView()}
                  testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.021" : undefined}
                  accessible={false}
                  accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.021" : undefined}
                >
                  <Image resizeMode="contain" style={[styles.imageStyle, { height: '50%', marginTop: 7, }]} source={CurrentTheme.imagePalette.payslipIcon}
                    testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.022" : undefined}
                    accessible={false}
                    accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.022" : undefined}
                  ></Image>
                  <Text allowFontScaling={false} style={{ fontFamily: CurrentTheme.fontFamily.bold, fontSize: 10, alignSelf: 'center', marginTop: Platform.OS === 'ios' ? -1 : -3 }}>PAYSLIP</Text>
                </TouchableOpacity>}

                <TouchableOpacity
                  style={{ width: Constants.URL_PARAM.ShowPayslip ? (width / 5) : (width / 4) }}
                  onPress={() => this.onMoreView()}
                  testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.023" : undefined}
                  accessible={false}
                  accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.023" : undefined}
                >
                  <Image resizeMode="contain" style={[styles.imageStyle, { height: '45%', marginTop: 10, }]} source={CurrentTheme.imagePalette.moreIcon}
                    testID={Platform.OS === 'ios' ? "com.rwgemployee.MessageDetails.024" : undefined}
                    accessible={false}
                    accessibilityLabel={Platform.OS === 'android' ? "com.rwgemployee.MessageDetails.024" : undefined}
                  ></Image>
                  <Text allowFontScaling={false} style={{ fontFamily: CurrentTheme.fontFamily.bold, fontSize: 10, alignSelf: 'center', marginTop: Platform.OS === 'ios' ? -1 : -3 }}>MORE</Text>
                </TouchableOpacity>

              </View>
            </View>
          </ViewWithLoader>
          <Progressbar ref="progressbar" />
          <Passwordinvalid ref='passwordinvalid' />
          <MoreView ref='moreview' />
        </React.Fragment>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  bottomBar: {
    flex: 1,
    position: 'absolute',
    //height: 60,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    height: viewHeight / 12,
    paddingTop: 2,
  },

  homeHeaderContainer: {
    width: '100%',
    zIndex: 1000,
    paddingTop: 10,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 10,
    backgroundColor: CurrentTheme.colorPalette.gentingWhite,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: StyleSheet.hairlineWidth,
    shadowOffset: {
      height: 2,
    },
  },

  headerText: {
    ...CurrentTheme.fontBook.h1Grey,
  },

  imageStyle: {
    width: '100%',
    height: '100%',
  },
});

MessageDetails.propTypes = {
  navigation: PropTypes.object.isRequired
};

MessageDetails.defaultProps = {
};


export default MessageDetails;