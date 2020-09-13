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
    if(req.xhr || req.accepts('json,html')=== 'json') {
        res.send({ success: true });
        // (에러가 있다면 { error: 'error description' }을 보냅니다.)
    } else {
        res.redirect(303, '/thank-you')
    }
    res.redirect(303, '/thank-you');
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
