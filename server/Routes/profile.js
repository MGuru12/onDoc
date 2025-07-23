const router = require("express").Router();
const { verifyAccessToken } = require("../Controllers/auth");
const { getProfile, updateProfile } = require("../Controllers/profile");

router.get('/', verifyAccessToken, getProfile);
router.put('/update', verifyAccessToken, updateProfile);

module.exports = router;
