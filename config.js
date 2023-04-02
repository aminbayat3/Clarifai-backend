const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    dbUrl : process.env.DB_URL,
    port : process.env.PORT
};

// module.exports = {
//     endpoint: process.env.API_URL,
//     masterKey: process.env.API_KEY,
//     port: process.env.PORT
//   };