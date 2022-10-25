const express = require('express');
const mongoose = require('mongoose');
const Tag = require('../models/Tag');
const auth = require('../auth');
const router = express.Router();

/**
 * @swagger
 * /tag:
 *   get:
 *     tags:
 *       - Tag
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
    filter.business = req.query.business;
    if (req.query.name) filter.name = new RegExp('.*' + req.query.name + '.*', 'i');
    if (req.query.purpose) filter.purpose = new RegExp('.*' + req.query.purpose + '.*', 'i');
    if (req.query.createdBy) filter.createdBy = req.query.createdBy;
    if (req.query.updatedBy) filter.updatedBy = req.query.updatedBy;
    Tag.paginate(filter, { sort: { _id: req.query.sortOrder }, page: parseInt(req.query.page), limit: parseInt(req.query.limit) }, (error, result) => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        if (error) return resp.status(500).json({
            error: error
        });
        return resp.status(200).json(result);
    });
});


/**
 * @swagger
 * /tag/{id}:
 *   get:
 *     tags:
 *       - Tag
 *     description: Returns a single tag
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Tag's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single tag
 */

// GET SINGLE TASK BY ID
router.get('/:id', auth, (req, resp, next) => {
    Tag.findById(req.params.id).exec().then(tag => {
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
 * /tag:
 *   post:
 *     tags:
 *       - Tag
 *     description: Creates a new tag
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: tag
 *         description: Tag object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Tag'
 *     responses:
 *       201:
 *         description: Tag created successfully
 */
// SAVE TASK
router.post('/', auth, (req, resp, next) => {
    // console.log(req.body);
    const tag = new Tag({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        purpose: req.body.purpose,
        business: req.body.business,
        createdBy: req.body.createdBy,
        updatedBy: req.body.createdBy
    });
    tag.save()
        .then(result => {
            console.log(result);
            return resp.status(201).json({
                message: "Tag created successfully",
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
* /tag/{id}:
*   put:
*     tags:
*       - Tag
*     description: Updates a single tag
*     produces: application/json
*     parameters:
*       name: tag
*       in: body
*       description: Fields for the Tag resource
*       schema:
*         type: array
*         $ref: '#/definitions/Tag'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE TASK
router.put('/:id', auth, (req, resp, next) => {
    Tag.findByIdAndUpdate(req.params.id, req.body).exec().then(tag => {
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
 * /tag/{id}:
 *   delete:
 *     tags:
 *       - Tag
 *     description: Deletes a single tag
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Tag's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE TASK (Hard delete. This will delete the entire tag detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Tag.findByIdAndRemove(req.params.id).exec().then(tag => {
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
