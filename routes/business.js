
const express = require('express');
const mongoose = require('mongoose');
const Business = require('../models/Business');
const router = express.Router();
const auth = require('../auth');
const User = require('../models/User');
const bcrypt = require('bcrypt');
require('../helper/handler');
require('../helper/mailer');

// Business SIGNUP
router.post("/register", async (req, resp) => {
    let registeredBusiness;
    // console.log({req});
    // CHECK if the email & password matches with the password present in db
    Business.findOne({ email: req.body.email }).exec().then(async (business) => {
        console.log({ business });
        // Throw error if business already exist with provided email address and active
        if (business && business.isActive) {
            throw ({
                STATUS_CODE: 409,
                message: 'The provided email id is already in use!'
            });
        }
        // Throw error if business already exist but not active
        if (business && !business.isActive) {
            throw ({
                STATUS_CODE: 409,
                message: 'One business is already registered with email address and inactive. Please contact administrator.'
            });
        }
    })
    // Register business (Since the business doesn't exist, then save the detail)
    .then(async () => {
        try {
            // if the provided token is valid, save business information and login business
            const _business = new Business({
                _id: new mongoose.Types.ObjectId(),
                ...req.body
            });
            await _business.save().then(result => {
                registeredBusiness = result;
            })
        } catch (error) {
            throw error;
        }
    })
    //  Create user account of owner end mail
    .then(async () => {
        try {
            const password = await bcrypt.hash(req.body.owner.phone, 10);
            const _user = new User({
                _id: new mongoose.Types.ObjectId(),
                ...req.body.owner,
                role: 'admin',
                designation: 'Owner',
                business: registeredBusiness._id,
                password: password
            });
            await _user.save().then(user => {
                // reset password email 
                const mailDetails = {
                    from: process.env.MAIL_ID,
                    to: req.body.email,
                    subject: "Registration successful with Excavator Application",
                    text: "Hi " + req.body.owner.name + ",\nYour business has registered with Excavator Application\n\n"
                        + "Please find the authentication detail to login to Excavator Application:\n"
                        + "URL: https://ng-excavator.web.app/\n"
                        + "Businessname: " + req.body.owner.email + "\n"
                        + "Password: " + req.body.owner.phone + "\n\n"
                        + "If should you change your password, please use forgot password process using above mentioned email id used for businessname.\n"
                        + "For any queries, please feel free to write us. We would be happy to help you.\n"
                        + "Thank you.\n\nRegards, \nSupport Team\nExcavator Application\nhttps://ng-excavator.web.app/\n"
                };
                // Send registration successful mail
                sendMail(mailDetails);
                return resp.status(201).json({
                    message: 'Business account created successfully.',
                    business: registeredBusiness
                });
            })
        } catch (error) {
            throw error;
        }
    })
    .catch(error => {
        console.log('SIGNUP_ERROR: ', error);
        resp.status(401).json({
            message: 'Business registration failed.',
            error: error
        });
    });
});

// GET the business detail for the provided business id
router.get('/:id', auth, (req, resp) => {
    Business.findOne({ _id: req.params.id }).exec() // .populate('owner')
        .then(async (business, error) => {
            // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
            if (error) return resp.status(500).json({
                error: error
            });
            return resp.status(200).json(business);
        });
});

/**
* @swagger
* /businesss/{id}:
*   put:
*     tags:
*       - Business
*     description: Updates a single business
*     produces: application/json
*     parameters:
*       name: business
*       in: body
*       description: Fields for the Business resource
*       schema:
*         type: array
*         $ref: '#/definitions/Business'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE Business
router.put('/:id', auth, async(req, resp, next) => {
    await Business.updateOne(
        { _id: req.body.id },
        {
            ...req.body // containts all the fields to update
        }).then(business => {
            return resp.status(200).json(business);
        }).catch(error => { errorHandler(error, req, resp, next); })
});

module.exports = router;
