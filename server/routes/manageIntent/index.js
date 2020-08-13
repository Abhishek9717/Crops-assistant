const express = require('express')
const router = express.Router();
const dialogflow = require('@google-cloud/dialogflow')

const projectId = 'crops-cjed';
// const displayName = 'Make reservation'; //name of the intent
// const trainingPhrasesParts = ['How many people are staying','This is another guest']; ///Training Phrases
// const messageTexts = ['Your reservation has been confirmed','Welcome back again'];//Message Texts for the agents response when intent is detected'

// Instantiates the Intent Client
const intentsClient = new dialogflow.IntentsClient({ keyFilename:"/home/abhishek/Downloads/my-key.json" });

router.post('/create-intent',(req,res)=>{
    let trainingPhrasesParts = req.body.trainingPhrases;
    let displayName = req.body.intentName;
    let messageTexts = req.body.responses;
    try{
      createIntent(displayName,trainingPhrasesParts,messageTexts)
      .then(response => res.send(`Intent ${response.name} created`));
    }
    catch(e){
      console.log('Error :',e);
      res.send(`Error in creating intent ${displayName}`)
    }
})

router.get('/list-all-intents',(req,res)=>{
  try{
    listIntents()
    .then(response => res.send(response));
  }
  catch(e){
    console.log('Error :',e);
    res.send(`Error in fetching intents`)
  }
})

router.delete('/delete-intent/:id',(req,res)=>{
    let intentId = req.query.params.id;
    try{
      deleteIntent(intentId)
      .then(response => res.send(response));
    }
    catch(e){
      console.log('Error :',e);
      res.send(`Error in deleting intent`)
    }

})


async function createIntent(displayName,trainingPhrasesParts,messageTexts) {
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
  return response;
}

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
  return response;
}

async function deleteIntent(intentId) {

  const intentPath = intentsClient.intentPath(projectId, intentId);

  const request = {name: intentPath};

  // Send the request for deleting the intent.
  const result = await intentsClient.deleteIntent(request);
  console.log(`Intent ${intentPath} deleted`);
  console.log(result)
  return `Intent deleted successfully`;
}

module.exports = router;