const express = require('express');
const mongoose = require('mongoose');
const Expenditure = require('../models/Expenditure');
const Transaction = require('../models/Transaction');
const auth = require('../auth');
const router = express.Router();

/**
 * @swagger
 * /purchases:
 *   get:
 *     tags:
 *       - Expenditure
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
    if (req.query.place) filter.place = new RegExp('.*' + req.query.place + '.*', 'i');
    if (req.query.date) filter.date = req.query.date;
    if (req.query.purpose) filter.purpose = req.query.purpose;
    if (req.query.createdBy) filter.createdBy = req.query.createdBy;
    // filter.transaction = { $exists: true, $ne: null };
    // filter.transaction = { 'transaction.method': 'PayTM' };
    Expenditure.paginate(filter, {
        // select: { 'transaction': { $exists: true, $ne: null } },
        sort: { createdDate: req.query.sortOrder },
        page: parseInt(req.query.page),
        limit: parseInt(req.query.limit),
        // populate: { path: 'transaction', match: { method: 'Google Pay' } }
        populate: { path: 'transaction', match: {} }
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
 * /expenditure:
 *   post:
 *     tags:
 *       - Expenditure
 *     description: Creates a new expenditure
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: expenditure
 *         description: Expenditure object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Expenditure'
 *     responses:
 *       201:
 *         description: Expenditure created successfully
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
    const expenditureId = new mongoose.Types.ObjectId();
    const _transaction = new Transaction({
        _id: new mongoose.Types.ObjectId(),
        ...req.body.transaction,
        ...medadata,
        sourceId: expenditureId
    });
    console.log('_transaction input ', _transaction);
    _transaction.save().then(result => {
        console.log('_transaction result', result);
        const _expenditures = new Expenditure({
            _id: expenditureId,
            ...medadata,
            transaction: result._id,
            purpose: req.body.purpose,
            place: req.body.place,
            date: req.body.date,
            description: req.body.description
        });
        console.log('_expenditures input ', _expenditures);
        _expenditures.save().then(result => {
            console.log('expenditures result', result);
            return resp.status(201).json({
                message: "Expenditure information saved successfully",
                result: result
            });
        }).catch(error => {
            console.log('expenditures error : ', error);
            // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
            return resp.status(500).json({
                error: error
            });
        });
    }).catch(error => {
        console.log('expenditure error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /expenditure/{id}:
 *   delete:
 *     tags:
 *       - Expenditure
 *     description: Deletes a single expenditure
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Expenditure's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE EXPENDITURE (Hard delete. This will delete the entire expenditure detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Expenditure.findByIdAndRemove(req.params.id).exec().then(expenditure => {
        return resp.status(200).json(expenditure);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

// Update expenditure
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
        const _expenditures = {
            _id: req.body._id,
            ...medadata,
            transaction: _transaction._id,
            purpose: req.body.purpose,
            place: req.body.place,
            date: req.body.date,
            description: req.body.description
        };
        console.log('_expenditures input ', _expenditures);
        Expenditure.findByIdAndUpdate(req.params.id, _expenditures).exec().then(result => {
            console.log('expenditures result', result);
            return resp.status(201).json({
                message: "Expenditure information updated successfully",
                result: result
            });
        }).catch(error => {
            console.log('expenditures error : ', error);
            // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
            return resp.status(500).json({
                error: error
            });
        });
    }).catch(error => {
        console.log('expenditure error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
