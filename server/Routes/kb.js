const { getDoc, getKB } = require("../Controllers/kb");

const router = require("express").Router();

router.get('/:orgId/:projId', getKB);
router.get('/doc/:orgId/:docId', getDoc);

module.exports = router;
