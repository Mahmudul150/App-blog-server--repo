import { NextFunction, Request, Response } from "express"
import { Prisma } from "../generated/prisma/client"

function errorHandler (err:any, req:Request, res:Response, next:NextFunction) {
    
    let statusCode = 500
    let errormessage = "Internal server error"
    let errorDetails = err 
    //PrismaClientValidationErro
    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400
        errormessage ='You provide incorrect field type of missing fields'
    }

    // PrismaClientKnownRequestError

    else if(err instanceof Prisma.PrismaClientKnownRequestError){
        if (err.code === "P2025") {
            statusCode = 400;
            errormessage = "An operation failed because it depends on one or more records that were required but not found."
        }
        else if (err.code === "P2002") {
         statusCode = 400;
         errormessage = "Unique constraint failed on the {constraint}"   
        }
        else if(err.code ==="P2003"){
            statusCode=400;
            errormessage = "Foreign key constraint failed on the field"
        }
    }

    else if(err instanceof Prisma.PrismaClientInitializationError){
        if (err.errorCode === "P1000") {
            statusCode = 400;
            errormessage = "Authentication failed . Please check your creditable"
        }
        else if(err.errorCode === "P1001"){
            statusCode = 404;
            errormessage = "Can't reach database server"
        }
    }

  res.status(statusCode)
  res.json({
    message:errormessage,
    error:errorDetails
  })
}

export default errorHandler