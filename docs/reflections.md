# Reflektioner — Kinger Meat Backend

Saker jag lärt mig eller förstått djupare under projektet.
Uppdateras löpande.

---

## .ts-filer men .js i importen — varför?

**Insikt:** TypeScript-filer slutar på `.ts`, men när man importerar dem skriver man `.js` i importvägen:

```ts
import prisma from '../db/prisma.js'  // inte .ts
```

**Varför fungerar det?**

Node.js förstår inte TypeScript — det kör bara vanlig JavaScript. När `tsx` (dev) eller `tsc` (build) kompilerar projektet, omvandlas alla `.ts`-filer till `.js`-filer. Importvägen i koden måste peka på vad som faktiskt finns när koden körs — och det är `.js`.

Med ESM (`"type": "module"` i package.json) kräver Node.js dessutom att importvägar är exakta. Den gissar inte filändelse som CommonJS (`require`) gör.

**Kort regel:** Skriv alltid `.js` i imports, även om filen du pekar på heter `.ts`. TypeScript vet om det och löser upp det korrekt under kompileringen.

---

## Underscore-prefix på parametrar — `_req`, `_next`

**Insikt:** I TypeScript varnar kompilatorn om du deklarerar en parameter men aldrig använder den. Men ibland *måste* en parameter finnas i signaturen även om den inte används — t.ex. Express error-middleware som kräver exakt 4 parametrar.

Underscoren `_` i början är en konvention: *"Jag vet att den finns, jag väljer medvetet att inte använda den."* TypeScript accepterar det utan varning.

```ts
// Utan underscore → varning: 'req' is declared but never read
// Med underscore  → medvetet oanvänd, ingen varning
_req: Request
```

Fungerar också med bara `_` som namn, men `_req` / `_next` är tydligare.

---
