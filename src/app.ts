import express from 'express'
import { postRouter } from './modules/post.router';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import cors from 'cors'
import { commentRouter } from './modules/comment/comment.router';
import errorHandler from './middleware/globalyErrorHandling';
import notfound from './middleware/not found';
const app = express()

app.use(cors({
    origin:process.env.APP_URL || "http://localhost:4000", //ANCHOR - client side url
    credentials:true
}))

app.use(express.json());
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use('/posts',postRouter)
app.use('/comments',commentRouter)

app.get('/',async(req,res)=>{
    res.send('hellow world')
    
})
 
app.use(notfound)
app.use(errorHandler)

export default app

// 1 ---> express install korlam 
// 2----> app.use diye middleware create korlam jate data gula aste pare
//3 ---> better auth theke app.all aita copy kore anci

//4 ---> CORS = Cross-Origin Resource Sharing