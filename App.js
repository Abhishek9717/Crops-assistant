import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  
} from 'react-native';

import ChatScreen from './src/components/chatScreen'

const endpoint = "https://chatbot-server-me.herokuapp.com";

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
