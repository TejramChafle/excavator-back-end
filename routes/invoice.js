const express     = require('express');
const mongoose    = require('mongoose');
const auth      = require('../auth');
const router      = express.Router();
const Invoice     = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const Work  = require('../models/Work');

/**
 * @swagger
 * /invoice:
 *   get:
 *     tags:
 *       - Invoice
 *     description: Returns all invoices
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of invoices
 */
// GET invoices WITH filter, sorting & pagination
router.get('/', auth, (req, resp) => {
    let filter = {};
    filter.active = req.query.is_active || true;
    if (req.query.description) filter.description = new RegExp('.*' + req.query.description + '.*', 'i');
    if (req.query.invoiceNumber) filter.invoiceNumber = req.query.invoiceNumber;
    if (req.query.invoiceDate) filter.date = new Date(+req.query.invoiceDate).setHours(0,0,0,0);
    if (req.query.status) filter.status = req.query.status;
    if (req.query.total) filter.invoicedAmount = req.query.total;
    if (req.query.customer) filter.invoiceTo = req.query.customer;
    filter.business = req.query.businessId;
    Invoice.paginate(filter, {
            sort: { _id: req.query.sort_order },
            page: parseInt(req.query.page),
            limit: parseInt(req.query.limit),
            populate: [
                { path: 'updatedBy', match: {} },
                { path: 'invoiceTo', match: {} }
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
 * /invoice/{id}:
 *   get:
 *     tags:
 *       - Invoice
 *     description: Returns a single invoice
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Invoice's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single invoice
 */

// GET SINGLE Invoice BY ID
router.get('/:id', auth, (req, resp, next) => {
    Invoice.findById(req.params.id)
    .populate('transaction')
    .populate('invoiceTo')
    .populate({path: 'works', populate: {
        path: 'service',
        model: 'Service'
    }})
    .exec().then(invoice => {
        return resp.status(200).json(invoice);
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
 * /invoice:
 *   post:
 *     tags:
 *       - Invoice
 *     description: Creates a new invoice
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: invoice
 *         description: Invoice object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Invoice'
 *     responses:
 *       201:
 *         description: Invoice created successfully
 */
// SAVE Invoice
router.post('/', (req, resp, next) => {
    // console.log('REQUEST: ', req);
    if (req.body._id === null) {
        delete req.body._id;
    }
    const transaction = new mongoose.Types.ObjectId();
    // Since the invoice doesn't exist, then save the detail
    const _invoice = new Invoice({
        _id: new mongoose.Types.ObjectId(),
        ...req.body,
        transaction
    });

    // Save the invoice first and then map transaction ID with it
    _invoice.save().then(invoice => {
        console.log({invoice});

        // Since the invoice doesn't exist, then save the detail
        const _transaction = new Transaction({
            _id: transaction,
            source: 'INVOICE',
            sourceId: invoice._id,
            amount: invoice.invoicedAmount,
            business: invoice.business,
            category: 'INCOME',
            createdBy: invoice.createdBy,
            updatedBy: invoice.updatedBy,
            date: invoice.date || new Date(),
            status: 'SCHEDULED',
            mode: 'CHEQUE'
        });
        
        // Update the work with invoice Ids
        updateWorksWithInvoiceIds(invoice);

        _transaction.save().then(transaction => {
            console.log({transaction});
            return resp.status(201).json({
                message: "Invoice added successfully",
                result: {
                    ...invoice,
                    transaction
                }
            });
        }).catch(error => {
            console.log('error : ', error);
            // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
            return resp.status(500).json({
                error: error
            });
        });
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
* /invoice/{id}:
*   put:
*     tags:
*       - Invoice
*     description: Updates a single invoice
*     produces: application/json
*     parameters:
*       name: invoice
*       in: body
*       description: Fields for the Invoice resource
*       schema:
*         type: array
*         $ref: '#/definitions/Invoice'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE Invoice
router.put('/:id', auth, (req, resp, next) => {
    Invoice.findByIdAndUpdate(req.params.id, req.body).exec().then(invoice => {
        return resp.status(200).json(invoice);
    }).catch(error => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /invoice/{id}:
 *   delete:
 *     tags:
 *       - Invoice
 *     description: Deletes a single invoice
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Invoice's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE Invoice (Hard delete. This will delete the entire invoice detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Invoice.findByIdAndRemove(req.params.id).exec().then(invoice => {
        return resp.status(200).json(invoice);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

function updateWorksWithInvoiceIds(invoice) {
    Work.updateMany(
        { _id: { $in: invoice.works } },
        { $set: { invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber } },
        { "multi": true }
    ).then((res) => {
        console.log('Work update response ', res);
    });
}

module.exports = router;
