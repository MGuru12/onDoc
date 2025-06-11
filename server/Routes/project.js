const { verifyAccessToken } = require("../Controllers/auth");
const { addProj, getAllProj, delProj } = require("../Controllers/project");

const router = require("express").Router();

router.get('/', (req,res) => {
    res.json({message: "Projects"})
});

router.get('/all', verifyAccessToken, getAllProj);

router.post('/', verifyAccessToken, addProj);

router.delete('/', verifyAccessToken, delProj);

module.exports = router;