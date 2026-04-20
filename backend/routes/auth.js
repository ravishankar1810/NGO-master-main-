const express = require('express');
const router = express.Router();
const { register, login, getMe, googleLogin } = require('../controllers/auth');
const { verifyToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', verifyToken, getMe);

module.exports = router;
