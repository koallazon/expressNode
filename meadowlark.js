const express = require('express');

const app = express();

// 핸들바 뷰 엔진 설정
const handlebars = require('express-handlebars')
    .create({ defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)]
    res.render('about', { fortune: randomFortune });
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

const fortunes = [
    "하나",
    "둘",
    "셋",
    "넷",
    "다섯"
]