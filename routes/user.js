
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();
const auth = require('../auth');
require('../helper/handler');
require('../helper/mailer');

// USER SIGNUP
router.post("/signup", async (req, resp) => {
    // console.log({req});
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
                    businessId: req.body.businessId,
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
                            + "URL: https://ng-excavator.web.app/\n"
                            + "Username: " + req.body.email + "\n"
                            + "Password: " + req.body.password + "\n\n"
                            + "If should you change your password, please use forgot password process using above mentioned email id used for username.\n"
                            + "For any queries, please feel free to write us. We would be happy to help you.\n"
                            + "Thank you.\n\nRegards, \nSupport Team\nExcavator Application\nhttps://ng-excavator.web.app/\n"
                    };
                    console.log({mailDetails});
                    // Send registration successful mail
                    sendMail(mailDetails);
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

// GET users WITH filter, sorting & pagination
router.get('/users', (req, resp) => {
    let filter = {};
    // filter.isActive = req.query.is_active || true;
    filter.business = req.query.businessId;
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
        // console.log({error, result});
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        if (error) return resp.status(500).json({
            error: error
        });
        return resp.status(200).json(result);
    });
});

/**
* @swagger
* /users/{id}:
*   put:
*     tags:
*       - Users
*     description: Updates a single user
*     produces: application/json
*     parameters:
*       name: user
*       in: body
*       description: Fields for the Users resource
*       schema:
*         type: array
*         $ref: '#/definitions/Users'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE USER
router.put('user/:id', auth, async(req, resp, next) => {
    console.log('req.body', req.body);
    // UPDATE user
    await User.updateOne(
        { _id: req.body.id },
        {
            items: req.body.items,
            expenditure: req.body.expenditure._id,
            updatedBy: req.body.updatedBy,
            updatedDate: req.body.updatedDate
        }).then(user => {
            return resp.status(200).json(user);
        }).catch(error => { errorHandler(error, req, resp, next); })
});

module.exports = router;
