const express = require('express');
const mongoose = require('mongoose');
const Timesheet = require('../models/Timesheet');
const auth = require('../auth');
const router = express.Router();

/**
 * @swagger
 * /timesheets:
 *   get:
 *     tags:
 *       - timesheet
 *     description: Returns all resources
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of resources
 */
// GET timesheets (Only active)
router.get('/', auth, (req, resp) => {
    let filter = {};
    Timesheet.paginate(filter, { sort: { _id: req.query.sort_order }, page: parseInt(req.query.page), limit: parseInt(req.query.limit), populate: ['tasks', 'createdBy', 'updatedBy'] }, (error, result) => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        if (error) return resp.status(500).json({
            error: error
        });
        return resp.status(200).json(result);
    });
});


/**
 * @swagger
 * /timesheets/{id}:
 *   get:
 *     tags:
 *       - timesheet
 *     description: Returns a single timesheet
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Timesheet's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single timesheet
 */
// GET SINGLE Timesheet BY ID
router.get('/:id', auth, (req, resp, next) => {
    Timesheet.findById(req.params.id).exec().then(resource => {
        return resp.status(200).json(resource);
    }).catch(error => {
        console.log('error : ', error);
        // 204 : No content. There is no timesheet to send for this request, but the headers may be useful.
        return resp.status(204).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /timesheets:
 *   post:
 *     tags:
 *       - timesheet
 *     description: Creates a new timesheet
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: timesheet
 *         description: timesheet object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Timesheet'
 *     responses:
 *       201:
 *         description: timesheet created successfully
 */
// SAVE Timesheet
router.post('/', auth, (req, resp, next) => {
    console.log(req.body);
    const resource = new Timesheet({
        _id: new mongoose.Types.ObjectId(),
        description: req.body.description,
        tasks: req.body.tasks,
        date: req.body.date,
        description: req.body.description,
        createdBy: req.body.createdBy,
        updatedBy: req.body.createdBy
    });

    resource.save()
        .then(result => {
            console.log(result);
            return resp.status(201).json({
                message: "Timesheet added successfully.",
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
* /timesheets/{id}:
*   put:
*     tags:
*       - timesheet
*     description: Updates a single timesheet
*     produces: application/json
*     parameters:
*       name: timesheet
*       in: body
*       description: Fields for the timesheet
*       schema:
*         type: array
*         $ref: '#/definitions/Timesheet'
*     responses:
*       200:
*         description: timesheet updated successfully
*/
// UPDATE Timesheet
router.put('/:id', auth, (req, resp, next) => {
    Timesheet.findByIdAndUpdate(req.params.id, req.body).exec().then(resource => {
        return resp.status(200).json(resource);
    }).catch(error => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /timesheets/{id}:
 *   delete:
 *     tags:
 *       - timesheet
 *     description: Deletes a single timesheet
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: timesheet's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: timesheet deleted successfully
 */
// DELETE Timesheet (Hard delete. This will delete the entire timesheet detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Timesheet.findByIdAndRemove(req.params.id).exec().then(resource => {
        return resp.status(200).json(resource);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
