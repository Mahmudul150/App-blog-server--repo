import express from 'express'
import { PostController } from './post.controler'
import auth from '../middleware/authmid'
import { USERROLE } from '../globaly type/type'

const router = express.Router()

router.get(
    '/stats',
auth(USERROLE.ADMIN),
PostController.getStatistics)

router.post(
    '/',
     auth(USERROLE.USER , USERROLE.ADMIN),
      PostController.postCreate)

router.get(
    '/',
    PostController.getAllPost
)

router.get(
    '/my-post',
    auth(USERROLE.USER,USERROLE.ADMIN),
    PostController.getMyPosts
)

router.get(
    '/:postId',
    PostController.getPostById
)
  
router.patch(
    '/:postId',
    auth(USERROLE.USER,USERROLE.ADMIN),
    PostController.updatePost
)

router.delete(
    '/:postId',
    auth(USERROLE.USER,USERROLE.ADMIN),
    PostController.deletePost
)
export const postRouter = router