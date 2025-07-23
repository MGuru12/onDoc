const router = require("express").Router();
const { verifyAccessToken } = require("../Controllers/auth");
const {addProjAdmin, removeProjAdmin, addOrgAdmin, removeOrgAdmin} = require("../Controllers/admin");

router.post('/addProjAdmin/:projId', verifyAccessToken, addProjAdmin);

router.delete('/removeProjAdmin/:projId/:userId', verifyAccessToken, removeProjAdmin);

router.post('/addOrgAdmin', verifyAccessToken, addOrgAdmin);

router.delete('/removeOrgAdmin/:usrId', verifyAccessToken, removeOrgAdmin);

module.exports = router;
