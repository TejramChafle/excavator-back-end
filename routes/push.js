const express = require('express');
const mongoose = require('mongoose');
const Device = require('../models/Device');
const User = require('../models/User');
const Event = require('../models/Event');
const auth = require('../auth');
const router = express.Router();

var admin = require('firebase-admin');

// Initialize Firebase admin
var serviceAccount = require('../assets/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ng-personal-manager.firebaseio.com"
});

/**
 * @swagger
 * /todo:
 *   post:
 *     tags:
 *       - Device
 *     description: Creates a new todo
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: todo
 *         description: Device object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Device'
 *     responses:
 *       201:
 *         description: Device information saved successfully
 */
// SAVE DEVICE
router.post('/save-device-information', auth, (req, resp) => {
    console.log(req.body);
    const device = new Device({
        _id: new mongoose.Types.ObjectId(),
        ...req.body,
        created_date: Date.now(),
        updated_date: Date.now()
    });

    device.save().then(result => {
        console.log('Device:', result);

        // Get the user detail
        User.findOne({ _id: req.body.user }).then((user) => {
            console.log(user);
            var devices = user.devices;
            if (Array.isArray(devices)) {
                devices.push(result._id);
                console.log('devices : ', devices);
            }
            User.findOneAndUpdate({ _id: req.body.user }, { devices: devices }).then((userdevicesresult) => {
                console.log('userdevicesresult : ', userdevicesresult);
                if (userdevicesresult) {
                    return resp.status(201).json({
                        message: "Device information saved successfully.",
                        user: {
                            id: userdevicesresult._id,
                            name: userdevicesresult.name,
                            email: userdevicesresult.email,
                            devices: userdevicesresult.devices
                        }
                    });
                }

            })
        });
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});



// Send notification for testing
router.post('/send-notification', auth, (req, resp) => {

    Device.find({ user: req.body.user }).exec().then((devices) => {
        console.log(devices);
        if (Array.isArray(devices)) {
            // devices.push(result._id);
            console.log('devices : ', devices);
            // sendNotificationOnDevice(devices);
            // sendNotificationOnMultipleDevices(devices);

            // -----------------------------------------------------------------------------------    
            // FIREBASE NOTIFICATION
            // -----------------------------------------------------------------------------------
            var serviceAccount = require('../assets/serviceAccountKey.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://ng-personal-manager.firebaseio.com"
            });

            var registrationTokens = [];
            // Filter out the registration tokens (firebase token) from list of registered devices
            devices.forEach((device) => {
                if (device.firebase_token) {
                    registrationTokens.push(device.firebase_token);
                }
            });

            console.log('registrationTokens : ', registrationTokens);

            var message = {
                data: {
                    score: '850',
                    time: '2:45'
                },
                notification: { title: 'Firebase notification!', body: 'Get 23% off on early use of the application. First 500 members will get this discoount for a year with all features and functionalities.' },
                android: {
                    notification: {
                        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Angular_one_color_inverse_logo.svg/1024px-Angular_one_color_inverse_logo.svg.png'
                    }
                },
                tokens: registrationTokens
            };

            // Send a message to the device corresponding to the provided registration token.
            // Use method admin.messaging().send() for single token
            // Use method admin.messaging().sendMulticast() for multiple tokens

            admin.messaging().sendMulticast(message)
                .then((response) => {
                    // Response is a message ID string.
                    console.log('Successfully sent message:', response);
                    return resp.status(201).json({
                        response: response
                    });
                })
                .catch((error) => {
                    console.log('Error sending message:', error);
                    // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
                    return resp.status(500).json({
                        error: error
                    });
                });
        }
    });
});


// Send the notifications to all the users
sendEventNotifications = () => {

    // We need to send the notification for the events that are scheduled between next 15 min to 30 min
    var curren_date = new Date();
    // Add 15 min to current date time
    const from_time = new Date(curren_date.setMinutes(curren_date.getMinutes() + 15));
    // Add 30 min to current date time
    const to_time = new Date(curren_date.setMinutes(curren_date.getMinutes() + 30));

    Event.find({start_time: {$gt: from_time, $lt: to_time }}).exec().then(async (events) => {
        if (Array.isArray(events)) {
            events.forEach((event) => {
                Device.find({user: event.created_by}).exec().then(async (devices) => {
                    // Send the notification of the event to the provided devices
                    sendNotifications({
                        devices: devices,
                        event: event
                    });
                });
            });
        }
    }).catch(error => {
        console.log('Unable to find events schedules after 15 min and before 30 min with error :', error);
    });
}


function sendNotifications(data) {
    // -----------------------------------------------------------------------------------    
    // FIREBASE NOTIFICATION
    // -----------------------------------------------------------------------------------

    var registrationTokens = [];
    // Filter out the registration tokens (firebase token) from list of registered devices
    data.devices.forEach((device) => {
        if (device.firebase_token) {
            registrationTokens.push(device.firebase_token);
        }
    });

    var message = {
        data: {
            event: JSON.stringify(data.event)
        },
        notification: { title: data.event.name, body: data.event.description },
        android: {
            notification: {
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Angular_one_color_inverse_logo.svg/1024px-Angular_one_color_inverse_logo.svg.png'
            }
        },
        tokens: registrationTokens
    };

    // Send a message to the device corresponding to the provided registration token.
    // Use method admin.messaging().send() for single token
    // Use method admin.messaging().sendMulticast() for multiple tokens
    admin.messaging().sendMulticast(message)
        .then((response) => {
            // Response is a message ID string.
            // console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Failed to send message via firebase push notification with error :', error);
        });
}



// Send the notifications to all the users
functionCalled = () => {
    console.log('push functionCalled');
}

// module.exports = sendEventNotifications;
module.exports = functionCalled;
// module.exports = router;
