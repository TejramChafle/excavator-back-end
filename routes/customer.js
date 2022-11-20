var express = require('express');
var mongoose = require('mongoose');
const auth = require('../auth');
var router = express.Router();
var Customer = require('../models/Customer');
/**
 * @swagger
 * /customer:
 *   get:
 *     tags:
 *       - Customer
 *     description: Returns all customers
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of customers
 */
// GET customers WITH filter, sorting & pagination
router.get('/', auth, (req, resp) => {
    let filter = {};
    // filter.active = req.query.hasOwnProperty('isActive') ? req.query.isActive : true;
    if (req.query.name) filter.name = new RegExp('.*' + req.query.name + '.*', 'i');
    if (req.query.place) filter.place = new RegExp('.*' + req.query.place + '.*', 'i');
    if (req.query.email) filter.email = new RegExp('.*' + req.query.email + '.*', 'i');
    if (req.query.phone) filter.phone = new RegExp('.*' + req.query.phone + '.*', 'i');
    if (req.query.owner) filter.owner = req.query.owner;
    filter.business = req.query.businessId;
    console.log({filter});
    Customer.paginate(filter, {
        sort: { _id: req.query.sort_order },
        page: parseInt(req.query.page),
        limit: parseInt(req.query.limit),
        populate: [
            { path: 'createdBy', match: {} },
            { path: 'updatedBy', match: {} },
            { path: 'owner', match: {} }
        ]
    }, (error, result) => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        if (error) return resp.status(500).json({
            error: error
        });
        return resp.status(200).json(result);
    });
});


/**
 * @swagger
 * /customer/{id}:
 *   get:
 *     tags:
 *       - Customer
 *     description: Returns a single customer
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Customer's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single customer
 */

// GET SINGLE Customer BY ID
router.get('/:id', auth, (req, resp, next) => {
    Customer.findById(req.params.id).exec().then(customer => {
        return resp.status(200).json(customer);
    }).catch(error => {
        console.log('error : ', error);
        // 204 : No content. There is no content to send for this request, but the headers may be useful.
        return resp.status(204).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /customer:
 *   post:
 *     tags:
 *       - Customer
 *     description: Creates a new customer
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: customer
 *         description: Customer object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Customer'
 *     responses:
 *       201:
 *         description: Customer created successfully
 */
// SAVE Customer
router.post('/', (req, resp, next) => {
    // First check if the customer with name already exists.
    Customer.findOne({ name: req.body.name, active: true }).exec()
        .then(customer => {
            // If the customer with name already exists, then return error
            if (customer) {
                // 409 : Conflict. The request could not be completed because of a conflict.
                return resp.status(409).json({
                    message: "The customer with name " + req.body.name + " already exist."
                });
            } else {
                // Since the customer doesn't exist, then save the detail
                const _customer = new Customer({
                    _id: new mongoose.Types.ObjectId(),
                    ...req.body
                });
                _customer.save()
                    .then(result => {
                        console.log(result);
                        return resp.status(201).json({
                            message: "Customer added successfully",
                            result: result
                        });
                    })
                    .catch(error => {
                        console.log('error : ', error);
                        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
                        return resp.status(500).json({
                            error: error
                        });
                    });
            }
        }).catch(error => {
            console.log('error : ', error);
            // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
            return resp.status(500).json({
                error: error
            });
        });
});

/**
* @swagger
* /customer/{id}:
*   put:
*     tags:
*       - Customer
*     description: Updates a single customer
*     produces: application/json
*     parameters:
*       name: customer
*       in: body
*       description: Fields for the Customer resource
*       schema:
*         type: array
*         $ref: '#/definitions/Customer'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE Customer
router.put('/:id', auth, (req, resp, next) => {
    Customer.findByIdAndUpdate(req.params.id, req.body).exec().then(customer => {
        return resp.status(200).json(customer);
    }).catch(error => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /customer/{id}:
 *   delete:
 *     tags:
 *       - Customer
 *     description: Deletes a single customer
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Customer's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE Customer (Hard delete. This will delete the entire customer detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Customer.findByIdAndRemove(req.params.id).exec().then(customer => {
        return resp.status(200).json(customer);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
