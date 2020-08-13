const express = require("express");
const bodyParser = require("body-parser");
const dialogflow = require('@google-cloud/dialogflow');
const cors = require("cors");
const axios = require("axios");

const uuid = require('uuid');
// A unique identifier for the given session
const sessionId = uuid.v4();

//require("dotenv").config();
const app = express();

const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

app.listen(PORT, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Running on port ${PORT}`);
    }
});


//TO DO
/*
create intent api call

list all intent api call

delete an intent api call

fulfillment api 

webhook payload

*/






app.get('/',(req,res)=>{
  res.send("Fun is to begin!!!");
})



///new addn
app.post('/send-msg',(req,res)=> {
    
    runSample(req.body.MSG).then(data =>{
        res.send({Reply:data})
    })
})



async function runSample(msg,projectId = 'crops-cjed') {
  
    // Create a new session
    const sessionClient = new dialogflow.SessionsClient({
        keyFilename:"/home/abhishek/Desktop/chatbot/crops-cjed-9384268f8502.json"
    });
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
  
    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          // The query to send to the dialogflow agent
          text: msg,
          // The language used by the client
          languageCode: 'hi',
        },
      },
    };
  
    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log(`  No intent matched.`);
    }
    
    return result.fulfillmentText;
}



