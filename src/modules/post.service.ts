// import { Post, PostStatus } from "../generated/prisma/client";
// import { PostWhereInput } from "../generated/prisma/models";
// import { prisma } from "../lib/prisma";
import { CommentStatus, Post, PostStatus } from "../generated/prisma/client";
import { PostWhereInput } from "../generated/prisma/models";
import { prisma } from "../lib/prisma";

const postCreate = async(data:Omit<Post, 'id' | 'createdAt' | 'updatedAt' |'authorId'> , userId:string) =>{
    const result = await prisma.post.create({
        data:{
            ...data,
            authorId:userId
        }
    })
    return result
}
//ANCHOR - post get

const allPostGet = async({
    search,
    tags,
    isFeatured,
    status,
    authorId,
    page,
    limit,
    skip,
    sortBy,
    sortOrder
}:{
    search: string | undefined ,
    tags: string[] | [],
    isFeatured: boolean | undefined,
    status: PostStatus | undefined,
    authorId: string | undefined,
    page:number,
    limit:number,
    skip:number,
    sortBy:string ,
    sortOrder:string 
},)=>{

    const andCondition:PostWhereInput[]  = []

    if (search) {
        andCondition.push( {  OR:[
         {title:{
            contains: search as string,
            mode:'insensitive'
        } },
        {content:{
             contains:  search as string,
            mode:'insensitive'
        }},{
            tags:{
                has: search as string
            }
        }
       ]})
       
    }

    if (tags.length > 0) {
        andCondition.push( {tags:{
        hasEvery: tags as string[]
       }})
    }

    if (typeof isFeatured === 'boolean') {
        andCondition.push({
            isFeatured
        })
    }

    if (status) {
        andCondition.push({
            status
        })
    }

    if (authorId) {
        andCondition.push({
            authorId
        })
    }

    
const result = await prisma.post.findMany({
   take:limit,
   skip:skip,
    where:{
      AND: andCondition  
    },
//    [ orderBy: sortBy && sortOrder ? {
//         [sortBy] : sortOrder
//     } : {createdAt :'asc'}]

orderBy:{
    [sortBy]:sortOrder
},
include:{
    _count:{
        select:{comments:true}
    }
}
})

const total = await prisma.post.count({
    where:{
        AND:andCondition
    }
})
return {
    data:result,
    pagination:{
        total,
        page,
        limit,
        totalPage: Math.ceil(total/limit)
    }
}
}

const getPostById = async (postId:string ) =>{

    const result = await prisma.$transaction(async (tx) =>{ //[Transaction কেন ব্যবহার করা হয়? একাধিক database operation একসাথে safe ভাবে করতে যদি কোন operation fail করে → সব rollback হবে]
         await tx.post.update({
        where:{
           id: postId
        },
        data:{
            viewsCount:{
                increment:1
            }
        }
    })

    const postData = await tx.post.findUnique({
        where:{
            id:postId
        },
        include:{
            comments:{ // parante id null thakle ta dekhar jonno ai proceess ta use korte hoy
                where:{
                    parentId:null
                },
                orderBy:{
                    createdAt:'desc'
                },
                include:{//akta commment r nested replays dekhar jonno ai process ta use korte obe
                    replies:{
                        include:{
                            replies:true
                        }
                    }
                }
            },
            _count:{ // koyta comment korci seta dekhar jonoo count use korte hobe
                select:{comments:true}
            }
             
        },
        
    })
    return postData
    })
    
    return result
}

const getMyPosts = async(authorId:string)=>{

    await prisma.user.findUniqueOrThrow({
        where:{
            id:authorId,
            status:"ACTIVE"
        },
        select:{
            id:true
        }
    })

    const result = await prisma.post.findMany({
        where:{
            authorId
        },
        orderBy:{
            createdAt:"desc"
        },
        include:{
            _count:{
                select:{
                    comments:true
                }
            }
        }
    })

    // const total = await prisma.post.aggregate({
    //    _count:{
    //     id:true
    //    }
    // })

    return {
        data:result
    }
}


