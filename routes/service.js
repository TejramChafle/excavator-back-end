var express     = require('express');
var mongoose    = require('mongoose');
var Service     = require('../models/Service');
const auth      = require('../auth');

var router      = express.Router();

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
// GET SERVICES (Only active)
router.get('/', auth, (req, resp) => {
    Service.where({ is_active: true }).exec().then(services => {
        return resp.status(200).json(services);
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
router.post('/', auth, (req, resp, next) => {
    // First check if the service with name already exists.
    Service.findOne({ firstname: req.body.name, address: req.body.address, is_active: true })
        .exec()
        .then(service => {
            // If the service with name already exists, then return error
            if (service) {
                // 409 : Conflict. The request could not be completed because of a conflict.
                return resp.status(409).json({
                    message: "The service with name " + req.body.name + " already exist."
                });
            } else {
                // Since the service doesn't exist, then save the detail
                console.log(req.body);
                const service = new Service({
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    rate: req.body.rate,
                    unit: req.body.unit,
                    description: req.body.description,
                    created_by: req.body.created_by,
                    updated_by: req.body.updated_by,
                    created_date: Date.now(),
                    updated_date: Date.now()
                });

                service.save()
                    .then(result => {
                        console.log(result);
                        return resp.status(201).json({
                            message: "Service created successfully",
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
