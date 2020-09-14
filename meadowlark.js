var fortune = require('./lib/fortune.js');
const express = require('express');
const app = express();

// 핸들바 뷰 엔진 설정
const handlebars = require('express-handlebars')
    .create({ defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use((req, res, next) => {
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
})

app.use(express.static(__dirname + '/public'));

app.use(require('body-parser').urlencoded({ extended: true }));

var formidable = require('formidable');

// 쿠키 인증서
var credentials = require('./credentials.js');

app.use(require('cookie-parser')(credentials.cookieSecret));

app.use(require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret
}));

app.use((req, res, next) => {
    // 플래시 메시지가 있다면 콘텍스트에 전달한 다음 지웁니다.
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about', {
        fortune: fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    });
});

app.get('/tours/hood-river', (req, res) => {
    res.render('tours/hood-river');
});

app.get('/tours/oregon-coast', (req, res) => {
    res.render('tours/oregon-coast');
});

app.get('/tours/request-group-rate', (req, res) => {
    res.render('tours/request-group-rate');
});

app.get('/headers', (req, res) => {
    res.set('Content-Type', 'text/plain');
    var s = '';
    for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
    res.send(s);
});

app.get('/newsletter', (req, res) => {
    // CSRF에 대해서는 나중에
    // 더미 DATA
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});

app.post('/process', (req, res) => {
    console.log('Form (from querystring): ' + req.query.form);
    console.log('CSRF token (from hidden form field): '+ req.body._csrf);
    console.log('Name (from visible form field): ' + req.body.name);
    console.log('Email (from visible form field): ' + req.body.email);

    if(req.xhr || req.accepts('json,html') === 'json') {
        res.send({ success: true });
        // (에러가 있다면 { error: 'error description' }을 보냅니다.)
    } else {
        res.redirect(303, '/thank-you')
    }
});

var VALID_EMAIL_REGEX = new RegExp(
    '^[a-zA-Z0-9.!#$%&\'*+\/=?^_`{|}~-]+@' +
    '[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?' +
    '(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$'
);

app.post('/newsletter', (req, res) => {
    var name = req.body.name || '', email = req.body.email || '';
    //입력 유효성 검사
    if(!email.match(VALID_EMAIL_REGEX)) {
        if(req, xhr) return res.json({ error: 'Invalid name email address.' });
        req.session.flash = {
            type: 'danger',
            intro: 'Validation error!',
            message: 'The email address you entered was not valid',
        };
        return res.redirect(303, '/newsletter/archive');
    }
    new NewsletterSignup({ name: name, email: email }).save((err) => {
        if(err) {
            if(req, xhr) return res.json({ error: 'Database error.' });
            req.session.flash = {
                type: 'danger',
                intro: 'Database error!',
                message: 'There was a database error; please try again later.',
            };
            return res.redirect(303, '/newsletter/archive');
        }
        if(req, xhr) return res.json({ success: true });
        req.session.flash = {
            type: 'success',
            intro: 'Thank you!',
            message: 'You have now been signed up for the newsletter.',
        };
        return res.redirect(303, '/newsletter/archive');
    });
});

app.get('/contest/vacation-photo', (req, res) => {
    var now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(), month: now.getMonth()
    })
});

app.post('/contest/vacation-photo/:year/:month', (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        if(err) return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});

var jqupload = require('jquery-file-upload-middleware');
app.use('/upload', (req, res, next) => {
    var now = Date.now();
    jqupload.fileHandler({
        uploadDir: () => {
            return __dirname + '/public/uploads/' + now;
        },
        uploadUrl: () => {
            return '/uploads/' + now;
        },
    })(req, res, next)
});

// 커스텀 404 페이지
app.use((req, res) => {
    res.status(404);
    res.render('404');
});

//커스텀 500 페이지
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), () => {
    console.log(`Express started on http://localhost: ${app.get('port')}; press Ctrl-C to terminate`);
});
