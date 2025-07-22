const { Login, Register, refreshAccessToken, Logout, verifyMail, verifyInvite } = require("../Controllers/auth");

const router = require("express").Router();

router.get('/', (req,res) => {
    res.json({message: "Auth"})
});
router.post('/Register', Register);

router.post('/Login', Login);

router.post('/Refresh', refreshAccessToken);

router.post('/verifyMail', verifyMail);

router.post('/logout', Logout);

router.post('/verifyInvite/:_id/:inviteToken', verifyInvite);

module.exports = router;