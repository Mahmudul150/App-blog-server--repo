import { Request, Response } from "express";


export default function notfound(req:Request, res:Response) {
    res.status(404).json({
        message:"Route are not Found !",
        path: req.originalUrl,
        date: Date()
    })
}