
// Express
var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
// Models import
var User = require('../models/User');
// Router
var router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     description: login to application with email and password
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: credentials
 *         description: credentials include email & password
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: Successfully authenticated
 */
// USER LOGIN
router.post("/login", async (req, resp) => {
    // CHECK if the email & password matches with the password present in db
    User.findOne({ email: req.body.username, isActive: true }).populate('business').exec().then(async (user) => {
        // Compare the password to match with the password saved in db
        if (!user || !await user.comparePassword(req.body.password)) {
            // 401: Unauthorized. Authentication failed to due mismatch in credentials.
            throw ({
                STATUS_CODE: 404,
                message: 'Authentication failed. Your email address or password is incorrect!'
            });
        } else {
            // GENERATE jwt token with the expiry time
            const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_ACCESS_KEY, { expiresIn: "1d" });
            // TODO: Store the token and other detail in Authentication table
            return resp.status(201).json({
                user: user,
                token: token
            });
        }
    }).catch(error => {
        console.log('Login error :', error);
        resp.status(401).json({
            message: 'Authentication failed. Your email address or password is incorrect!'
        });
    });
});


// User login/signup with google/facebook
router.post("/login-with-social", async (req, resp) => {
    const validateToken = new Promise(async function (resolve, reject) {
        try {
            // Validate google auth tokenId with google
            const ticket = await client.verifyIdToken({
                idToken: req.body.token,
                audience: process.env.CLIENT_ID
            });
            const payload = ticket.getPayload();
            resolve(payload);
        } catch (error) {
            reject('Invalid token signature!');
        }
    });
    var authenticatedUser;
    validateToken.then(async () => {
        // Check if the email is already registered, if not, save user
        await User.findOne({ email: req.body.email, isActive: true }).exec().then(async (user) => {
            if (user) {
                authenticatedUser = user;
            } else {
                // If user doesn't exist, register user and then login
                try {
                    // if the provided token is valid, save user information and login user
                    const password = await bcrypt.hash(req.body.token, 10);
                    const _user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        name: req.body.name,
                        email: req.body.email,
                        photo: req.body.photo,
                        created_date: Date.now(),
                        updated_date: Date.now(),
                        password: password
                    });
                    await _user.save().then(registeredUser => {
                        authenticatedUser = {
                            _id: registeredUser._id,
                            name: registeredUser.name,
                            email: registeredUser.email,
                            photo: registeredUser.photo,
                            password: password
                        };
                    })
                } catch (error) {
                    throw error;
                }
            }
            return authenticatedUser;
        })
    }).then(() => {
        // GENERATE jwt token with the expiry time
        const token = jwt.sign({ email: authenticatedUser.email, id: authenticatedUser._id }, process.env.JWT_ACCESS_KEY, { expiresIn: "24h" });
        // TODO: Store the token and other detail in Authentication table
        resp.status(201).json({
            user: {
                id: authenticatedUser._id,
                email: authenticatedUser.email,
                name: authenticatedUser.name,
                devices: authenticatedUser.devices,
                photo: authenticatedUser.photo
            },
            token: token
        });
    }).catch(error => {
        console.log('Login error :', error);
        resp.status(401).json({
            message: 'Authentication failed. Your email address or password is incorrect!',
            error: error
        });
    });
});

module.exports = router;
