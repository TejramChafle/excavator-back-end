var express         = require('express');
var mongoose        = require('mongoose');
var Reminder        = require('../models/Reminder');
var SentReminder    = require('../models/SentReminder');
const auth          = require('../auth');

var router          = express.Router();

/**
 * @swagger
 * /reminder:
 *   get:
 *     tags:
 *       - Reminder
 *     description: Returns all reminders
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of reminders
 */
// GET REMINDERS (Only active) WITH filter & pagination
router.get('/', auth, (req, resp) => {
    Reminder.where({ is_active: true }).exec().then(reminders => {
        return resp.status(200).json(reminders);
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
 * /reminder/{id}:
 *   get:
 *     tags:
 *       - Reminder
 *     description: Returns a single reminder
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Reminder's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single reminder
 */

// GET SINGLE REMINDER BY ID
router.get('/:id', auth, (req, resp, next) => {
    Reminder.findById(req.params.id).exec().then(reminder => {
        return resp.status(200).json(reminder);
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
 * /reminder:
 *   post:
 *     tags:
 *       - Reminder
 *     description: Creates a new reminder
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: reminder
 *         description: Reminder object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Reminder'
 *     responses:
 *       201:
 *         description: Reminder created successfully
 */
// SAVE REMINDER
router.post('/', auth, (req, resp, next) => {
    console.log(req.body);
    const reminder = new Reminder({
        _id: new mongoose.Types.ObjectId(),
        type: req.body.type,
        message: req.body.message,
        scheduled_date: req.body.scheduled_date,
        contact_ids: req.body.contact_ids,
        created_by: req.body.created_by,
        updated_by: req.body.updated_by,
        created_date: Date.now(),
        updated_date: Date.now()
    });

    reminder.save().then(result => {
        console.log(result);
        return resp.status(201).json({
            message: "Reminder created successfully",
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
* /reminder/{id}:
*   put:
*     tags:
*       - Reminder
*     description: Updates a single reminder
*     produces: application/json
*     parameters:
*       name: reminder
*       in: body
*       description: Fields for the Reminder resource
*       schema:
*         type: array
*         $ref: '#/definitions/Reminder'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE REMINDER
router.put('/:id', auth, (req, resp, next) => {
    Reminder.findByIdAndUpdate(req.params.id, req.body).exec().then(reminder => {
        return resp.status(200).json(reminder);
    }).catch(error => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /reminder/{id}:
 *   delete:
 *     tags:
 *       - Reminder
 *     description: Deletes a single reminder
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Reminder's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE REMINDER (Hard delete. This will delete the entire reminder detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Reminder.findByIdAndRemove(req.params.id).exec().then(reminder => {
        return resp.status(200).json(reminder);
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
 * /reminder-sent:
 *   get:
 *     tags:
 *       - Reminder
 *     description: Returns all sent reminders
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of sent reminders
 */
// GET SENT REMINDERS WITH filter & pagination
router.get('/', auth, (req, resp) => {
    SentReminder.where({ is_active: true }).exec().then(reminders => {
        return resp.status(200).json(reminders);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
