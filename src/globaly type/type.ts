 declare global{
    namespace Express {
        interface Request{
            user?:{
                id:string;
                name:string;
                email:string;
                role:string;
                emailverified:boolean
            }
        }
    }
}

export enum USERROLE{
    USER="USER",
    ADMIN ="ADMIN"
}

