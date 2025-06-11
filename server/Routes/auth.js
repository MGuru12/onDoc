const { Login, Register, refreshAccessToken } = require("../Controllers/auth");

const router = require("express").Router();

router.get('/', (req,res) => {
    res.json({message: "Auth"})
});
router.post('/Register', Register);

router.post('/Login', Login);

router.post('/Refresh', refreshAccessToken)

module.exports = router;