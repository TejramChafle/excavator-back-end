const express = require('express');
const mongoose = require('mongoose');
const Revenue = require('../models/Revenue');
const Transaction = require('../models/Transaction');
const auth = require('../auth');
const router = express.Router();

/**
 * @swagger
 * /purchases:
 *   get:
 *     tags:
 *       - Revenue
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
    if (req.query.source) filter.source = req.query.source;
    if (req.query.customer) filter.customer = req.query.customer;
    if (req.query.createdBy) filter.createdBy = req.query.createdBy;
    // filter.transaction = { $exists: true, $ne: null };
    // filter.transaction = { 'transaction.method': 'PayTM' };
    Revenue.paginate(filter, {
        // select: { 'transaction': { $exists: true, $ne: null } },
        sort: { createdDate: req.query.sortOrder },
        page: parseInt(req.query.page),
        limit: parseInt(req.query.limit),
        // populate: { path: 'transaction', match: { method: 'Google Pay' } }
        populate: [
            { path: 'transaction', match: {} },
            { path: 'customer', match: {} }
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
 * /revenue:
 *   post:
 *     tags:
 *       - Revenue
 *     description: Creates a new revenue
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: revenue
 *         description: Revenue object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Revenue'
 *     responses:
 *       201:
 *         description: Revenue created successfully
 */
// SAVE REVENUE
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
    const revenueId = new mongoose.Types.ObjectId();
    const _transaction = new Transaction({
        _id: new mongoose.Types.ObjectId(),
        ...req.body.transaction,
        ...medadata,
        sourceId: revenueId
    });
    console.log('_transaction input ', _transaction);
    _transaction.save().then(result => {
        console.log('_transaction result', result);
        const _revenue = new Revenue({
            _id: revenueId,
            ...medadata,
            transaction: result._id,
            source: req.body.source,
            customer: req.body.customer,
            date: req.body.date,
            description: req.body.description
        });
        console.log('_revenue input ', _revenue);
        _revenue.save().then(result => {
            console.log('revenues result', result);
            return resp.status(201).json({
                message: "Revenue information saved successfully",
                result: result
            });
        }).catch(error => {
            console.log('revenues error : ', error);
            // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
            return resp.status(500).json({
                error: error
            });
        });
    }).catch(error => {
        console.log('revenue error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /revenue/{id}:
 *   delete:
 *     tags:
 *       - Revenue
 *     description: Deletes a single revenue
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Revenue's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE REVENUE (Hard delete. This will delete the entire revenue detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Revenue.findByIdAndRemove(req.params.id).exec().then(revenue => {
        return resp.status(200).json(revenue);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

// Update revenue
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
        const _revenue = {
            _id: req.body._id,
            ...medadata,
            transaction: _transaction._id,
            source: req.body.source,
            customer: req.body.customer,
            date: req.body.date,
            description: req.body.description
        };
        console.log('_revenue input ', _revenue);
        Revenue.findByIdAndUpdate(req.params.id, _revenue).exec().then(result => {
            console.log('revenues result', result);
            return resp.status(201).json({
                message: "Revenue information updated successfully",
                result: result
            });
        }).catch(error => {
            console.log('revenues error : ', error);
            // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
            return resp.status(500).json({
                error: error
            });
        });
    }).catch(error => {
        console.log('revenue error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
