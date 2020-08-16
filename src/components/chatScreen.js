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

import NavigationBar from "react-native-navbar";
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { IconButton } from 'react-native-paper';
import Icon from "react-native-vector-icons/Ionicons";
import { GiftedChat, Send } from "react-native-gifted-chat";
import Tts from 'react-native-tts';
import Voice from '@react-native-community/voice';

const BOT_USER = {
  _id: 2,
  name: 'BotMan',
  avatar: 'https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=BT&rounded=true'
};

const END_USER = {
  _id: 1,
  name: 'RandomUser',
  avatar:'https://placeimg.com/140/140/any'
}



class ChatScreen extends Component{
  
  state = {
    //text to speech part
    voices: [],
    ttsStatus: "initiliazing",
    selectedVoice: null,
    speechRate: 0.5,
    speechPitch: 1,
    text: "स्वागत है| मैं आपकी क्या सहायता कर सकती हूँ?",
    messages: [
      {
        _id: 1,
        text: `स्वागत है| मैं आपकी क्या सहायता कर सकती हूँ?`,
        createdAt: new Date(),
        user: BOT_USER
      }
    ]
  };

  constructor(props) {
    super(props);
    Tts.addEventListener("tts-start", event =>
      this.setState({ ttsStatus: "started" })
    );
    Tts.addEventListener("tts-finish", event =>
      this.setState({ ttsStatus: "finished" })
    );
    Tts.addEventListener("tts-cancel", event =>
      this.setState({ ttsStatus: "cancelled" })
    );
    Tts.setDefaultRate(this.state.speechRate);
    Tts.setDefaultPitch(this.state.speechPitch);
    Tts.getInitStatus().then(this.initTts);
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechRecognized = this.onSpeechRecognized;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;
  }
  componentWillUnmount() {
    Voice.destroy().then(Voice.removeAllListeners);
  }

  onSpeechStart = (e) => {
    console.log('onSpeechStart: ', e);
    this.setState({
      started: '√',
    });
  };

  onSpeechRecognized = (e) => {
    console.log('onSpeechRecognized: ', e);
    this.setState({
      recognized: '√',
    });
  };

  onSpeechEnd = (e) => {
    console.log('onSpeechEnd: ', e);
    this.setState({
      end: '√',
      startAudio:false,
    });
  };

  onSpeechError = (e) => {
    console.log('onSpeechError: ', e);
    this.setState({
      startAudio: false,
      error: JSON.stringify(e.error),
    });
  };

  onSpeechResults = (e) => {
    console.log('onSpeechResults: ', e);
    let { error = true } = this.state;
    let results = e.value.length ? e.value : [];

    if(error == false && results.length > 0){
      let result = results[results.length  - 1]; 
      console.log(result)
      let msg = {
        _id:this.state.messages.length + 1,
        text:result,
        createdAt: new Date(),
        user: END_USER
      }
      this.setState(prevState => ({
        results: e.value,
        messages:GiftedChat.append(prevState.messages,[msg])
      }),()=>this.fetchmsg(result));
    }
    this.setState({
      results: e.value,
    });
  };

  onSpeechPartialResults = (e) => {
    console.log('onSpeechPartialResults: ', e);
    this.setState({
      partialResults: e.value,
    });
  };

  onSpeechVolumeChanged = (e) => {
    console.log('onSpeechVolumeChanged: ', e);
    this.setState({
      pitch: e.value,
    });
  };

  _startRecognizing = async () => {
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: '',
      results: [],
      partialResults: [],
      end: '',
      startAudio: true,
    });

    try {
      await Voice.start('hi');
    } catch (e) {
      console.error(e);
    }
  };

  _stopRecognizing = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };

  _cancelRecognizing = async () => {
    try {
      await Voice.cancel();
    } catch (e) {
      console.error(e);
    }
  };

  _destroyRecognizer = async () => {
    try {
      await Voice.destroy();
    } catch (e) {
      console.error(e);
    }
    this.setState({
      recognized: '',
      pitch: '',
      error: '',
      started: '',
      results: [],
      partialResults: [],
      end: '',
      startAudio: false,
    });
  };


  //male hindi voice - {"id": "hi-in-x-hie-local", "language": "hi-IN", "name": "hi-in-x-hie-local"}
  //female hindi voice -   {"id": "hi-in-x-hic-local", "language": "hi-IN", "name": "hi-in-x-hic-local"}
  
  initTts = async () => {
    const voices = await Tts.voices();
    const availableVoices = voices
      .filter(v => !v.networkConnectionRequired && !v.notInstalled)
      .map(v => {
        return { id: v.id, name: v.name, language: v.language };
      });
    let selectedVoice = null;
    if (voices && voices.length > 0) {
      selectedVoice = voices[0].id;
      try {
        //await Tts.setDefaultLanguage(voices[0].language);
        await Tts.setDefaultLanguage('hi-IN');
      } catch (err) {
        // error: "Language is not supported by device"
        console.log(`setDefaultLanguage error `, err);
      }
      //await Tts.setDefaultVoice(voices[0].id);
      await Tts.setDefaultVoice('hi-in-x-hic-local');
      this.setState({
        voices: availableVoices,
        selectedVoice,
        ttsStatus: "initialized"
      });
    } else {
      this.setState({ ttsStatus: "initialized" });
    }
  };

  readText = async () => {
    Tts.stop();
    Tts.speak(this.state.text);
  };

  handleAudio(){
    this._startRecognizing();
  }
  
  componentDidMount(){
    this.readText();
  }

  fetchmsg(message){
    const { endpoint } = this.props;
    console.log(endpoint)
    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({"query":message});

    const requestOptions = {
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
        <IconButton icon='chevron-double-down' size={20} color='#6646ee' />
      </View>
    );
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
      text:text,
      messages:GiftedChat.append(prevState.messages,[msg])
    }),() => this.readText());
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
    const title="Chat ";
    const { startAudio  } = this.state;  
    return (
      <View style={styles.container}>
        <NavigationBar
          title={{ title:title}}
          style ={{backgroundColor:"skyblue", fontWeight:1}}
          //rightButton={rightButtonConfig}
        />
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={END_USER}
          placeholder='अपना संदेश लिखें.....'
          showUserAvatar
          alwaysShowSend
          scrollToBottom
          renderLoading={this.renderLoading}
          renderSend ={this.renderSend}
          scrollToBottomComponent={this.scrollToBottomComponent}
          renderActions={() => {
            return (
              <TouchableHighlight onPress={this._startRecognizing}>
                <View style={styles.button}>
                  <Icon
                    color={ startAudio ? "red" : "black" }
                      name="ios-mic"
                      size={25}
                      type="Ionicons"
                      style={{alignItems:'center',justifyContent:'center',marginVertical:6}}
                      //onPress={this._startRecognizing}
                  />
                </View>
              </TouchableHighlight>
            );
            }
          }
        />
        <KeyboardAvoidingView />
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
  button: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    marginLeft:5,
    paddingHorizontal: 6,
    borderRadius:30,
  },
  sendingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    //borderWidth:5,
    //borderColor:'#0000',
  },
  bottomComponentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    //borderWidth:5,
    //borderColor:'#0000',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default ChatScreen;