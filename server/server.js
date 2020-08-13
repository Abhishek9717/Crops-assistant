const express = require("express");
const bodyParser = require("body-parser");
const dialogflow = require('@google-cloud/dialogflow');
const cors = require("cors");
const axios = require("axios");
const uuid = require('uuid');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());

// A unique identifier for the given session
const sessionId = uuid.v4();
//projectId for given session
const projectId = 'crops-cjed'; 
// queries: A set of sequential queries to be send to Dialogflow agent for Intent Detection
const queryList = [
    'Reserve a meeting room in Toronto office, there will be 5 of us',
    'Next monday at 3pm for 1 hour, please', // Tell the bot when the meeting is taking place
    'B'  // Rooms are defined on the Dialogflow agent, default options are A, B, or C
  ]
// languageCode: Indicates the language Dialogflow agent should use to detect intents
const languageCode = 'hi';

app.listen(PORT, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Running on port ${PORT}`);
    }
});

app.get('/',(req,res)=>{
  res.send("Fun is to begin!!!");
})


//TO DO
/*
create intent api call

list all intent api call

delete an intent api call

*/

//send a single message
app.post('/send-msg',(req,res)=> {
    const query = req.body.query;
    let contexts;
    detectIntent(projectId,sessionId,query,contexts,languageCode).then(data =>{
        res.send(data);
    });
})

//send multiple queries
app.post('/send-multiple-msg',(req,res)=> {
  let queries = req.body.queries;
  //let queries = queryList;
  executeQueries(projectId, sessionId, queries, languageCode)
  .then(()=>{
    res.send("All queries processed");
  })
})

const sessionClient = new dialogflow.SessionsClient({
          keyFilename:"/home/abhishek/Desktop/chatbot/crops-cjed-9384268f8502.json"    
  });

async function detectIntent( projectId, sessionId, query, contexts, languageCode ) {
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath( projectId, sessionId );

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  if (contexts && contexts.length > 0) {
    request.queryParams = {
      contexts: contexts,
    };
  }

  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;
  
  // console.log(`  Query: ${result.queryText}`);
  // console.log(`  Response: ${result.fulfillmentText}`);
  // if (result.intent) {
  //   console.log(`  Intent: ${result.intent.displayName}`);
  // } else {
  //   console.log(`  No intent matched.`);
  // }
  
  return responses[0];
}

async function executeQueries(projectId, sessionId, queries, languageCode) {
  // Keeping the context across queries let's us simulate an ongoing conversation with the bot
  let context;
  let intentResponse;
  for (const query of queries) {
    try {
      console.log(`Sending Query: ${query}`);

      intentResponse = await detectIntent( projectId, sessionId, query,context, languageCode );
      
      console.log('Detected intent'); 
      console.log(
        `Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`
      );
      // Use the context from this response for next queries
      context = intentResponse.queryResult.outputContexts;
    } catch (error) {
      console.log(error);
    }
  }
}