const updatePost = async(postId:string , data:Partial<Post> ,authorId:String,isAdmin:boolean)=>{
    const postData = await prisma.post.findUniqueOrThrow({ // aikhane jodi post pawa na jay tahole akta error dibe r na hole nicer kaj gula korbe 
        where:{
            id:postId
        },
        select:{
            id:true,
            authorId:true,
            title:true,
            content:true

        }
    })
    // console.log(postData);
    
    if(!isAdmin && postData.authorId !== authorId) { // aikhe post jodi user r nijer post na hole aita ai error dibe
        throw new Error("You are not the owner/creator of the post")
    }
     
    if (!isAdmin) { // aikhane admin na hoy jodi user hoy tahole isFeatured aita update korete parbe na then ai isfeatured aita delete hoy jabe 
        delete data.isFeatured
    }
    const result = await prisma.post.update({
        where:{
            id:postId
        },
        data
    })
    return result
}


//!SECTION Post deleted 
const deletePost = async(postId:string, authorId:string ,isAdmin:boolean)=>{
    // console.log({postId ,authorId, isAdmin});

    const postData = await prisma.post.findUniqueOrThrow({
        where:{
            id:postId
        },
        select:{
            id:true,
            authorId:true,
            title:true,
            content:true

        }
    })

    console.log({postData});
    
    
    if(!isAdmin && postData.authorId !== authorId) { 
        throw new Error("You are not the owner/creator of the post")
    }
    
    const result = await prisma.post.delete({
        where:{
            id:postId
        }
    })
    return result
}

//!SECTION This api only can see Admin
//ANCHOR - Prisma Transaction ব্যবহার করা হয় যখন তুমি একাধিক database operation একসাথে execute করতে চাও এবং সবগুলো সফল না হলে কোনোটা-ই save হবে না। এটাকে বলে Atomic Operation। ⚙️

const getStatistics = async()=>{
  
    const result = await prisma.$transaction(async(tx)=>{

        //!SECTION custom way
        // const totalPost = await tx.post.count()

        // const publishedPost = await tx.post.count({
        //     where:{
        //         status:PostStatus.PUBLISHED
        //     }
        // })

        //  const draftPost = await tx.post.count({
        //     where:{
        //         status:PostStatus.DRAFT
        //     }
        // })

        //  const ArchivePost = await tx.post.count({
        //     where:{
        //         status:PostStatus.ARCHIVE
        //     }
        // })

        //!SECTION Organized way 
        const [
            totalPost, publishedPost, draftPost, ArchivePost , totalComment ,approvedStatus,rejectStatus, totalusers, adminCount ,userCount,totalViews] = await Promise.all([
            await tx.post.count(),
            await tx.post.count({ where:{ status:PostStatus.PUBLISHED } }),
            await tx.post.count({ where:{status:PostStatus.DRAFT  } }),
            await tx.post.count({where:{ status:PostStatus.ARCHIVE } }),
            await tx.comment.count(),
            await tx.comment.count({where:{status:CommentStatus.APPROVED}}),
            await tx.comment.count({where:{status:CommentStatus.REJECT}}),
            await tx.comment.count(),
            await tx.user.count({where:{role:"ADMIN"}}),
            await tx.user.count({where:{role:"USER"}}),
            await tx.post.aggregate({_sum:{viewsCount:true}})
            
        ])

        return {
            totalPost,
            ArchivePost,
            draftPost,
            publishedPost,
            totalComment,
            approvedStatus,
            rejectStatus,
            totalusers,
            adminCount,
            userCount,
            totalViews:totalViews._sum.viewsCount
        }
    })
    return result
}

export const PostService = {
    postCreate,
    allPostGet,
    getPostById,
    getMyPosts,
    updatePost,
    deletePost,
    getStatistics
}


//searching note:[ *** 1--> aikhane jodi title r upore search korte hole  sudu title r upore i korte hobe
// 2---> r jodi title content 2tar uporer korte hole tobe OR operator use kore 2takei  korte hobe (ak kothay aker odik ke serching korte hole OR Operator use korte hoy) .
// 3---> r jodi 2 ta group ke aksathe kore search korte hole AND operator use korte hoy. For example[OR , tags]  *** ] 