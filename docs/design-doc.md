# Design Document — Kinger Meat

**Projekt:** Kinger Meat — webbutik för viltkött  
**Kurs:** Backend-programmering med Node.js, YH  
**Datum:** Maj 2026

---

## Bakgrund och syfte

Kinger Meat är en e-handel för vilt — hjort, älg och vildsvin — jagat av Peter Jonsson i Sörmland.
Syftet med projektet är att bygga ett komplett backend-API med tillhörande frontend som hanterar produkter,
kategorier, lager och varukorg.

---

## Databasdesign

### Entiteter

**Category**
| Kolumn      | Typ     | Beskrivning                     |
|-------------|---------|----------------------------------|
| id          | Int     | Primärnyckel                     |
| name        | String  | Visningsnamn (t.ex. "Hjort")     |
| slug        | String  | URL-vänlig nyckel (t.ex. "hjort") |
| description | String? | Valfri beskrivning               |

**Product**
| Kolumn      | Typ      | Beskrivning                          |
|-------------|----------|--------------------------------------|
| id          | Int      | Primärnyckel                         |
| name        | String   | Produktnamn (t.ex. "Hjortfilé")      |
| description | String?  | Valfri beskrivning                   |
| price       | Decimal  | Pris i SEK                           |
| weightGrams | Int      | Vikt i gram                          |
| stockQty    | Int      | Antal i lager                        |
| categoryId  | Int      | Främmande nyckel → Category          |
| createdAt   | DateTime | Skapelsedatum, auto-satt av Prisma   |

### Relation

En kategori har många produkter (1→N). Prisma hanterar relationen via `categoryId` på Product
och returnerar relaterad data med `include: { category: true }`.

---

## Arkitektur

Projektet använder en klassisk lagrad arkitektur:

```
routes/ → controllers/ → db/ (Prisma)
```

- **Routes** definierar URL-mönster och kopplar dem till controllers
- **Controllers** hanterar request/response-logik och validering
- **Prisma** är enda punkten för databasåtkomst

### Middleware-kedja (index.ts)

```
express.json() → cors() → requestLogger → routes → errorHandler
```

Varje request loggas med metod, URL, statuskod och svarstid. Fel fångas centralt av `errorHandler`
istället för att hanteras individuellt i varje controller.

---

## API-endpoints

| Metod | Endpoint                    | Beskrivning                          |
|-------|-----------------------------|--------------------------------------|
| GET   | /health                     | Hälsokontroll                        |
| GET   | /api/products               | Alla produkter med kategoridata      |
| GET   | /api/products?category=slug | Filtrerade produkter                 |
| GET   | /api/products/:id           | Enskild produkt                      |
| GET   | /api/categories             | Alla kategorier med produktantal     |
| GET   | /api/categories/:id         | En kategori med alla sina produkter  |
| GET   | /api/stats                  | Totalsiffror för produkter och lager |

---

## Tekniska val och motiveringar

### Prisma ORM
Valdes för typäkerhet — genererar TypeScript-typer direkt från schemat. Eliminerar
risken för felstavade kolumnnamn och ger autocomplete i editorn.

### Zod-validering
Alla inkommande parametrar valideras med Zod. `req.params.id` är alltid en sträng från Express —
Zod konverterar och validerar att det är ett positivt heltal innan det når databasen.

### AppError-klass
Skiljer medvetna HTTP-fel (400, 404) från oväntade serverfel (500). `errorHandler` loggar
bara 500-fel — inte t.ex. ett 404 för en produkt som inte finns.

### ESM med TypeScript
`"type": "module"` i package.json ger native ES modules. Importvägar skrivs med `.js`-ändelse
trots att källfilerna är `.ts` — Node.js ser den kompilerade outputen, inte källkoden.

---

## Frontend

React + Vite med TypeScript. Mörkt tema med guld-accenter — inspirerat av jakt och natur.

### Bildhantering

Produktbilder lagras som URL:er i `client/src/lib/images.ts` och matchas mot produktnamn
via hjälpfunktionen `getProductImage()`.

Funktionen normaliserar svenska tecken (é→e, ä→a, å→a, ö→o) och tar bort mellanslag
för att matcha bildnycklar:

```ts
"Hjortfilé" → "hjortfile"  → images.products.hjortfile
"Älgfilé"   → "algfile"    → images.products.algfile
```

**Förbättring i ett skarpt system:** Lägg till en `imageUrl`-kolumn direkt på Product-modellen
i databasen. Då returnerar API:et bildens URL som en del av produktdatan — ingen normalisering
behövs och nya produkter kan läggas till utan att ändra i frontend-koden.

### Varukorg

Hanteras med React Context + localStorage. Ingen backend-koppling — varukorgen lever i
webbläsaren och töms vid orderläggning (ej implementerat i detta projekt).

---

## Vad jag skulle gjort annorlunda

1. **imageUrl på Product** — se ovan. Frikopplar bildhantering från frontend-logik.
2. **Ordrar** — en Order/OrderItem-entitet hade gjort systemet komplett för en riktig e-handel.
3. **Auth** — admin-gränssnitt för att lägga till produkter och uppdatera lager kräver autentisering.
4. **Pagination** — `/api/products` returnerar alltid alla produkter. Med fler produkter behövs
   `?limit=20&offset=0`.

---

## Reflektion

Projektet gav en konkret förståelse för hur de olika lagren hänger ihop — från HTTP-request
till databas och tillbaka. Prisma tog bort mycket repetitivt SQL-skrivande, men det var
viktigt att förstå vad ORM:en faktiskt gör under huven.

Det svåraste var felhantering: att skilja på fel som *förväntas* (en produkt finns inte)
och fel som *inte borde hända* (databasanslutning tappad). AppError-mönstret löste det
på ett rent sätt.

TypeScript krävde mer tankekraft i början, men gav utdelning direkt — editorn varnar
innan koden ens körs.
