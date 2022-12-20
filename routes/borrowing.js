const express = require('express');
const mongoose = require('mongoose');
const Borrowing = require('../models/Borrowing');
const Transaction = require('../models/Transaction');
const auth = require('../auth');
const router = express.Router();

/**
 * @swagger
 * /purchases:
 *   get:
 *     tags:
 *       - Borrowing
 *     description: Returns all purchases
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of purchases
 */
// GET PURCHASES (Only active) WITH filter & pagination
router.get('/', auth, (req, resp) => {
    let filter = {};
    filter.active = req.query.hasOwnProperty('active') ? req.query.active : true;
    filter.business = req.query.businessId;
    if (req.query.date) filter.date = req.query.date;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.purpose) filter.purpose = req.query.purpose;
    if (req.query.createdBy) filter.createdBy = req.query.createdBy;
    if (req.query.scheduledReturnDate) filter.scheduledReturnDate = req.query.scheduledReturnDate;
    // filter.transaction = { $exists: true, $ne: null };
    // filter.transaction = { 'transaction.method': 'PayTM' };
    Borrowing.paginate(filter, {
        // select: { 'transaction': { $exists: true, $ne: null } },
        sort: { createdDate: req.query.sortOrder },
        page: parseInt(req.query.page),
        limit: parseInt(req.query.limit),
        // populate: { path: 'transaction', match: { method: 'Google Pay' } }
        populate: [
            { path: 'transaction', match: {} },
            { path: 'person', match: {} }
        ]
    }, (error, result) => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        if (error) {
            return resp.status(500).json({
                error: error
            });
        }
        return resp.status(200).json(result);
    });
});

/**
 * @swagger
 * /borrowing:
 *   post:
 *     tags:
 *       - Borrowing
 *     description: Creates a new borrowing
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: borrowing
 *         description: Borrowing object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Borrowing'
 *     responses:
 *       201:
 *         description: Borrowing created successfully
 */
// SAVE EXPENDITURE
router.post('/', auth, (req, resp, next) => {
    console.log(req.body);
    // delete the _id if present in payload, since these ids are not required for creation
    if (req.body.hasOwnProperty('_id')) delete req.body._id;
    if (req.body.transaction.hasOwnProperty('_id')) delete req.body.transaction._id;
    const medadata = {
        createdBy: req.body.createdBy,
        updatedBy: req.body.updatedBy,
        business: req.body.business
    }
    const borrowingId = new mongoose.Types.ObjectId();
    const _transaction = new Transaction({
        _id: new mongoose.Types.ObjectId(),
        ...req.body.transaction,
        ...medadata,
        sourceId: borrowingId
    });
    console.log('_transaction input ', _transaction);
    _transaction.save().then(result => {
        console.log('_transaction result', result);
        const _borrowing = new Borrowing({
            _id: borrowingId,
            ...medadata,
            transaction: result._id,
            purpose: req.body.purpose,
            type: req.body.type,
            date: req.body.date,
            scheduledReturnDate: req.body.scheduledReturnDate,
            description: req.body.description,
            person: req.body.person
        });
        console.log('_borrowing input ', _borrowing);
        _borrowing.save().then(result => {
            console.log('borrowings result', result);
            return resp.status(201).json({
                message: "Borrowing information saved successfully",
                result: result
            });
        }).catch(error => {
            console.log('borrowings error : ', error);
            // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
            return resp.status(500).json({
                error: error
            });
        });
    }).catch(error => {
        console.log('borrowing error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /borrowing/{id}:
 *   delete:
 *     tags:
 *       - Borrowing
 *     description: Deletes a single borrowing
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Borrowing's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE EXPENDITURE (Hard delete. This will delete the entire borrowing detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Borrowing.findByIdAndRemove(req.params.id).exec().then(borrowing => {
        return resp.status(200).json(borrowing);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

// Update borrowing
router.put('/:id', auth, (req, resp, next) => {
    console.log(req.body);
    const medadata = {
        updatedBy: req.body.updatedBy,
        business: req.body.business
    }
    const _transaction = {
        ...req.body.transaction,
        ...medadata,
        sourceId: req.body._id
    };
    console.log('_transaction input ', _transaction);
    Transaction.findByIdAndUpdate(_transaction._id, _transaction).exec().then(result => {
        console.log('_transaction result', result);
        const _borrowing = {
            _id: req.body._id,
            ...medadata,
            transaction: _transaction._id,
            purpose: req.body.purpose,
            type: req.body.type,
            date: req.body.date,
            scheduledReturnDate: req.body.scheduledReturnDate,
            description: req.body.description
        };
        console.log('_borrowing input ', _borrowing);
        Borrowing.findByIdAndUpdate(req.params.id, _borrowing).exec().then(result => {
            console.log('borrowings result', result);
            return resp.status(201).json({
                message: "Borrowing information updated successfully",
                result: result
            });
        }).catch(error => {
            console.log('borrowings error : ', error);
            // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
            return resp.status(500).json({
                error: error
            });
        });
    }).catch(error => {
        console.log('borrowing error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
