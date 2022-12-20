const express = require('express');
const mongoose = require('mongoose');
const auth = require('../auth');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
/**
 * @swagger
 * /employee:
 *   get:
 *     tags:
 *       - Employee
 *     description: Returns all customers
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of customers
 */
// GET customers WITH filter, sorting & pagination
router.get('/', auth, (req, resp) => {
    let filter = {};
    // filter.active = req.query.hasOwnProperty('isActive') ? req.query.isActive : true;
    if (req.query.name) filter.name = new RegExp('.*' + req.query.name + '.*', 'i');
    if (req.query.place) filter.place = new RegExp('.*' + req.query.place + '.*', 'i');
    if (req.query.email) filter.email = new RegExp('.*' + req.query.email + '.*', 'i');
    if (req.query.phone) filter.phone = new RegExp('.*' + req.query.phone + '.*', 'i');
    if (req.query.owner) filter.owner = req.query.owner;
    filter.business = req.query.businessId;
    console.log({filter});
    Employee.paginate(filter, {
        sort: { _id: req.query.sort_order },
        page: parseInt(req.query.page),
        limit: parseInt(req.query.limit),
        populate: [
            { path: 'createdBy', match: {} },
            { path: 'updatedBy', match: {} },
            { path: 'owner', match: {} }
        ]
    }, (error, result) => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        if (error) return resp.status(500).json({
            error: error
        });
        return resp.status(200).json(result);
    });
});


router.get('/attendance/:id', (req, resp, next) => {
    Attendance.findById(req.params.id).exec().then(employee => {
        return resp.status(200).json(employee);
    }).catch(error => {
        console.log('error : ', error);
        // 204 : No content. There is no content to send for this request, but the headers may be useful.
        return resp.status(204).json({
            error: error
        });
    });
});

router.get('/attendance', (req, resp, next) => {
    let filter = {};
    filter.business = req.query.business;
    if (req.query.employee) filter.employee = req.query.employee;
    if (req.query.startDate) filter.startDate = req.query.startDate;
    if (req.query.endDate) filter.endDate = req.query.endDate;
    console.log({filter});
    Attendance.paginate(filter, {
        sort: { _id: req.query.sort_order },
        page: parseInt(req.query.page),
        limit: parseInt(req.query.limit),
        populate: [
            { path: 'employee', match: {} }
        ]
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
 * /employee/{id}:
 *   get:
 *     tags:
 *       - Employee
 *     description: Returns a single employee
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Employee's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single employee
 */

// GET SINGLE Employee BY ID
router.get('/:id', auth, (req, resp, next) => {
    Employee.findById(req.params.id).exec().then(employee => {
        return resp.status(200).json(employee);
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
 * /employee:
 *   post:
 *     tags:
 *       - Employee
 *     description: Creates a new employee
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: employee
 *         description: Employee object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Employee'
 *     responses:
 *       201:
 *         description: Employee created successfully
 */
// SAVE Employee
router.post('/', (req, resp, next) => {
    // First check if the employee with name already exists.
    Employee.findOne({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            active: true
        })
        .exec()
        .then(employee => {
            // If the employee with name already exists, then return error
            if (employee) {
                // 409 : Conflict. The request could not be completed because of a conflict.
                return resp.status(409).json({
                    message: "The employee with name " + req.body.firstName + req.body.lastName + " already exist."
                });
            } else {
                // Since the employee doesn't exist, then save the detail
                const _customer = new Employee({
                    _id: new mongoose.Types.ObjectId(),
                    ...req.body
                });
                _customer.save()
                    .then(result => {
                        console.log(result);
                        return resp.status(201).json({
                            message: "Employee added successfully",
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
* /employee/{id}:
*   put:
*     tags:
*       - Employee
*     description: Updates a single employee
*     produces: application/json
*     parameters:
*       name: employee
*       in: body
*       description: Fields for the Employee resource
*       schema:
*         type: array
*         $ref: '#/definitions/Employee'
*     responses:
*       200:
*         description: Successfully updated
*/
// UPDATE Employee
router.put('/:id', auth, (req, resp, next) => {
    Employee.findByIdAndUpdate(req.params.id, req.body).exec().then(employee => {
        return resp.status(200).json(employee);
    }).catch(error => {
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

// Delete attendance for the provided ID
router.delete('/attendance/:id', auth, (req, resp, next) => {
    Attendance.findByIdAndRemove(req.params.id).exec().then(attendance => {
        return resp.status(200).json(attendance);
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
 * /employee/{id}:
 *   delete:
 *     tags:
 *       - Employee
 *     description: Deletes a single employee
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Employee's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
// DELETE Employee (Hard delete. This will delete the entire employee detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Employee.findByIdAndRemove(req.params.id).exec().then(employee => {
        return resp.status(200).json(employee);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});

router.post('/attendance', (req, resp, next) => {
    // check if the attendance is already marked for the provided date range
    Attendance.find({
        business: req.body.business,
        employee: req.body.employee,
        startDate: {
            $gte: new Date(req.body.startDate).setHours(0,0,0,0)
        },
        endDate: {
            $lte: new Date(req.body.endDate).setHours(0,0,0,0)
        }
    }).exec()
        .then(attendance => {
            console.log({ attendance });
            // If the attendance for the date range already exists, then return error
            if (attendance && attendance.length) {
                const start = new Date(req.body.startDate).toDateString();
                const end = new Date(req.body.endDate).toDateString();
                let message;
                if (start === end) {
                    message = 'The attendance have been already marked for ' + start;
                } else {
                    message = 'The attendance have been already marked for employee from ' + start + ' to the ' + end
                }
                return resp.status(409).json({
                    message
                });
            } else {
                const _attendance = new Attendance({
                    _id: new mongoose.Types.ObjectId(),
                    ...req.body,
                    startDate: new Date(req.body.startDate).setHours(0,0,0,0),
                    endDate: new Date(req.body.endDate).setHours(0,0,0,0)
                });
                _attendance.save()
                    .then(result => {
                        console.log('_attendance result: ', result);
                        return resp.status(201).json({
                            message: "Employee attendace added successfully",
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
        });
});



module.exports = router;
