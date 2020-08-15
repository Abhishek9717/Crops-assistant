import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableHighlight,
  Dimensions,
} from 'react-native';

import ChatScreen from './src/components/chatScreen'

const endpoint = "http://b9be143bdc86.ngrok.io";

class App extends Component{
  
  render(){
    return(
      <View style={styles.container}>
        <ChatScreen endpoint={endpoint}></ChatScreen>
      </View>
    )
  }
  
};

const styles = StyleSheet.create({
  container:{
    flex:1,
    marginBottom:2,
    //borderWidth:5
  }
});

export default App;