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

//const projectId = 'crops-cjed';
const displayName = 'Make resevation'; //name of the intent
const trainingPhrasesParts = ['How many people are staying','This is another guest']; ///Training Phrases
const messageTexts = ['Your reservation has been confirmed','Welcome back again'];//Message Texts for the agents response when intent is detected'

// const projectId = 'The Project ID to use, e.g. 'YOUR_GCP_ID';
// const displayName = 'The display name of the intent, e.g. 'MAKE_RESERVATION';
// const trainingPhrasesParts = 'Training phrases, e.g. 'How many people are staying?';
// const messageTexts = 'Message texts for the agent's response when the intent is detected, e.g. 'Your reservation has been confirmed';

// Instantiates the Intent Client
const intentsClient = new dialogflow.IntentsClient({
          keyFilename:"/home/abhishek/Downloads/my-key.json"    
  });

async function createIntent() {
  // Construct request

  // The path to identify the agent that owns the created intent.
  const agentPath = intentsClient.agentPath(projectId);

  const trainingPhrases = [];

  trainingPhrasesParts.forEach(trainingPhrasesPart => {
    const part = {
      text: trainingPhrasesPart,
    };

    // Here we create a new training phrase for each provided part.
    const trainingPhrase = {
      type: 'EXAMPLE',
      parts: [part],
    };

    trainingPhrases.push(trainingPhrase);
  });

  const messageText = {
    text: messageTexts,
  };

  const message = {
    text: messageText,
  };

  const intent = {
    displayName: displayName,
    trainingPhrases: trainingPhrases,
    messages: [message],
  };

  const createIntentRequest = {
    parent: agentPath,
    intent: intent,
  };

  // Create the intent
  // console.log(createIntentRequest)
  // console.log(intent)
  const [response] = await intentsClient.createIntent(createIntentRequest);
  console.log(`Intent ${response.name} created`);
}

//createIntent();




async function listIntents() {
  // Construct request

  // The path to identify the agent that owns the intents.
  const projectAgentPath = intentsClient.agentPath(projectId);

  console.log(projectAgentPath);

  const request = {
    parent: projectAgentPath,
  };

  // Send the request for listing intents.
  const [response] = await intentsClient.listIntents(request);
  console.log(response[0])
  response.forEach(intent => {
    console.log('====================');
    console.log(`Intent name: ${intent.name}`);
    console.log(`Intent display name: ${intent.displayName}`);
    console.log(`Action: ${intent.action}`);
    console.log(`Root folowup intent: ${intent.rootFollowupIntentName}`);
    console.log(`Parent followup intent: ${intent.parentFollowupIntentName}`);

    console.log('Input contexts:');
    intent.inputContextNames.forEach(inputContextName => {
      console.log(`\tName: ${inputContextName}`);
    });

    console.log('Output contexts:');
    intent.outputContexts.forEach(outputContext => {
      console.log(`\tName: ${outputContext.name}`);
    });
  });
}

//listIntents();


async function deleteIntent(projectId, intentId) {

  const intentPath = intentsClient.intentPath(projectId, intentId);

  const request = {name: intentPath};

  // Send the request for deleting the intent.
  const result = await intentsClient.deleteIntent(request);
  console.log(`Intent ${intentPath} deleted`);
  console.log(result)
  //return result;
}
const intentId = '61f01bd9-8180-472d-a3f2-5df85d67a352';
deleteIntent(projectId,intentId)