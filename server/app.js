
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Chatkit = require('@pusher/chatkit-server');
const resolve =  require("path").resolve;
const webpush = require("web-push");
require('dotenv').config({path:  resolve(__dirname, "../.env")})

const app = express(); // create an express app
const port = process.env.APP_PORT

// Initialises chatkit client
const chatkit = new Chatkit.default({
    instanceLocator: process.env.VUE_APP_CHATKIT_INSTANCE_LOCATOR,
    key: process.env.CHATKIT_SECRET_KEY
})

// Set webpush vapid keys
webpush.setVapidDetails(
    "mailto:test@test.com",
    process.env.VUE_APP_publicVapidKey,
    process.env.VUE_APP_privateVapidKey
);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    res.send({ hello: 'World!'});
});


app.get("/get_rooms", (req, res) => {
    chatkit
        .getRooms({})
        .then(rooms => {
            res.status(200).send({
                status: "success",
                data: rooms
            });
        })
        .catch(err => {
            res.status(200).send({
                status: "error",
                message: err
            });
        });
});

app.get("/users", (req, res) => {
    chatkit
        .getUsers({})
        .then(users => {
            res.status(200).send({
                status: "success",
                users: users
            });
        })
        .catch(err => {
            res.status(200).send({
                status: "error",
                message: err
            });
        });
});

app.post("/subscribe", (req, res) => {
    // Get pushSubscription object
    const subscription = req.body.subscription;
    const userId = req.body.userId
    const payload = { 
        title: "Chatkit Push Notification", 
        message: `@${userId}! You have successfully subscribed to receive notification`
    }
    
    // update the chatkit user with the user subscription object
    chatkit.updateUser({
        id: userId,
        customData: {
            subscription: subscription,
        },
    })
    // Send 201 - resource created
    res.status(201).json(payload);
    // Pass object into sendNotification
    webpush
        .sendNotification(subscription, JSON.stringify(payload))
        .catch(err => console.error(err));
});


app.post("/webhook", async (req, res) => {
    const messages = req.body.payload.messages;
    // get mentioned users in the message
    const mentionedUsers =  messages[0]['parts'][0]['content'].match(/\B@[^\s,]*/g)
    // Return response early - see https://pusher.com/docs/chatkit/webhooks#retry-strategy
    res.sendStatus(200);
    
      if (mentionedUsers) {
          const payload = {
            title: "Chatkit new mention",
            message: messages[0]['parts'][0]['content']
          }
  
          // Get the mentioned users data from Chatkit server
          const users = await chatkit.getUsersById({
            userIds: mentionedUsers.map(u => u.substr(1)),
          })
  
          users.forEach(user => {
            // for each mentioned users, send a notification to them
            webpush
              .sendNotification(user.custom_data.subscription, JSON.stringify(payload))
              .catch(err => console.error(err));
          });
      }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));