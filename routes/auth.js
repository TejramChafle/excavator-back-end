
// Express
var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');
// Models import
var User = require('../models/User');
// Router
var router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
const auth = require('../auth');

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
    User.findOne({ email: req.body.username, isActive: true }).populate('devices').exec().then(async (user) => {
        // Compare the password to match with the password saved in db
        if (!user || !await user.comparePassword(req.body.password)) {
            // 401: Unauthorized. Authentication failed to due mismatch in credentials.
            throw ({
                STATUS_CODE: 404,
                message: 'Authentication failed. Your email address or password is incorrect!'
            });
        } else {
            // GENERATE jwt token with the expiry time
            const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_ACCESS_KEY, { expiresIn: "24h" });
            // TODO: Store the token and other detail in Authentication table
            return resp.status(201).json({
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    role: user.role,
                    designation: user.designation,
                    avatar: user.avatar
                },
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

// USER SIGNUP
router.post("/signup", async (req, resp) => {
    console.log({req});
    // CHECK if the email & password matches with the password present in db
    User.findOne({ email: req.body.email, isActive: true }).populate('user').exec()
        .then(async (user) => {
            console.log({user});
            // Throw error if user already exist with provided email address and active 
            if (user) {
                throw ({
                    STATUS_CODE: 409,
                    message: 'The provided email id is already in use!'
                });
            }
        })
        .then(async (error) => {
            console.log('error=>', error);
            // Since the user doesn't exist, then save the detail
            try {
                // if the provided token is valid, save user information and login user
                const password = await bcrypt.hash(req.body.password, 10);
                const _user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    email: req.body.email,
                    phone: req.body.phone,
                    role: req.body.role,
                    designation: req.body.designation,
                    avatar: req.body.avatar,
                    password: password
                });
                await _user.save().then(registeredUser => {
                    // reset password email 
                    const mailDetails = {
                        from: process.env.MAIL_ID,
                        to: req.body.email,
                        subject: "Registration successful with Excavator Application",
                        text: "Hi " + req.body.name + ",\nYou have been registered on Excavator Application\n\n"
                            + "Please find the authentication detail to login to Excavator Application:\n"
                            + "URL: https://ng-personal-manager.web.app\n"
                            + "Username: " + req.body.email + "\n"
                            + "Password: " + req.body.password + "\n\n"
                            + "If should you change your password, please use forgot password process using above mentioned email id used for username.\n"
                            + "For any queries, please feel free to write us. We would be happy to help you.\n"
                            + "Thank you.\n\nRegards, \nSupport Team\nExcavator Application\nhttps://https://ng-personal-manager.web.app\n"
                    };
                    console.log({mailDetails});
                    // Send registration successful mail
                    // sendMail(mailDetails);
                    return resp.status(201).json({
                        message: 'User account created successfully.',
                        user: registeredUser
                    });
                })
            } catch (error) {
                throw error;
            }
        })
        .catch(error => {
            console.log('SIGNUP_ERROR: ', error);
            resp.status(401).json({
                message: 'User registration failed.',
                error: error
            });
        });
});

// Send Mail function using Nodemailer 
async function sendMail(mailDetails) {
    // create reusable transporter object using the default SMTP transport
    let mailTransporter = nodemailer.createTransport({
        host: "gmail",
        auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PS
        },
    });
    // Sending Email 
    await mailTransporter.sendMail(mailDetails, ((err, response) => {
            if (err) {
                console.log("Failed to send an email with error : ", err);
            } else {
                console.log("Email sent successfully.", response);
            }
        })
    );
}


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

// GET users WITH filter, sorting & pagination
router.get('/users', (req, resp) => {

    let filter = {};
    filter.isActive = req.query.is_active || true;
    if (req.query.name) filter.name = new RegExp('.*' + req.query.name + '.*', 'i');
    if (req.query.phone) filter.phone = new RegExp('.*' + req.query.phone + '.*', 'i');
    if (req.query.email) filter.email = new RegExp('.*' + req.query.email + '.*', 'i');
    if (req.query.role) filter.role = new RegExp('.*' + req.query.role + '.*', 'i');
    if (req.query.designation) filter.designation = new RegExp('.*' + req.query.designation + '.*', 'i');
    console.log({filter, 'req.query': req.query});
    User.paginate(filter, {
            sort: { _id: req.query.sort_order },
            page: parseInt(req.query.page),
            limit: parseInt(req.query.limit)
            // populate: 'devices'
        }, (error, result) => {
        console.log({error, result});
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        if (error) return resp.status(500).json({
            error: error
        });
        return resp.status(200).json(result);
    });
});

module.exports = router;
