const { Login, Register, refreshAccessToken, Logout, verifyMail } = require("../Controllers/auth");

const router = require("express").Router();

router.get('/', (req,res) => {
    res.json({message: "Auth"})
});
router.post('/Register', Register);

router.post('/Login', Login);

router.post('/Refresh', refreshAccessToken);

router.post('/verifyMail', verifyMail);

router.post('/logout', Logout);

module.exports = router;