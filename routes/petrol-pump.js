const express = require('express');
const mongoose = require('mongoose');
const PetrolPump = require('../models/PetrolPump');
const auth = require('../auth');
const router = express.Router();

/**
 * @swagger
 * /petrol-pump:
 *   get:
 *     tags:
 *       - PetrolPump
 *     description: Returns all tags
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of tags
 */
// GET tags (Only active) WITH filter & pagination
router.get('/', auth, (req, resp) => {
    let filter = {};
    filter.active = req.query.is_active || true;
    filter.business = req.query.businessId;
    if (req.query.name) filter.name = new RegExp('.*' + req.query.name + '.*', 'i');
    if (req.query.purpose) filter.purpose = new RegExp('.*' + req.query.purpose + '.*', 'i');
    if (req.query.createdBy) filter.createdBy = req.query.createdBy;
    if (req.query.updatedBy) filter.updatedBy = req.query.updatedBy;
    PetrolPump.paginate(filter, {
        sort: { _id: req.query.sortOrder },
        page: parseInt(req.query.page),
        limit: parseInt(req.query.limit),
        populate: [{ path: 'createdBy', match: {} }, { path: 'updatedBy', match: {} }]
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
 * /petrol-pump/{id}:
 *   get:
 *     tags:
 *       - PetrolPump
 *     description: Returns a single petrol pump
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: PetrolPump's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single petrol pump
 */

// GET SINGLE PETROL PUMP BY ID
router.get('/:id', auth, (req, resp, next) => {
    PetrolPump.findById(req.params.id).exec().then(tag => {
        return resp.status(200).json(tag);
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
 * /petrol-pump:
 *   post:
 *     tags:
 *       - PetrolPump
 *     description: Creates a new tag
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: petrol pump
 *         description: PetrolPump object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/PetrolPump'
 *     responses:
 *       201:
 *         description: PetrolPump created successfully
 */
// SAVE PETROL PUMP
router.post('/', auth, (req, resp, next) => {
    // console.log(req.body);
    const tag = new PetrolPump({
        _id: new mongoose.Types.ObjectId(),
        ...req.body
    });
    tag.save()
        .then(result => {
            console.log(result);
            return resp.status(201).json({
                message: "Petrol Pump created successfully",
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
* /petrol-pump/{id}:
*   put:
*     tags:
*       - PetrolPump
*     description: Updates a single petrol pump
*     produces: application/json
*     parameters:
*       name: petrol pump
*       in: body
*       description: Fields for the PetrolPump resource
*       schema:
*         type: array
*         $ref: '#/definitions/PetrolPump'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE PETROL PUMP
router.put('/:id', auth, (req, resp, next) => {
    PetrolPump.findByIdAndUpdate(req.params.id, req.body).exec().then(tag => {
        return resp.status(200).json(tag);
    }).catch(error => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /petrol-pump/{id}:
 *   delete:
 *     tags:
 *       - PetrolPump
 *     description: Deletes a single petrol pump
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: PetrolPump's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE PETROL PUMP (Hard delete. This will delete the entire tag detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    PetrolPump.findByIdAndRemove(req.params.id).exec().then(tag => {
        return resp.status(200).json(tag);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
