const express = require('express');
const router = express.Router();
const { renderMain, renderProfile, renderJoin } = require('../controllers/page');

// 공통적으로 쓸 수 있는 변수를 선언하는 자리가 res.locals이다.
router.use((req, res, next) => {
    res.locals.user = null;
    res.locals.followerCount = 0;
    res.locals.followingCount = 0;
    res.locals.followerIdList = [];
    next();
});

// 마지막 미들웨어는 컨트롤러라고 부른다. 컨트롤러를 따로 폴더로 분리한다.
router.get('/profile', renderProfile);
router.get('/join', renderJoin);
router.get('/', renderMain);

module.exports = router;