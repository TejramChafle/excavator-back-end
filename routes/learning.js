var express     = require('express');
var mongoose    = require('mongoose');
var Maintenance = require('../models/Maintenance');
const auth      = require('../auth');

var router      = express.Router();

/**
 * @swagger
 * /maintenance:
 *   get:
 *     tags:
 *       - Maintenance
 *     description: Returns all maintenance
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of maintenance
 */
// GET MAINTENANCE list (Only active) WITH filter & pagination
router.get('/', auth, (req, resp) => {
    Maintenance.where({ is_active: true }).exec().then(maintenance => {
        return resp.status(200).json(maintenance);
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
 * /maintenance/{id}:
 *   get:
 *     tags:
 *       - Maintenance
 *     description: Returns a single maintenance
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Maintenance's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single maintenance
 */
// GET SINGLE MAINTENANCE BY ID
router.get('/:id', auth, (req, resp, next) => {
    Maintenance.findById(req.params.id).exec().then(maintenance => {
        return resp.status(200).json(maintenance);
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
 * /maintenance:
 *   post:
 *     tags:
 *       - Maintenance
 *     description: Creates a new maintenance
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: maintenance
 *         description: Maintenance object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Maintenance'
 *     responses:
 *       201:
 *         description: Maintenance created successfully
 */
// SAVE MAINTENANCE
router.post('/', auth, (req, resp, next) => {
    console.log(req.body);
    const maintenance = new Maintenance({
        _id: new mongoose.Types.ObjectId(),
        type: req.body.type,
        date: req.body.date,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        persons_involved: req.body.persons_involved,
        equipment_removed: req.body.equipment_removed,
        equipment_installed: req.body.equipment_installed,
        bill_amount: req.body.bill_amount,
        bill_number: req.body.bill_number,
        is_paid: req.body.is_paid,
        description: req.body.description,
        created_by: req.body.created_by,
        updated_by: req.body.updated_by,
        created_date: Date.now(),
        updated_date: Date.now()
    });

    maintenance.save().then(result => {
        console.log(result);
        return resp.status(201).json({
            message: "Maintenance created successfully",
            result: result
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
* /maintenance/{id}:
*   put:
*     tags:
*       - Maintenance
*     description: Updates a single maintenance
*     produces: application/json
*     parameters:
*       name: maintenance
*       in: body
*       description: Fields for the Maintenance resource
*       schema:
*         type: array
*         $ref: '#/definitions/Maintenance'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE MAINTENANCE
router.put('/:id', auth, (req, resp, next) => {
    Maintenance.findByIdAndUpdate(req.params.id, req.body).exec().then(maintenance => {
        return resp.status(200).json(maintenance);
    }).catch(error => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /maintenance/{id}:
 *   delete:
 *     tags:
 *       - Maintenance
 *     description: Deletes a single maintenance
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Maintenance's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE MAINTENANCE (Hard delete. This will delete the entire maintenance detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Maintenance.findByIdAndRemove(req.params.id).exec().then(maintenance => {
        return resp.status(200).json(maintenance);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
