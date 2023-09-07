const express = require('express');
const mongoose = require('mongoose');
const Fuel = require('../models/FuelLog');
const Transaction = require('../models/Transaction');
const auth = require('../auth');
const router = express.Router();

/**
 * @swagger
 * /purchases:
 *   get:
 *     tags:
 *       - Fuel
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
    if (req.query.fuel) filter.fuel = req.query.fuel;
    if (req.query.petrolPump) filter.petrolPump = req.query.petrolPump;
    if (req.query.invoiceId) filter.invoiceId = req.query.invoiceId;
    // filter.transaction = { $exists: true, $ne: null };
    // filter.transaction = { 'transaction.method': 'PayTM' };
    Fuel.paginate(filter, {
        // select: { 'transaction': { $exists: true, $ne: null } },
        sort: { createdDate: req.query.sortOrder },
        page: parseInt(req.query.page),
        limit: parseInt(req.query.limit),
        // populate: { path: 'transaction', match: { method: 'Google Pay' } }
        populate: [
            { path: 'transaction', match: {} },
            { path: 'petrolPump', match: {} }
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
 * /fuel:
 *   post:
 *     tags:
 *       - Fuel
 *     description: Creates a new fuel
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: fuel
 *         description: Fuel object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Fuel'
 *     responses:
 *       201:
 *         description: Fuel created successfully
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
    const fuelId = new mongoose.Types.ObjectId();
    const _transaction = new Transaction({
        _id: new mongoose.Types.ObjectId(),
        ...req.body.transaction,
        ...medadata,
        sourceId: fuelId
    });
    console.log('_transaction input ', _transaction);
    _transaction.save().then(result => {
        console.log('_transaction result', result);
        const _fuel = new Fuel({
            _id: fuelId,
            ...medadata,
            transaction: result._id,
            fuel: req.body.fuel,
            petrolPump: req.body.petrolPump,
            date: req.body.date,
            rate: req.body.rate,
            volume: req.body.volume,
            total: req.body.total,
            vehicle: req.body.vehicle,
            employee: req.body.employee,
            invoiceId: req.body.invoiceId
        });
        console.log('_fuel input ', _fuel);
        _fuel.save().then(result => {
            console.log('fuels result', result);
            return resp.status(201).json({
                message: "Fuel information saved successfully",
                result: result
            });
        }).catch(error => {
            console.log('fuels error : ', error);
            // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
            return resp.status(500).json({
                error: error
            });
        });
    }).catch(error => {
        console.log('fuel error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /fuel/{id}:
 *   delete:
 *     tags:
 *       - Fuel
 *     description: Deletes a single fuel
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Fuel's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE REVENUE (Hard delete. This will delete the entire fuel detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Fuel.findByIdAndRemove(req.params.id).exec().then(fuel => {
        return resp.status(200).json(fuel);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

// Update fuel
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
        const _fuel = {
            _id: req.body._id,
            ...medadata,
            transaction: _transaction._id,
            fuel: req.body.fuel,
            petrolPump: req.body.petrolPump,
            date: req.body.date,
            rate: req.body.rate,
            volume: req.body.volume,
            total: req.body.total,
            vehicle: req.body.vehicle,
            employee: req.body.employee,
            invoiceId: req.body.invoiceId
        };
        console.log('_fuel input ', _fuel);
        Fuel.findByIdAndUpdate(req.params.id, _fuel).exec().then(result => {
            console.log('fuels result', result);
            return resp.status(201).json({
                message: "Fuel information updated successfully",
                result: result
            });
        }).catch(error => {
            console.log('fuels error : ', error);
            // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
            return resp.status(500).json({
                error: error
            });
        });
    }).catch(error => {
        console.log('fuel error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
