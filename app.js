const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');

// .env 파일 불러오는 모듈
dotenv.config(); // process.env에 .env 파일 내용을 넣음
const pageRouter = require('./routes/page');

const app = express();
app.set('port', process.env.PORT || 8001);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});

app.use(morgan('dev')); // logging - dev는 자세하게 배포 시 combined

// 브라우저에서는 여기 있는 파일들 접근 못한다. 보안적으로 위험하기 때문에 접근할 수 없게 만드는데 그 중에서 특별하게 public 폴더만 접근한다.
app.use(express.static(path.join(__dirname, 'public')));

// 들어오는 요청에서 JSON 형식의 본문을 파싱한다. 이렇게 파싱된 데이터는 req.body 객체에 추가되어 요청을 처리하는 라우트 핸들러에게 쉽게 접근할 수 있다.
app.use(express.json());

// URL 인코딩된 본문 데이터를 파싱하기 위해 사용되는 미들웨어 설정, extended: false는 querystring을 사용, true면 qs 모듈을 사용
app.use(express.urlencoded({extended: false}));

// cookie-parser 미들웨어는 요청에 동봉된 쿠키를 해석해 req.cookies 객체에 쿠키를 키-값 형식으로 저장한다.
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(session({
    resave: false, // 세션에 변경 사항이 없는 경우 세션을 다시 저장하지 않는다. true로 설정할 경우 세션에 변화가 없어도 계속 저장한다.
    saveUninitialized: false, // 초기화되지 않은 새 세션(세션에 아무런 데이터가 저장되지 않은 상태)을 저장소에 저장하지 않는다.
    secret: process.env.COOKIE_SECRET, // cookie-parser의 비밀키와 같게 설정
    cookie: {
        httpOnly: true, // XSS 공격 방지
        secure: false, // https 적용할 때 true로 변경
    },
}));

app.use('/', pageRouter);

// 프론트에서 요청한 주소가 없을 때 404 에러를 응답하는 미들웨어
app.use((req, res, next) => { // 404 NOT FOUND
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error); // 에러 처리 미들웨어로 넘김
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
    // res.locals 객체는 주로 템플릿 렌더링에 필요한 데이터를 전달하는 데 사용된다.
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err: {}; // 배포모드일 때는 에러를 안넣어준다. -> 보안상 위험
    res.status(err.status || 500);
    res.render('error'); // nunjucks에서 views 폴더 및 html이라고 설정했기 때문에 error.html을 찾아서 응답으로 보내준다.
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});
