const { verifyAccessToken } = require("../Controllers/auth");
const { getMembers, inviteMember, ResendInviteMail, deleteMember } = require("../Controllers/member");

const router = require("express").Router();

router.get('/:projId', verifyAccessToken, getMembers);

router.post('/:projId/invite', verifyAccessToken, inviteMember);

router.post('/:projId/reinvite', verifyAccessToken, ResendInviteMail);

router.delete('/:userId', verifyAccessToken, deleteMember);

module.exports = router;