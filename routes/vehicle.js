var express     = require('express');
var mongoose    = require('mongoose');
const auth      = require('../auth');
var router      = express.Router();
var Vehicle     = require('../models/Vehicle');
/**
 * @swagger
 * /vehicle:
 *   get:
 *     tags:
 *       - Vehicle
 *     description: Returns all vehicles
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of vehicles
 */
// GET vehicles WITH filter, sorting & pagination
router.get('/', auth, (req, resp) => {
    let filter = {};
    filter.active = req.query.is_active || true;
    if (req.query.name) filter.name = new RegExp('.*' + req.query.name + '.*', 'i');
    if (req.query.rate) filter.rate = req.query.rate;
    if (req.query.rate) filter.rate = req.query.rate;
    if (req.query.billingType) filter.billingType = req.query.billingType;
    filter.business = req.query.businessId;
    Vehicle.paginate(filter, {
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
 * /vehicle/{id}:
 *   get:
 *     tags:
 *       - Vehicle
 *     description: Returns a single vehicle
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Vehicle's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single vehicle
 */

// GET SINGLE Vehicle BY ID
router.get('/:id', auth, (req, resp, next) => {
    Vehicle.findById(req.params.id).exec().then(vehicle => {
        return resp.status(200).json(vehicle);
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
 * /vehicle:
 *   post:
 *     tags:
 *       - Vehicle
 *     description: Creates a new vehicle
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: vehicle
 *         description: Vehicle object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Vehicle'
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 */
// SAVE Vehicle
router.post('/', (req, resp, next) => {
    console.log('REQUEST: ', req);
    // First check if the vehicle with name already exists.
    Vehicle.findOne({ name: req.body.name, active: true }).exec()
        .then(vehicle => {
            // If the vehicle with name already exists, then return error
            if (vehicle) {
                // 409 : Conflict. The request could not be completed because of a conflict.
                return resp.status(409).json({
                    message: "The vehicle with name " + req.body.name + " already exist."
                });
            } else {
                // Since the vehicle doesn't exist, then save the detail
                const _service = new Vehicle({
                    _id: new mongoose.Types.ObjectId(),
                    ...req.body
                });

                _service.save()
                    .then(result => {
                        console.log(result);
                        return resp.status(201).json({
                            message: "Vehicle added successfully",
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
* /vehicle/{id}:
*   put:
*     tags:
*       - Vehicle
*     description: Updates a single vehicle
*     produces: application/json
*     parameters:
*       name: vehicle
*       in: body
*       description: Fields for the Vehicle resource
*       schema:
*         type: array
*         $ref: '#/definitions/Vehicle'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE Vehicle
router.put('/:id', auth, (req, resp, next) => {
    Vehicle.findByIdAndUpdate(req.params.id, req.body).exec().then(vehicle => {
        return resp.status(200).json(vehicle);
    }).catch(error => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


/**
 * @swagger
 * /vehicle/{id}:
 *   delete:
 *     tags:
 *       - Vehicle
 *     description: Deletes a single vehicle
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Vehicle's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE Vehicle (Hard delete. This will delete the entire vehicle detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Vehicle.findByIdAndRemove(req.params.id).exec().then(vehicle => {
        return resp.status(200).json(vehicle);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

module.exports = router;
