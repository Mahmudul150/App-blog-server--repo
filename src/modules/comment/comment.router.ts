import express from 'express'
import { commentControl } from './comment.controller'
import auth from '../../middleware/authmid'
import { USERROLE } from '../../globaly type/type'



const router = express.Router()

router.post('/', 
    auth(USERROLE.ADMIN,USERROLE.USER),
      commentControl.createComment)

router.get(
    '/:commentId',
     commentControl.getCommentById)

router.get(
    '/authorId/:authorId',
    commentControl.getauthorId)

router.delete(
    '/:commentId',
    auth(USERROLE.USER, USERROLE.ADMIN),
    commentControl.deleteComment)

router.patch(
    '/:commentId',
    auth(USERROLE.USER,USERROLE.ADMIN),
    commentControl.updateComment)
  

    router.patch(
    '/:commentId/moderate',
    auth(USERROLE.ADMIN),
    commentControl.modarateComment)
    
export const commentRouter  = router