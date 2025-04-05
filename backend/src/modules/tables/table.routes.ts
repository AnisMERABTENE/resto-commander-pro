import { Router } from 'express'
import * as tableCtrl from './table.controller'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'
import { guardByRole } from '../../shared/middlewares/role.guard'
import { Role } from '@prisma/client'

const router = Router()

router.get('/', authMiddleware, tableCtrl.getAllTables)
router.post('/', authMiddleware, guardByRole(Role.PATRON), tableCtrl.createTable)
router.put('/:id', authMiddleware, guardByRole(Role.PATRON), tableCtrl.updateTable)
router.delete('/:id', authMiddleware, guardByRole(Role.PATRON), tableCtrl.deleteTable)

export default router
