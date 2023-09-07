const createError = require('http-errors');
// const router = require('./routes/router');

const _router = (app) => {
    app.get('/', (req, res) => {
        res.send('Excavator APIs working..!');
    });
    app.use('/auth', require('./routes/auth'));
    app.use('/contact', require('./routes/contact'));
    app.use('/user', require('./routes/user'));
    app.use('/business', require('./routes/business'));
    app.use('/service', require('./routes/service'));
    app.use('/tag', require('./routes/tag'));
    app.use('/vehicle', require('./routes/vehicle'));
    app.use('/petrol-pump', require('./routes/petrol-pump'));
    app.use('/customer', require('./routes/customer'));
    app.use('/employee', require('./routes/employee'));
    app.use('/work', require('./routes/work'));
    app.use('/invoice', require('./routes/invoice'));
    app.use('/transaction', require('./routes/transaction'));
    app.use('/expenditure', require('./routes/expenditure'));
    app.use('/borrowing', require('./routes/borrowing'));
    app.use('/revenue', require('./routes/revenue'));
    app.use('/fuel', require('./routes/fuel'));

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        next(createError(404));
    });

    // error handler
    app.use((err, req, res, next) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        // res.send(err.status); // deprecated
        res.sendStatus(err.status);
    });
}

module.exports = _router;