const { verifyAccessToken } = require("../Controllers/auth");
const { getMembers, inviteMember, ResendInviteMail, deleteMember, getProjOwnerDetails, getMyDetailsProj, getAllUsers, verifyMember, removeUserFromOrg, verifyUser } = require("../Controllers/member");

const router = require("express").Router();

router.get('/all', verifyAccessToken, getAllUsers);

router.get('/owner', verifyAccessToken, getProjOwnerDetails);

router.get('/verify/:projId', verifyAccessToken, verifyMember);

router.get('/verify/user/:userId', verifyAccessToken, verifyUser);

router.get('/mydetails/:projId', verifyAccessToken, getMyDetailsProj);

router.get('/:projId', verifyAccessToken, getMembers);

router.post('/:projId/invite', verifyAccessToken, inviteMember);

router.post('/:projId/reinvite', verifyAccessToken, ResendInviteMail);

router.delete('/:userId', verifyAccessToken, deleteMember);

router.delete('/remove/:userId', verifyAccessToken, removeUserFromOrg);

module.exports = router;