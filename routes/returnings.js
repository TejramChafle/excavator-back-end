const express = require('express');
const mongoose = require('mongoose');
const Returning = require('../models/Returnings');
const auth = require('../auth');
const router = express.Router();

/**
 * @swagger
 * /returning:
 *   get:
 *     tags:
 *       - Returning
 *     description: Returns all returnings
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of returnings
 */
// GET returnings (Only active) WITH filter & pagination
router.get('/', auth, (req, resp) => {
    // console.log('req.query', req.query);
    let filter = {};
    if (req.query.place) filter.place = new RegExp('.*' + req.query.place + '.*', 'i');
    if (req.query.date) filter.date = req.query.date;
    if (req.query.created_by) filter.createdBy = req.query.createdBy;
    // console.log({filter});
    Returning.paginate(filter, {
        sort: { createdDate: req.query.sortOrder },
        page: parseInt(req.query.page),
        limit: parseInt(req.query.limit)
    }, (error, result) => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        // console.log('result', result);
        if (error) {
            // console.log('error', error);
            return resp.status(500).json({
                error: error
            });
        }
        return resp.status(200).json(result);
    });
});


/**
 * @swagger
 * /returning/{id}:
 *   get:
 *     tags:
 *       - Returning
 *     description: Returns a single returning
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Returning's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single returning
 */

// GET SINGLE returning BY ID
router.get('/:id', auth, (req, resp, next) => {
    Returning.findById(req.params.id).exec().then(returning => {
        return resp.status(200).json(returning);
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
 * /returning:
 *   post:
 *     tags:
 *       - Returning
 *     description: Creates a new returning
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: returning
 *         description: Returning object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Returning'
 *     responses:
 *       201:
 *         description: Returning created successfully
 */
// SAVE returning
router.post('/', auth, (req, resp, next) => {
    console.log(req.body);
    const returning = new Returning({
        _id: new mongoose.Types.ObjectId(),
        amount: req.body.amount,
        date: req.body.date,
        expectedReturnDate: req.body.expectedReturnDate,
        paymentMethod: req.body.paymentMethod,
        person: req.body.person,
        purpose: req.body.purpose,
        type: req.body.type,
        created_by: req.body.createdBy,
        updated_by: req.body.createdBy,
        created_date: req.body.createdDate,
        updated_date: req.body.createdDate
    });
    returning.save()
    .then(result => {
        console.log(result);
        return resp.status(201).json({
            message: "Returning created successfully",
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
});

/**
* @swagger
* /returning/{id}:
*   put:
*     tags:
*       - Returning
*     description: Updates a single returning
*     produces: application/json
*     parameters:
*       name: returning
*       in: body
*       description: Fields for the Returning resource
*       schema:
*         type: array
*         $ref: '#/definitions/Returning'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE returning
router.put('/:id', auth, (req, resp, next) => {
    Returning.findByIdAndUpdate(req.params.id, req.body).exec().then(returning => {
        return resp.status(200).json(returning);
    }).catch(error => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /returning/{id}:
 *   delete:
 *     tags:
 *       - Returning
 *     description: Deletes a single returning
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Returning's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE returning (Hard delete. This will delete the entire returning detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Returning.findByIdAndRemove(req.params.id).exec().then(returning => {
        return resp.status(200).json(returning);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
