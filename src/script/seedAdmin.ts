import { USERROLE } from "../globaly type/type";
import { prisma } from "../lib/prisma";


async function seedAdmin() {
 try { // admin Seeding started
    const adminData ={
        name:"Maruf ",
        email:"marufsf@gmail.com",
        password:"maruf8548",
        role:USERROLE.ADMIN
    }

    const existuser = await prisma.user.findUnique({
        where:{
            email:adminData.email
           
        }
    })

    // chacking admin exist or not
    if (existuser) {
        throw new Error("User Already Exist")
    }

    //Admin Created
    const signUpAdmin = await fetch('http://localhost:5000/api/auth/sign-up/email',{
       method: 'POST',
        headers:{
           'Content-Type': 'application/json',
           "Origin": "http://localhost:4000"
        },
        body: JSON.stringify(adminData)
    })

    console.log(signUpAdmin);
   
    //email verification stutus on update
    if (signUpAdmin.ok) {
        await prisma.user.update({
            where:{
                email:adminData.email
            },
            data:{
                emailVerified:true
            }
        })
    }

 } catch (error) {
    console.log('error :',error);
    
 }   
}

seedAdmin()