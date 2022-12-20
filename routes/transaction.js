var express = require('express');
var mongoose = require('mongoose');
const auth = require('../auth');
var router = express.Router();
var Transaction = require('../models/Transaction');
/**
 * @swagger
 * /transaction:
 *   get:
 *     tags:
 *       - Transaction
 *     description: Returns all transactions
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of transactions
 */
// GET transactions WITH filter, sorting & pagination
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
    Transaction.paginate(filter, {
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
 * /transaction/{id}:
 *   get:
 *     tags:
 *       - Transaction
 *     description: Returns a single transaction
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Transaction's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single transaction
 */

// GET SINGLE Transaction BY ID
router.get('/:id', auth, (req, resp, next) => {
    Transaction.findById(req.params.id).exec().then(transaction => {
        return resp.status(200).json(transaction);
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
 * /transaction:
 *   post:
 *     tags:
 *       - Transaction
 *     description: Creates a new transaction
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: transaction
 *         description: Transaction object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Transaction'
 *     responses:
 *       201:
 *         description: Transaction created successfully
 */
// SAVE Transaction
router.post('/', (req, resp, next) => {
    // First check if the transaction with name already exists.
    Transaction.findOne({ name: req.body.name, active: true }).exec()
        .then(transaction => {
            // If the transaction with name already exists, then return error
            if (transaction) {
                // 409 : Conflict. The request could not be completed because of a conflict.
                return resp.status(409).json({
                    message: "The transaction with name " + req.body.name + " already exist."
                });
            } else {
                // Since the transaction doesn't exist, then save the detail
                const _transaction = new Transaction({
                    _id: new mongoose.Types.ObjectId(),
                    ...req.body
                });
                _transaction.save()
                    .then(result => {
                        console.log(result);
                        return resp.status(201).json({
                            message: "Transaction added successfully",
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
* /transaction/{id}:
*   put:
*     tags:
*       - Transaction
*     description: Updates a single transaction
*     produces: application/json
*     parameters:
*       name: transaction
*       in: body
*       description: Fields for the Transaction resource
*       schema:
*         type: array
*         $ref: '#/definitions/Transaction'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE Transaction
router.put('/:id', auth, (req, resp, next) => {
    Transaction.findByIdAndUpdate(req.params.id, req.body).exec().then(transaction => {
        return resp.status(200).json(transaction);
    }).catch(error => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /transaction/{id}:
 *   delete:
 *     tags:
 *       - Transaction
 *     description: Deletes a single transaction
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Transaction's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE Transaction (Hard delete. This will delete the entire transaction detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Transaction.findByIdAndRemove(req.params.id).exec().then(transaction => {
        return resp.status(200).json(transaction);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
