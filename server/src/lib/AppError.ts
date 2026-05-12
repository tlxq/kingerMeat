// Egen feltyp för förväntade fel (t.ex. 404 "Hittades inte", 400 "Ogiltig input").
// Kastas i controllers och fångas av errorHandler, som läser statusCode och
// svarar klienten — andra Error-objekt behandlas som oväntade serverfel (500).
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}
