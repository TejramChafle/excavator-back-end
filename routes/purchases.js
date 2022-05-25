const express = require('express');
const mongoose = require('mongoose');
const Purchases = require('../models/Purchases');
const Expenditures = require('../models/Expenditure');
const Payments = require('../models/Payment');
const auth = require('../auth');
const router = express.Router();
const handler = require('../helper/handler');

/**
 * @swagger
 * /purchases:
 *   get:
 *     tags:
 *       - Purchases
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
    console.log('req.query', req.query);
    let filter = {};
    let expenditurefilter = {};
    filter.isActive = req.query.isActive || true;
    // if (req.query.place) filter.place = new RegExp('.*' + req.query.place + '.*', 'i');
    // if (req.query.date) filter.date = new Date(req.query.date);
    if (req.query.createdBy) filter.createdBy = req.query.createdBy;
    
    if (req.query.purpose) expenditurefilter.purpose = req.query.purpose;
    if (req.query.place) expenditurefilter.place = new RegExp('.*' + req.query.place + '.*', 'i');
    if (req.query.amount) expenditurefilter.amount = req.query.amount;
    if (req.query.date) expenditurefilter.date = new Date(req.query.date);

    if (Object.values(expenditurefilter).length) {
        filter.expenditure = { $exists: true, $ne: null};
    }

    console.log('expenditurefilter', expenditurefilter, "Object.values(expenditurefilter)", Object.values(expenditurefilter));
    Purchases.paginate(filter,{
        sort: { createdDate: req.query.sortOrder },
        page: parseInt(req.query.page),
        limit: parseInt(req.query.limit),
        populate: ({ path: 'expenditure', model: 'Expenditures', match: { ...expenditurefilter }, populate: { path: 'payment', model: 'Payments'} })
    },(error, result) => {
        // console.log('result', result);
        result.docs = result.docs.filter((doc) => doc.expenditure);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        if (error) {
            return resp.status(500).json({
                error: error
            });
        }
        return resp.status(200).json(result);
    });
});





// GET items from PURCHASES for the specified purpose (Only active) WITH filter & pagination
router.get('/browse', (req, resp) => {
    console.log('req.query from browse', req.query);
    let filter = {};
    // filter.isActive = req.query.isActive || true;

    if (req.query.createdBy) filter.createdBy = req.query.createdBy;
    if (req.query.purpose) filter.purpose = req.query.purpose;
    if (req.query.place) filter.place = req.query.place;

    console.log('filter', filter);

    if (Object.values(filter).length) {
        filter.expenditure = { $exists: true, $ne: null};
    }

    Purchases.paginate({ createdBy: filter.createdBy },{
        sort: { createdDate: req.query.sortOrder },
        page: parseInt(req.query.page),
        limit: parseInt(req.query.limit),
        populate: ({ path: 'expenditure', model: 'Expenditures', match: { purpose: filter.purpose }})
    },(error, result) => {
        console.log('result', result);
        let items = [];
        // filter the record for which the expentiture present
        result.docs = result.docs.filter(item => item.expenditure);
        console.log('result.docs', result.docs);
        result.docs.forEach((doc) => {
            console.log('Items: ', doc.items.map((item) => item.name));
            items = Array.from(new Set(items.concat(doc.items.map((item) => item.name))));
        });
        // Reset docs
        result.docs = items;
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
 * /purchases/{id}:
 *   get:
 *     tags:
 *       - Purchases
 *     description: Returns a single purchase
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Purchases's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single purchase
 */

// GET SINGLE PURCHASE BY ID
router.get('/:id', (req, resp, next) => {
    Purchases.findById(req.params.id).populate({ path: 'expenditure', populate: { path: 'payment', model: 'Payments'} }).exec().then(purchase => {
        return resp.status(200).json(purchase);
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
 * /purchases:
 *   post:
 *     tags:
 *       - Purchases
 *     description: Creates a new purchase
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: purchase
 *         description: Purchases object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Purchases'
 *     responses:
 *       201:
 *         description: Purchases created successfully
 */
// SAVE PURCHASE
 router.post('/', auth, async (req, resp, next) => {
    // Need add to expenditure first expenditure
    console.log(req.body);
    const items = req.body.items;
    delete req.body.items;
    const medadata = {
        createdBy: req.body.createdBy,
        createdDate: new Date(),
        updatedDate: new Date()
    }
    const expenditure = new Expenditures({
        _id: new mongoose.Types.ObjectId(),
        ...req.body
    });
    let savedExpenditure;
    await expenditure.save().then(result => {
        savedExpenditure = result; 
    }).catch(error => { errorHandler(error, req, resp, next);});
    
    const purchase = new Purchases({
        _id: new mongoose.Types.ObjectId(),
        expenditure: savedExpenditure._id,
        items,
        ...medadata,
    });
    purchase.save().then(result => {
        return resp.status(201).json({
            message: req.body.purpose + " information saved successfully",
            result: result
        });
    }).catch(error => { errorHandler(error, req, resp, next);});
});

/**
* @swagger
* /purchases/{id}:
*   put:
*     tags:
*       - Purchases
*     description: Updates a single purchase
*     produces: application/json
*     parameters:
*       name: purchase
*       in: body
*       description: Fields for the Purchases resource
*       schema:
*         type: array
*         $ref: '#/definitions/Purchases'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE PURCHASE
router.put('/:id', auth, async(req, resp, next) => {
    // console.log('req.body', req.body);
    let paymentInfo;
    // If payment information already exists, then skip payment update
    if (req.body.payment && req.body.payment._id) {
        paymentInfo = req.body.payment;
        delete req.body.payment;
    } else if (req.body.payment && !req.body.payment._id) {
          // SAVE PAYMENT if not available
        const payment = new Payments({
            _id: new mongoose.Types.ObjectId(),
            ...req.body.payment,
            createdDate: req.body.updatedDate,
            createdBy: req.body.createdBy
        });
        await payment.save().then(result => {
            paymentInfo = result;
        }).catch(error => { errorHandler(error, req, resp, next);});
    }
    
    let expenditureUpdateParams = {
        updatedDate: req.body.updatedDate,
        createdBy: req.body.createdBy,
        ...req.body.expenditure
    }
    if (paymentInfo) {
        expenditureUpdateParams.payment = paymentInfo._id;
    }

    // UPDATE Expenditure
    await Expenditures.updateOne(
        { _id: req.body.expenditure._id },
        {
            ...expenditureUpdateParams
        }).then(expenditure => {
            // return resp.status(200).json(expenditure);
        }).catch(error => { errorHandler(error, req, resp, next); })

    // UPDATE purchase
    await Purchases.updateOne(
        { _id: req.body.id },
        {
            items: req.body.items,
            expenditure: req.body.expenditure._id,
            updatedBy: req.body.updatedBy,
            updatedDate: req.body.updatedDate
        }).then(purchase => {
            return resp.status(200).json(purchase);
        }).catch(error => { errorHandler(error, req, resp, next); })
});


/**
 * @swagger
 * /purchases/{id}:
 *   delete:
 *     tags:
 *       - Purchases
 *     description: Deletes a single purchase
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Purchases's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE PURCHASE (Hard delete. This will delete the entire purchase detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Purchases.findByIdAndRemove(req.params.id).exec().then(purchase => {
        return resp.status(200).json(purchase);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
