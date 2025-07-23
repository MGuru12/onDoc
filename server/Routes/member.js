const { verifyAccessToken } = require("../Controllers/auth");
const { getMembers, inviteMember, ResendInviteMail, deleteMember, getProjOwnerDetails, getMyDetailsProj } = require("../Controllers/member");

const router = require("express").Router();

router.get('/owner', verifyAccessToken, getProjOwnerDetails);

router.get('/mydetails/:projId', verifyAccessToken, getMyDetailsProj);

router.get('/:projId', verifyAccessToken, getMembers);

router.post('/:projId/invite', verifyAccessToken, inviteMember);

router.post('/:projId/reinvite', verifyAccessToken, ResendInviteMail);

router.delete('/:userId', verifyAccessToken, deleteMember);

module.exports = router;