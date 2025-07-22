const { verifyAccessToken } = require("../Controllers/auth");
const { addProj, getAllProj, delProj, getProjById, updateProj } = require("../Controllers/project");

const router = require("express").Router();

router.get('/', (req,res) => {
    res.json({message: "Projects"})
});

router.get('/all', verifyAccessToken, getAllProj);

router.get('/:projId', verifyAccessToken, getProjById);

router.put('/:projId/update', verifyAccessToken, updateProj);

router.post('/', verifyAccessToken, addProj);

router.delete('/', verifyAccessToken, delProj);

module.exports = router;