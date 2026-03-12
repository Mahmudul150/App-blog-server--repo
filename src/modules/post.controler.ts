import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
// import { PostService } from "./post.service";
import { PostStatus } from "../generated/prisma/enums";
import paginationAndSortiong from "../helper/Pagination&sorting";
import { PostService } from "./post.service";
import { USERROLE } from "../globaly type/type";

const postCreate = async(req:Request ,res:Response ,next:NextFunction)=>{
    const user = req.user
    if (!user) {
        return res.status(404).json({
            success:false,
            message:"unauthorize"
        })
    }
    try {
        const result = await PostService.postCreate(req.body , user.id as string)
        console.log(req.body);
        
    res.status(201).json(result)
    } catch (error) {
       next(error)
    }
}

//!SECTION Post Get

const getAllPost = async(req:Request,res:Response)=>{
    try {
        const {search} = req.query; 
        const searchString = typeof search === 'string'? search : undefined
        console.log(searchString);
        
        const tags = req.query.tags ?  (req.query.tags as string).split(","):[]
        console.log(tags);
        
        const isFeatured = req.query.isFeatured 
        ? req.query.isFeatured === 'true'
         ? true  
         : req.query.isFeatured ==='false' 
         ? false 
         : undefined
         : undefined
        console.log(isFeatured);
        
        const status = req.query.status as PostStatus | undefined

        const authorId = req.query.authorId as string | undefined

    //   [  const page = Number(req.query.page ?? 1)
    //     const limit = Number(req.query.limit ?? 10)
    //     const skip = (page -1) * limit

    //     const sortBy = req.query.sortBy as string | undefined
    //     const sortOrder = req.query.sortOrder as string | undefined]


        // pagination & sorting agula controler a na kore , others file a create korlam and contrler file import korlam 
        const Options = paginationAndSortiong(req.query)
        const {page, limit,skip, sortBy, sortOrder} = Options
        
        const result = await PostService.allPostGet({search:searchString, tags ,isFeatured , status,authorId ,page , limit,skip,sortBy ,sortOrder})
        res.status(200).json({result})
    } catch (error) {
        res.status(400).json({
            error:'Post created fail',
            details:error
        })
    }
}

const getPostById = async (req: Request, res: Response) => {
  try {
    const  postId  = req.params.postId as string

    if (!postId) {
      throw new Error("Id is required")
    }

    const result = await PostService.getPostById(postId)

    res.status(200).json(result)

  } catch (error) {
    res.status(400).json({
      error: "Post fetch failed",
      details: error
    })
  }
}

const getMyPosts = async(req:Request,res:Response)=>{
    try {
        const user = req.user
        console.log('user 99 line :' , user);
        
        if (!user) {
            throw new Error('YOU are unauthorized !')
        }
        const result = await PostService.getMyPosts(user?.id as string)
         res.status(200).json(result)
    } catch (error) {
        console.log(error);
        
         res.status(400).json({
      error: "Post creation failed",
      details: error
    })
    }
}

const updatePost = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const user = req.user
        const {postId}=req.params
        
     
        if (!user) {
            throw new Error('You are unAuthorized')
        }
        const isAdmin = user.role === USERROLE.ADMIN //User admin kina seta chack korteci
         
        
        const result = await PostService.updatePost(postId as string, req.body,user.id ,isAdmin )
        res.status(201).json(result)
    } catch (error) {
               next(error)

    }
}


//!SECTION delete post

const deletePost = async(req:Request ,res:Response)=>{
    try {
           const user = req.user
        const {postId}=req.params
        
     
        if (!user) {
            throw new Error('You are unAuthorized')
        }
        const isAdmin = user.role === USERROLE.ADMIN //User admin kina seta chack korteci
         console.log({user,postId,isAdmin});
         
        
        const result = await PostService.deletePost(postId as string,user.id ,isAdmin )
        res.status(201).json(result)
    } catch (error) {
        const errormessage = (error instanceof Error) ? error.message : 'Post Delete failed'
         res.status(400).json({
      error: errormessage
      
    })
    }
}

//!SECTION  This api only can see Admin
const getStatistics = async(req:Request ,res:Response)=>{
    try {
        const result = await PostService.getStatistics()
        res.status(200).json(result)
    } catch (error) {
           const errormessage = (error instanceof Error) ? error.message : 'Post Delete failed'
         res.status(400).json({
      error: errormessage
      
    })
    }
}
export const PostController ={
    postCreate,
    getAllPost,
    getPostById,
    getMyPosts,
    updatePost,
    deletePost,
    getStatistics
}