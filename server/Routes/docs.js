const router = require("express").Router();
const { verifyAccessToken } = require("../Controllers/auth");
const { getDocs, createDoc, updateDoc, deleteDoc } = require("../Controllers/docs");

router.get('/', verifyAccessToken, getDocs);
router.post('/', verifyAccessToken, createDoc);
router.put('/:id', verifyAccessToken, updateDoc);
router.delete('/:id', verifyAccessToken, deleteDoc);

module.exports = router;
