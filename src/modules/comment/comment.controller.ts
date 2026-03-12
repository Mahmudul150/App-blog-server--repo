import e, { Request, Response,  } from "express";
import { commentService } from "./comment.service";
import { prisma } from "../../lib/prisma";

const createComment = async(req:Request,res:Response) =>{
    try {

        const user = req.user
        req.body.authorId = user?.id

        const result = await commentService.createComment(req.body)
        res.status(200).json(result)
    } catch (error) {
        res.status(404).json({
            success:false,
            message:'Comment is not created'
        })
    }
}

const getCommentById = async(req:Request ,res:Response)=>{
    try {
        const {commentId} = req.params 
        const result = await commentService.getCommentById(commentId as string )
        res.status(200).json(result)
    } catch (error) {
            res.status(404).json({
            success:false,
            message:'Comment is not found'
        })
    }
}
const getauthorId = async(req:Request ,res:Response)=>{
    try {
        const {authorId} = req.params 
        const result = await commentService.getauthorId(authorId as string )
        res.status(200).json(result)
    } catch (error) {
            res.status(404).json({
            success:false,
            message:'authorId comment is not found'
        })
    }
}
const deleteComment = async(req:Request ,res:Response)=>{
    try {
        const user = req.user
        const {commentId} = req.params
        const result = await commentService.deleteComment(commentId as string ,user?.id as string) 
        res.status(200).json(result)
    } catch (error) {
            res.status(404).json({
            success:false,
            message:'comment is not deleted'
        })
    }
}

const updateComment = async(req:Request ,res:Response)=>{
    try {
        const user = req.user
        const {commentId} = req.params
        const result = await commentService.updateComment(commentId as string ,user?.id as string,req.body) 
        res.status(200).json(result)
    } catch (error) {
            res.status(404).json({
            success:false,
            message:'comment is not deleted'
        })
    }
}
//ANCHOR - modarateor handling user comment


const modarateComment = async(req:Request ,res:Response)=>{
    try {
        const {commentId} = req.params
        const result = await commentService.modarateComment(commentId as string ,req.body ) 
        res.status(200).json(result)
    } catch (error) {
        const errormessage = (error instanceof Error) ? error.message : 'comment updated filed '
            res.status(404).json({
            success:false,
            message: errormessage
        })
    }
}
export const commentControl = {
    createComment,
    getCommentById,
    getauthorId,
    deleteComment,
    updateComment,
    modarateComment
}