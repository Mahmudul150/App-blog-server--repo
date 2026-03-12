import app from "./app";
import { prisma } from "./lib/prisma";

const port = process.env.PORT || 5000

async function main() {
    try {
        await prisma.$connect()
        console.log('Connected to database successfully');
        
        app.listen(port,() =>{
            console.log(`server  is running on http://localhost:${port}`);
            
        })
    } catch (error) {
        console.log('prisma connected issue');
        await prisma.$disconnect();
        process.exit(1)
    }
}

main()

// 1---> server ts file a async function main() nilam
//2 ---> try catch block nilam  
            // a.. then prisma r sathe connect korlam
            // b.. app aita import korlam 
            // c... catch r bitor prisma disconect korelam
