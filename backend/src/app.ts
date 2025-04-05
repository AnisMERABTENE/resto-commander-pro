import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './modules/auth/auth.routes'
import testRoutes from './modules/test/test.routes'
import produitRoutes from './modules/produits/produit.routes'
import tableRoutes from './modules/tables/table.routes'
import commandeRoutes from './modules/commandes/commande.routes'
import analyticsRoutes from './modules/analytics/analytics.routes'; // NOUVEAU
import inventoryRoutes from './modules/inventory/inventory.routes'; // NOUVEAU






dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/test', testRoutes)
app.use('/api/produits', produitRoutes)
app.use('/api/tables', tableRoutes)
app.use('/api/commandes', commandeRoutes)
app.use('/api/analytics', analyticsRoutes); // NOUVEAU
app.use('/api/inventory', inventoryRoutes); // NOUVEAU





// TODO: routes ici plus tard

app.get('/', (_, res) => {
  res.send('✅ Backend up and running')
})

export default app
