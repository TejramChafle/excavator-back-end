var express = require('express');
var mongoose = require('mongoose');
var Contact = require('../models/Contact');
const auth = require('../auth');
var router = express.Router();


// GET CONTACTS (default active) WITH filter, sorting & pagination
router.get('/', auth, (req, resp) => {

    let filter = {};
    filter.isActive = req.query.hasOwnProperty('active') ? req.query.active : true;
    filter.business = req.query.businessId;
    if (req.query.contactType) filter.contactType = req.query.contactType;
    if (req.query.hasOwnProperty('isStarred')) filter.isStarred = req.query.isStarred;
    if (req.query.gender) filter.gender = req.query.gender;
    if (req.query.alternatePhone) filter.alternatePhone = new RegExp('.*' + req.query.alternatePhone + '.*', 'i');
    if (req.query.phone) filter.phone = new RegExp('.*' + req.query.phone + '.*', 'i');
    if (req.query.email) filter.email = new RegExp('.*' + req.query.email + '.*', 'i');
    if (req.query.company) filter.company = new RegExp('.*' + req.query.company + '.*', 'i');
    if (req.query.designation) filter.designation = new RegExp('.*' + req.query.designation + '.*', 'i');
    // Search the name in both first & last name
    if (req.query.name) {
        filter.$or = [
            { firstName: { $regex: req.query.name, $options: "i" } },
            { lastName: { $regex: req.query.name, $options: "i" } }
        ]
    }

    Contact.paginate(
        filter,
        {
            sort: { _id: req.query.sort_order },
            page: parseInt(req.query.page),
            limit: parseInt(req.query.limit)
            // populate: 'tag'
        }, (error, result) => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        if (error) return resp.status(500).json({
            error: error
        });
        return resp.status(200).json(result);
    });
});




// GET SINGLE CONTACT BY ID
router.get('/:id', auth, (req, resp) => {
    Contact.findById(req.params.id).exec().then(contact => {
        return resp.status(200).json(contact);
    }).catch(error => {
        console.log('error : ', error);
        // 204 : No content. There is no content to send for this request, but the headers may be useful.
        return resp.status(204).json({
            error: error
        });
    });
});



// SAVE CONTACT
router.post('/', auth, (req, resp) => {
    // First check if the conact with firstname, lastname and phone number already exists
    Contact.findOne({ firstName: req.body.firstName, lastName: req.body.lastName, phone: req.body.phone, is_active: true })
        .exec()
        .then(contact => {
            // If the contact with firstname, lastname and phone number already exists, then return error
            if (contact) {
                // 409 : Conflict. The request could not be completed because of a conflict.
                return resp.status(409).json({
                    message: 'The contact with name ' + req.body.firstName + ' ' + req.body.lastName + ' and phone number ' + req.body.phone + ' already exists!'
                });
            } else {
                // Since the contact doesn't exist, then save the detail
                console.log(req.body);
                let contact = new Contact(req.body);
                contact._id = new mongoose.Types.ObjectId();

                contact.save().then(result => {
                    console.log(result);
                    return resp.status(201).json({
                        message: 'Contact created successfully',
                        result: result
                    });
                }).catch(error => {
                    console.log('error : ', error);
                    // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
                    return resp.status(500).json(error);
                });
            }
        }).catch(error => {
            console.log('error : ', error);
            // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
            return resp.status(500).json(error);
        });
});



// UPDATE CONTACT
router.put('/:id', auth, (req, resp) => {
    Contact.findByIdAndUpdate(req.params.id, req.body).exec().then(contact => {
        return resp.status(200).json(contact);
    }).catch(error => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json(error);
    });
});



// DELETE CONTACT (Hard delete. This will delete the entire contact detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp) => {
    Contact.findByIdAndRemove(req.params.id).exec().then(contact => {
        return resp.status(200).json(contact);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
