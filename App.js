import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import { IconButton } from 'react-native-paper'
import { GiftedChat, Send } from "react-native-gifted-chat";
import Tts from 'react-native-tts';

const BOT_USER = {
  _id: 2,
  name: 'BotMan',
  avatar: 'https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=BT&rounded=true'
};


const endpoint = "https://2f3a7809407b.ngrok.io";

class App extends Component{
  
  state = {
    messages: [
      {
        _id: 1,
        text: `Hi! I am the BotMan.\n\nWhat would you like me to do today?`,
        createdAt: new Date(),
        user: BOT_USER
      }
    ]
  };


  fetchmsg(message){

    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({"query":message});

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch(endpoint+"/send-msg", requestOptions)
      .then(response => response.json())
      .then(response => {
          console.log(response);
          this.handleResponse(response);
        })   
      .catch(error => console.log('error', error));
  
  }

  renderSend(props) {
    return (
      <Send {...props}>
        <View style={styles.sendingContainer}>
          <IconButton icon='send-circle' size={32} color='#6646ee' />
        </View>
      </Send>
    );
  }

  scrollToBottomComponent() {
    return (
      <View style={styles.bottomComponentContainer}>
        <IconButton icon='chevron-double-down' size={36} color='#6646ee' />
      </View>
    );
  }
  
  voiceInputComponent(){
    return(
      <View style={{borderWidth:2,height:20}}>
        <Text>Voice</Text>
      </View>
    )
  }

  renderLoading() {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#6646ee' />
      </View>
    );
  }

  handleResponse(result){
    let text = result.queryResult.fulfillmentMessages[0].text.text[0];
    // let payload = result.queryResult.webhookPayload;
    // this.showResponse(text,payload);
    this.showResponse(text);
  }

  showResponse(text,payload = {}){
    
    let msg = {
      _id:this.state.messages.length + 1,
      text,
      createdAt: new Date(),
      user: BOT_USER
    }

    if(payload && payload.is_image){
      msg.text = text;
      msg.image = payload.url;
    }

    this.setState(prevState => ({
      messages:GiftedChat.append(prevState.messages,[msg])
    }));
  }

  onSend(messages = []){
    let message = messages[0].text;
    if(message.trim()!=''){
      this.setState(previousState => ({
        messages:GiftedChat.append(previousState.messages,messages),
      }));
      console.log(message)
      this.fetchmsg(message);
    }
  }
  
  render(){
    return (
      <View style={styles.container}>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{ 
            _id: 1,
            name: 'User',
            avatar: 'https://ui-avatars.com/api/?color=000&name=Us&rounded=true' 
          }}
          placeholder='Type your message here...'
          showUserAvatar
          alwaysShowSend
          style={{padding:2}}
          scrollToBottom
          renderLoading={this.renderLoading}
          renderSend ={this.renderSend}
          scrollToBottomComponent={this.scrollToBottomComponent}
          voiceInputComponent={this.voiceInputComponent}
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  body: {
    backgroundColor: Colors.white,
  },
  container:{
    flex:1,
    marginBottom:2,
    //borderWidth:5
  },
  sendingContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomComponentContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default App;
