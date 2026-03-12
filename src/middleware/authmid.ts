// import { NextFunction, Request, Response } from "express"
// import {auth as betterAuth} from '../lib/auth'
// import { USERROLE } from "../globaly type/type";

// const auth = (...roles: USERROLE[])=>{
//     return async (req:Request,res:Response,next:NextFunction)=>{
//         console.log(roles);
//         // next()
//         //!SECTION get user session
//         const session = await betterAuth.api.getSession({
//              headers: req.headers as any,
//         })
//         console.log(session); 
//         if (!session) {
//             return res.status(400).json({
//                 success:false,
//                 message:"You are not authorized"
//             })

//         }
//         if (!session.user.emailVerified) {
//             return res.status(401).json({
//                 success:false,
//                 message:"Email verification is required. Please verify is your Email!"
//             })
//         }

//         req.user = {
//             id:session.user.id,
//             name:session.user.name,
//             email:session.user.email,
//             role:session.user.role as string,
//             emailverified:session.user.emailVerified

//         }

//         if (roles.length && !roles.includes(req.user.role as USERROLE)) {
//               return res.status(401).json({
//                 success:false,
//                 message:"Forbidden! you don't have a permission to access this resources"
//             })
//         }
//         next()
//     }
// }
// export default auth

import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from '../lib/auth';
import { USERROLE } from "../globaly type/type";

const auth = (...roles: USERROLE[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        console.log("Required roles: ", roles);

        // Get user session
        try {
            const session = await betterAuth.api.getSession({
                headers: req.headers as any,
            });
            console.log("Session: ", session);

            // Check if session exists
            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: "You are not authorized"
                });
            }

            // Check if email is verified
            if (!session.user.emailVerified) {
                return res.status(401).json({
                    success: false,
                    message: "Email verification is required. Please verify your email!"
                });
            }

            // Add user to request object
            req.user = {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                role: session.user.role as string,
                emailverified: session.user.emailVerified
            };
            console.log("User role:", req.user.role);
console.log("Allowed roles:", roles);
            // Check if user has permission for specific roles
            if (roles.length && !roles.includes(req.user.role as USERROLE)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden! You don't have permission to access this resource"
                });
            }

            // If everything checks out, proceed to next middleware
            next();
        } catch (error) {
            console.error("Error during auth:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error during authentication"
            });
        }
    };
}

export default auth;