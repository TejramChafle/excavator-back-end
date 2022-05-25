var express     = require('express');
var mongoose    = require('mongoose');
var Todo        = require('../models/Todo');
const auth      = require('../auth');

var router      = express.Router();

/**
 * @swagger
 * /todo:
 *   get:
 *     tags:
 *       - Todo
 *     description: Returns all todos
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of todos
 */
// GET TODOS (Only active) WITH filter & pagination
router.get('/', auth, (req, resp) => {
    Todo.where({ is_active: true }).exec().then(todos => {
        return resp.status(200).json(todos);
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
 * /todo/{id}:
 *   get:
 *     tags:
 *       - Todo
 *     description: Returns a single todo
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Todo's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single todo
 */
// GET SINGLE TODO BY ID
router.get('/:id', auth, (req, resp) => {
    Todo.findById(req.params.id).exec().then(todo => {
        return resp.status(200).json(todo);
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
 * /todo:
 *   post:
 *     tags:
 *       - Todo
 *     description: Creates a new todo
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: todo
 *         description: Todo object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Todo'
 *     responses:
 *       201:
 *         description: Todo created successfully
 */
// SAVE TODO
router.post('/', auth, (req, resp) => {
    console.log(req.body);
    const todo = new Todo({
        _id: new mongoose.Types.ObjectId(),
        title:          req.body.title,
        description:    req.body.description,
        start_date:     req.body.start_date,
        due_date:       req.body.due_date,
        start_time:     req.body.start_time,
        end_time:       req.body.end_time,
        is_priority:    req.body.is_priority,
        is_starred:     req.body.is_starred,
        location:       req.body.location,
        tag_ids:        req.body.tag_ids,
        is_calendar_event: req.body.is_calendar_event,
        is_all_day:     req.body.is_all_day,
        is_completed:   req.body.is_completed,

        created_by:     req.body.created_by,
        updated_by:     req.body.updated_by,
        created_date: Date.now(),
        updated_date: Date.now()
    });

    todo.save().then(result => {
        console.log(result);
        return resp.status(201).json({
            message: "Todo created successfully",
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
* /todo/{id}:
*   put:
*     tags:
*       - Todo
*     description: Updates a single todo
*     produces: application/json
*     parameters:
*       name: todo
*       in: body
*       description: Fields for the Todo resource
*       schema:
*         type: array
*         $ref: '#/definitions/Todo'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE TODO
router.put('/:id', auth, (req, resp) => {
    Todo.findByIdAndUpdate(req.params.id, req.body).exec().then(todo => {
        return resp.status(200).json(todo);
    }).catch(error => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /todo/{id}:
 *   delete:
 *     tags:
 *       - Todo
 *     description: Deletes a single todo
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Todo's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE TODO (Hard delete. This will delete the entire todo detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp) => {
    Todo.findByIdAndRemove(req.params.id).exec().then(todo => {
        return resp.status(200).json(todo);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
