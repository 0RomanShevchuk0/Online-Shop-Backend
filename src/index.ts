import { app } from "./app"
import { env } from "./config/env"
import { connectToDatabase } from "./db/db"

const port = env.PORT

const startApp = async () => {
  await connectToDatabase()

  app.listen(port, () => {
    console.log(`App listening port ${port}`)
  })
}

startApp()
