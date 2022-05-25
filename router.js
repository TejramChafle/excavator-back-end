const createError = require('http-errors');
// const router = require('./routes/router');
const swaggerSpec = require('./swagger');

const _router = (app) => {
    app.get('/', (req, res) => {
        res.send('Excavator APIs working..!');
    });
    app.use('/auth', require('./routes/auth'));
    app.use('/contact', require('./routes/contact'));
    // app.use('/profile', require('./routes/profile'));
    // app.use('/timesheets', require('./routes/timesheets'));
    app.use('/purchases', require('./routes/purchases'));
    // app.use('/events', require('./routes/events'));
    app.use('/returnings', require('./routes/returnings'));

    // Service to save device token and push notification
    app.use('/push', require('./routes/push'));

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

    // serve swagger
    app.get('/swagger.json', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
}

module.exports = _router;