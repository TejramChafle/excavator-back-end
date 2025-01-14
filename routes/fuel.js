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
            { path: 'petrolPump', match: {} },
            { path: 'employee', match: {} },
            { path: 'vehicle', match: {} }
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
// SAVE FUEL LOG
router.post('/', auth, async (req, resp) => {

    try {
        // delete the _id if present in payload
        delete req.body._id;
        if (req.body.transaction && req.body.transaction._id) {
            delete req.body.transaction._id;
        }
        
        // Metadata for audit information
        const medadata = {
            createdBy: req.body.createdBy,
            updatedBy: req.body.updatedBy,
            business: req.body.business
        };
        
        console.log('Saving fuel log', req.body);

        // Create a new transaction
        const fuelId = new mongoose.Types.ObjectId();
        const transactionData = new Transaction({
            _id: new mongoose.Types.ObjectId(),
            ...req.body.transaction,
            ...medadata,
            sourceId: fuelId,
            source: 'FUEL_LOG',
            category: 'SPENDING',
            mode: req.body.paymentMode || 'RTGS',
            amount: req.body.total,
            date: new Date(),
            status: req.body.paymentStatus || 'UNPAID'
        });
        
        console.log('transactionData ', transactionData);
        
        const _transaction = new Transaction(transactionData);
        const savedTransaction = await _transaction.save();
        console.log('Transaction saved', savedTransaction);

        // Create a new fuel log
        const fuelData = {
            _id: fuelId,
            ...medadata,
            transaction: savedTransaction._id,
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

        console.log('_fuel input ', fuelData);
        const _fuel = new Fuel(fuelData);
        const savedFuel = await _fuel.save();
        console.log('Fuel log saved: ', savedFuel);

        // Success response
        return resp.status(201).json({
            message: "Fuel log saved successfully",
            result: savedFuel
        });
    } catch (error) {
        console.error('Error saving fuel log:', error);
        return resp.status(500).json({
            message: "An error occurred while saving fuel log",
            error: error
        });
    }

    /* _transaction.save().then(result => {
        console.log('_transaction result', result);
        const _fuel = new Fuel();
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
    }); */
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
