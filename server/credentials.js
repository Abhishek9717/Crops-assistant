require('dotenv').config();

let private_value = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');

const credentials = {
  client_email: process.env.CLIENT_EMAIL,
  private_key: private_value
}

module.exports = credentials;