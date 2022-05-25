var express         = require('express');
var mongoose        = require('mongoose');
var Event           = require('../models/Event');
const auth          = require('../auth');
var router          = express.Router();

/**
 * @swagger
 * /event:
 *   get:
 *     tags:
 *       - Event
 *     description: Returns all events
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of events
 */
// GET EventS (Only active) WITH filter & pagination
router.get('/', auth, (req, resp) => {
    Event.where({ is_active: true }).exec().then(events => {
        return resp.status(200).json(events);
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
 * /event/{id}:
 *   get:
 *     tags:
 *       - Event
 *     description: Returns a single event
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Event's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single event
 */

// GET SINGLE EVENT BY ID
router.get('/:id', auth, (req, resp, next) => {
    Event.findById(req.params.id).exec().then(event => {
        return resp.status(200).json(event);
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
 * /event:
 *   post:
 *     tags:
 *       - Event
 *     description: Creates a new event
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: event
 *         description: Event object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Event'
 *     responses:
 *       201:
 *         description: Event created successfully
 */
// SAVE EVENT
router.post('/', auth, (req, resp, next) => {
    console.log(req.body);

    /*const params = {
        name: req.body.name,
        description: req.body.description,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        month_loop: req.body.month_loop,
        all_day: req.body.all_day,
        created_by: req.body.created_by,
    }*/

    const event = new Event({
        ...req.body,
        _id: new mongoose.Types.ObjectId(),
        created_date: Date.now(),
        updated_date: Date.now()
    });

    event.save().then(result => {
        console.log(result);
        return resp.status(201).json({
            message: "Event created successfully",
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
* /event/{id}:
*   put:
*     tags:
*       - Event
*     description: Updates a single event
*     produces: application/json
*     parameters:
*       name: event
*       in: body
*       description: Fields for the Event resource
*       schema:
*         type: array
*         $ref: '#/definitions/Event'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE EVENT
router.put('/:id', auth, (req, resp, next) => {
    Event.findByIdAndUpdate(req.params.id, req.body).exec().then(event => {
        return resp.status(200).json(event);
    }).catch(error => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /event/{id}:
 *   delete:
 *     tags:
 *       - Event
 *     description: Deletes a single event
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Event's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE EVENT (Hard delete. This will delete the entire event detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Event.findByIdAndRemove(req.params.id).exec().then(event => {
        return resp.status(200).json(event);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


module.exports = router;
