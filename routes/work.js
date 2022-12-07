var express     = require('express');
var mongoose    = require('mongoose');
const auth      = require('../auth');
var router      = express.Router();
var Work     = require('../models/Work');
/**
 * @swagger
 * /work:
 *   get:
 *     tags:
 *       - Work
 *     description: Returns all works
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of works
 */
// GET works WITH filter, sorting & pagination
router.get('/', auth, (req, resp) => {
    let filter = {};
    filter.active = req.query.hasOwnProperty('active') ? req.query.active : true;
    if (req.query.name) filter.name = new RegExp('.*' + req.query.name + '.*', 'i');
    if (req.query.rate) filter.rate = req.query.rate;
    if (req.query.billingType) filter.billingType = req.query.billingType;
    filter.business = req.query.businessId;
    console.log({filter});
    Work.paginate(filter, {
            sort: { _id: req.query.sort_order },
            page: parseInt(req.query.page),
            limit: parseInt(req.query.limit),
            populate: [{ path: 'customer', match: {} }, { path: 'service', match: {} }]
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
 * /work/{id}:
 *   get:
 *     tags:
 *       - Work
 *     description: Returns a single work
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Work's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single work
 */

// GET SINGLE Work BY ID
router.get('/:id', auth, (req, resp, next) => {
    Work.findById(req.params.id).exec().then(work => {
        return resp.status(200).json(work);
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
 * /work:
 *   post:
 *     tags:
 *       - Work
 *     description: Creates a new work
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: work
 *         description: Work object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Work'
 *     responses:
 *       201:
 *         description: Work created successfully
 */
// SAVE Work
router.post('/', (req, resp, next) => {
    console.log('REQUEST: ', req);
    const _work = new Work({
        _id: new mongoose.Types.ObjectId(),
        ...req.body
    });

    _work.save().then(result => {
        console.log(result);
        return resp.status(201).json({
            message: "Work added successfully",
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
* /work/{id}:
*   put:
*     tags:
*       - Work
*     description: Updates a single work
*     produces: application/json
*     parameters:
*       name: work
*       in: body
*       description: Fields for the Work resource
*       schema:
*         type: array
*         $ref: '#/definitions/Work'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE Work
router.put('/:id', auth, (req, resp, next) => {
    Work.findByIdAndUpdate(req.params.id, req.body).exec().then(work => {
        return resp.status(200).json(work);
    }).catch(error => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /work/{id}:
 *   delete:
 *     tags:
 *       - Work
 *     description: Deletes a single work
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Work's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE Work (Hard delete. This will delete the entire work detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Work.findByIdAndRemove(req.params.id).exec().then(work => {
        return resp.status(200).json(work);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
