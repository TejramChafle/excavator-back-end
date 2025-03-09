const express = require('express');
const mongoose = require('mongoose');
const Salary = require('../models/Salary');
const auth = require('../auth');
var router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Transaction = require('../models/Transaction');


// GET Salary history (default active) with filter, sorting & pagination
router.get('/', auth, (req, resp) => {

    let filter = {};
    filter.isActive = req.query.hasOwnProperty('active') ? req.query.active : true;
    filter.business = req.query.businessId;
    if (req.query.employee) filter.employee = req.query.employee;
    if (req.query.date) filter.date = req.query.date;
    if (req.query.amountPaid) filter.amountPaid = req.query.amountPaid;
    if (req.query.remarks) filter.remarks = new RegExp('.*' + req.query.remarks + '.*', 'i');
    console.log({filter});
    Salary.paginate(
        filter,
        {
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


// GET single salary details by _id
router.get('/:id', auth, (req, resp) => {
    Salary.findById(req.params.id).exec().then(salary => {
        return resp.status(200).json(salary);
    }).catch(error => {
        console.log('error : ', error);
        // 204 : No content. There is no content to send for this request, but the headers may be useful.
        return resp.status(204).json({
            error: error
        });
    });
});


// SAVE salary
router.post('/', auth, async (req, resp) => {

    console.log(req.body);

    try {

        // Metadata for audit information
        const medadata = {
            createdBy: req.body.createdBy,
            updatedBy: req.body.updatedBy,
            business: req.body.business
        };
        
        console.log('Saving salary payment information', req.body);

        // Create a new transaction
        const salaryId = new mongoose.Types.ObjectId();
        const transactionData = new Transaction({
            _id: new mongoose.Types.ObjectId(),
            ...req.body.transaction,
            ...medadata,
            sourceId: salaryId,
            source: 'EMPLOYEE_PAYMENT',
            category: 'SPENDING',
            mode: req.body.paymentMode || 'CASH',
            amount: req.body.amountPaid,
            date: new Date(),
            status: req.body.paymentStatus || 'PAID'
        });
        
        console.log('transactionData ', transactionData);
        
        const _transaction = new Transaction(transactionData);
        const savedTransaction = await _transaction.save();
        console.log('Transaction saved', savedTransaction);

        const salaryData = {
            _id: salaryId,
            ...medadata,
            transaction: savedTransaction._id,
            employee: req.body.employee,
            date: req.body.date,
            amountPaid: req.body.amountPaid,
            balanceDue: req.body.balanceDue,
            advancedPaid: req.body.advancedPaid,
            paidDays: req.body.paidDays,
            remarks: req.body.remarks,
            totalPayable:req.body.totalPayable,
            // paidFromDate: req.body.paidFromDate,
            // paidToDate: req.body.paidToDate,
            paidDates: req.body.paidDates,
            totalPaidDays: req.body.totalPaidDays
        }
        console.log('_salary input ', salaryData);
        const _salary = new Salary(salaryData);
        const savedSalary = await _salary.save();
        console.log('Salary log saved: ', savedSalary);

        // response with saved information
        return resp.status(201).json({
            message: 'Salary paid successfully',
            result: savedSalary
        });
    } catch (error) {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json(error);
    }
});


// DELETE salary (Hard delete. This will delete the entire salary detail. Only application admin should be allowed to perform this action )
router.delete('/:id', auth, (req, resp, next) => {
    Salary.findByIdAndRemove(req.params.id).exec().then(salary => {
        return resp.status(200).json(salary);
    }).catch(error => {
        console.log('error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    });
});


// UPDATE Salary
router.put('/:id', auth, async(req, resp, next) => {

    try {
        console.log(req.body);
        const medadata = {
            updatedBy: req.body.updatedBy
        }

        // Update the transaction first
        const transactionData = {
            ...medadata,
            amount: req.body.amountPaid,
            date: req.body.date
        };
        
        console.log('transactionData ', transactionData);
        const savedTransaction = await Transaction.findByIdAndUpdate(req.body.transaction, transactionData);
        console.log('Transaction update result ', savedTransaction);

        // Update salary record with incoming data
        const salaryData = {
            _id: req.params.id,
            ...medadata,
            transaction: req.body.transaction,
            employee: req.body.employee,
            date: req.body.date,
            amountPaid: req.body.amountPaid,
            balanceDue: req.body.balanceDue,
            advancedPaid: req.body.advancedPaid,
            paidDays: req.body.paidDays,
            remarks: req.body.remarks
        };

        console.log('salaryData input ', salaryData);
        const _updateResult = await Salary.findByIdAndUpdate(req.params.id, salaryData);
        console.log('Updated result of employee salary payment', _updateResult);
        
        // Success response
        return resp.status(201).json({
            message: "Employee salary payment information updated successfully",
            result: _updateResult
        });
    } catch (error) {
        console.log('fuels error : ', error);
        // 500 : Internal Sever Error. The request was not completed. The server met an unexpected condition.
        return resp.status(500).json({
            error: error
        });
    }
});


// Initialize the employee salary
router.get('/calculate/:id', auth, async(req, resp) => {

    /**
     * Get the employee details for wage per day
     * Get the attendence of employee based on last paid date
     * If the last paid date is missing, consider all the attendence dates till day from employee is joined & active
     * total payable amount  = (number of days * wage per day) + total wage paid (based on entered amount while marking attendence)
     * calculate the total = payable amount + balance due
     * amount to be paid = total - advanced paid
     * 
     * 
     * */
    try {
        // Get the employee details for wage per day
        const employeeData = await Employee.findById(req.params.id);
        const previousPayment = await Salary.findOne({
            employee: req.params.id
        }).sort({ paidToDate: -1 });
        const attendenceFilter = {
            employee: req.params.id,
            // endDate: new Date()
            endDate: {
                $lte: new Date().setHours(0,0,0,0)
            }
        };

        // Set the end date to extract attendance from previously paid
        if (previousPayment) {
            attendenceFilter.startDate = 
            {
                $gte: new Date(previousPayment.paidToDate).setHours(0,0,0,0)
            }
        }
        const attendanceData = await Attendance.find({
           ...attendenceFilter
        });

        // Extract all unpaid dates from the attendance
        const unpaidDates = attendanceData.flatMap(record =>
            getDatesBetween(record.startDate, record.endDate)
        );

        const totalPayable = +employeeData.wagePerDay * unpaidDates.length;
        let balanceDue = 0;
        let advancedPaid = 0;
        if (previousPayment) {
            // balanceDue = totalPayable + previousPayment.balanceDue - previousPayment.advancedPaid;
            // const diff = balanceDue - previousPayment.advancedPaid;
            // advancedPaid =  diff > 0 ? diff : 0;

            const diff = totalPayable + previousPayment.balanceDue - previousPayment.advancedPaid;
            advancedPaid = Math.abs(Math.min(diff, 0));
            balanceDue = Math.max(diff, 0);

            /* if (diff > 0) {
                balanceDue = diff;
            } else {
                advancedPaid = diff;
            } */
        }
        const calculatedPayment = {
            employee: req.params.id,
            date: new Date(),
            totalPayable,
            balanceDue,
            advancedPaid,
            attendance: attendanceData,
            unpaidDates,
            previousPayment
        };

        console.log({ employeeData, previousPayment, attendenceFilter, attendanceData, calculatedPayment });

        // return success response
        return resp.status(200).json({
            ...calculatedPayment
        });
        
    } catch (error) {
        console.log({error});
        return resp.status(500).json({
            error: error
        });
    }
});
  
  // Helper function to get all dates between two dates
  function getDatesBetween(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
  
    while (currentDate <= new Date(endDate)) {
      dates.push(new Date(currentDate).toISOString().split("T")[0]); // Push as 'YYYY-MM-DD'
      currentDate.setDate(currentDate.getDate() + 1); // Increment by 1 day
    }
  
    return dates;
  }
  

module.exports = router;