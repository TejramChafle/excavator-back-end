var express     = require('express');
var mongoose    = require('mongoose');
const auth      = require('../auth');
var router      = express.Router();
var Service     = require('../models/Service');
/**
 * @swagger
 * /service:
 *   get:
 *     tags:
 *       - Service
 *     description: Returns all services
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of services
 */
// GET users WITH filter, sorting & pagination
router.get('/', auth, (req, resp) => {
    let filter = {};
    filter.active = req.query.is_active || true;
    if (req.query.name) filter.name = new RegExp('.*' + req.query.name + '.*', 'i');
    if (req.query.rate) filter.rate = req.query.rate;
    if (req.query.rate) filter.rate = req.query.rate;
    if (req.query.billingType) filter.billingType = req.query.billingType;
    filter.business = req.query.businessId;
    Service.paginate(filter, {
            sort: { _id: req.query.sort_order },
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
 * /service/{id}:
 *   get:
 *     tags:
 *       - Service
 *     description: Returns a single service
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Service's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single service
 */

// GET SINGLE SERVICE BY ID
router.get('/:id', auth, (req, resp, next) => {
    Service.findById(req.params.id).exec().then(service => {
        return resp.status(200).json(service);
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
 * /service:
 *   post:
 *     tags:
 *       - Service
 *     description: Creates a new service
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: service
 *         description: Service object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Service'
 *     responses:
 *       201:
 *         description: Service created successfully
 */
// SAVE SERVICE
router.post('/', (req, resp, next) => {
    console.log('REQUEST: ', req);
    // First check if the service with name already exists.
    Service.findOne({ name: req.body.name, active: true }).exec()
        .then(service => {
            // If the service with name already exists, then return error
            if (service) {
                // 409 : Conflict. The request could not be completed because of a conflict.
                return resp.status(409).json({
                    message: "The service with name " + req.body.name + " already exist."
                });
            } else {
                // Since the service doesn't exist, then save the detail
                const _service = new Service({
                    _id: new mongoose.Types.ObjectId(),
                    ...req.body
                });

                _service.save()
                    .then(result => {
                        console.log(result);
                        return resp.status(201).json({
                            message: "Service added successfully",
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
            }
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
* /service/{id}:
*   put:
*     tags:
*       - Service
*     description: Updates a single service
*     produces: application/json
*     parameters:
*       name: service
*       in: body
*       description: Fields for the Service resource
*       schema:
*         type: array
*         $ref: '#/definitions/Service'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE SERVICE
router.put('/:id', auth, (req, resp, next) => {
    Service.findByIdAndUpdate(req.params.id, req.body).exec().then(service => {
        return resp.status(200).json(service);
    }).catch(error => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /service/{id}:
 *   delete:
 *     tags:
 *       - Service
 *     description: Deletes a single service
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Service's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE SERVICE (Hard delete. This will delete the entire service detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Service.findByIdAndRemove(req.params.id).exec().then(service => {
        return resp.status(200).json(service);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
