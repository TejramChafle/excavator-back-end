const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const auth = require('../auth');
const router = express.Router();

/**
 * @swagger
 * /task:
 *   get:
 *     tags:
 *       - Task
 *     description: Returns all tasks
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of tasks
 */
// GET tasks (Only active) WITH filter & pagination
router.get('/', auth, (req, resp) => {
    let filter = {};
    // filter.is_active = req.query.is_active || true;
    if (req.query.title) filter.title = new RegExp('.*' + req.query.title + '.*', 'i');
    if (req.query.isStarred) filter.isStarred = req.query.isStarred;
    if (req.query.isImportant) filter.isImportant = req.query.isImportant;
    if (req.query.isDone) filter.isDone = req.query.isDone;
    // populate: ['createdBy', 'updatedBy']
    Task.paginate(filter, { sort: { _id: req.query.sortOrder }, page: parseInt(req.query.page), limit: parseInt(req.query.limit) }, (error, result) => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        if (error) return resp.status(500).json({
            error: error
        });
        return resp.status(200).json(result);
    });
});


/**
 * @swagger
 * /task/{id}:
 *   get:
 *     tags:
 *       - Task
 *     description: Returns a single task
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Task's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single task
 */

// GET SINGLE TASK BY ID
router.get('/:id', auth, (req, resp, next) => {
    Task.findById(req.params.id).exec().then(task => {
        return resp.status(200).json(task);
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
 * /task:
 *   post:
 *     tags:
 *       - Task
 *     description: Creates a new task
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: task
 *         description: Task object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Task'
 *     responses:
 *       201:
 *         description: Task created successfully
 */
// SAVE TASK
router.post('/', auth, (req, resp, next) => {
    // console.log(req.body);
    const task = new Task({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        notes: req.body.notes,
        schedule: req.body.schedule,
        labels: req.body.labels,
        isStarred: req.body.isStarred,
        isImportant: req.body.isImportant,
        isDone: req.body.isDone,
        createdBy: req.body.createdBy,
        updatedBy: req.body.createdBy,
        createdDate: Date.now(req.body.createdDate),
        updatedDate: Date.now(req.body.createdDate)
    });
    task.save()
        .then(result => {
            console.log(result);
            return resp.status(201).json({
                message: "Task created successfully",
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
* /task/{id}:
*   put:
*     tags:
*       - Task
*     description: Updates a single task
*     produces: application/json
*     parameters:
*       name: task
*       in: body
*       description: Fields for the Task resource
*       schema:
*         type: array
*         $ref: '#/definitions/Task'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE TASK
router.put('/:id', auth, (req, resp, next) => {
    Task.findByIdAndUpdate(req.params.id, req.body).exec().then(task => {
        return resp.status(200).json(task);
    }).catch(error => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /task/{id}:
 *   delete:
 *     tags:
 *       - Task
 *     description: Deletes a single task
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Task's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE TASK (Hard delete. This will delete the entire task detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Task.findByIdAndRemove(req.params.id).exec().then(task => {
        return resp.status(200).json(task);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
