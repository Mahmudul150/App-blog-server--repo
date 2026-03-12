import { error } from "better-auth/api"
import { prisma } from "../../lib/prisma"
import { CommentStatus } from "../../generated/prisma/enums"

const createComment = async(payload:{
    content:string,
    authorId:string,
    postId:string,
    parentId?:string
})=>{

    //  await prisma.comment.findUniqueOrThrow({
    //     where:{
    //         id:payload.postId
    //     }
    // })
    // if (payload.parentId) {
    //     await prisma.comment.findFirstOrThrow({
    //         where:{
    //             id:payload.parentId 
    //         }
    //     })
    // }

    
    
   const result = await prisma.comment.create({
    data:payload
   })
    return result
}


const getCommentById = async(commentId:string ) =>{
    // console.log('Found the comment By Id',{commentId});
    const result = await prisma.comment.findUnique({
        where:{
            id:commentId
        },
        include:{
            post:{
                select:{
                    id:true,
                    content:true,
                    title:true,
                    viewsCount:true
                }
            }
        }
    })
    return result   
}

const getauthorId = async(authorId :string)=>{
//  console.log('authorId',authorId);
const result = await prisma.comment.findMany({
    where:{
        authorId
    },
  include:{
    post:{
        select:{
            title:true,
            content:true
        }
    }
  }
   
    
})
  return result
}

// 1 user nijr comment delete korte parbe
// 2 login thakte hobe 
//user a nijer commment kina ta chack korte hobe
const deleteComment = async(commentId:string , authorId:string)=>{
    // console.log('delete comment',{commentId , authorId});
    const commentData = await prisma.comment.findFirst({
        where:{
            id:commentId,
            authorId,

        }
    })
     if (!commentData) {
        throw new Error("there is no comment in your id")
     }
    
     const result = await prisma.comment.delete({
        where:{
            id:commentData.id
        }
     })
    return result 

}


const updateComment = async(commentId:string , authorId:string , data:{content:string,status:CommentStatus})=>{
    // console.log({commentId ,authorId,data});

    const commentData = await prisma.comment.findFirst({
        where:{
            id:commentId,
            authorId,

        },
        select:{
            id:true
        }
    })
     if (!commentData) {
        throw new Error("there is no comment in your id")
     }
    
    const result =  await prisma.comment.update({
        where:{
            id:commentId,
            authorId
        },
        data
     })
    return result
}
//ANCHOR - modarator handling user comment
const modarateComment = async(id:string , data:{status:CommentStatus})=>{
    // console.log('modaretor reject your comment',{id,data});
    const commmentData = await prisma.comment.findFirstOrThrow({
        where:{
            id
        }
    })

    if (commmentData.status === data.status) {
        throw new Error(`your provide status (${data.status}) is already up to date `)
    }

    return await prisma.comment.update({
        where:{
            id
        },
        data
    })
}

export  const commentService={
createComment,
getCommentById,
getauthorId,
deleteComment,
updateComment,
modarateComment
}
