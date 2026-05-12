import { PrismaClient } from "@prisma/client";

// En enda delad PrismaClient för hela appen — varje ny instans öppnar
// en egen connection pool, så vi exporterar samma instans överallt.
const prisma = new PrismaClient()

export default prisma
