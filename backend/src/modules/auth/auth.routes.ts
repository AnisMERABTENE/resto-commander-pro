import { Router } from 'express'
import * as authCtrl from './auth.controller'

const router = Router()

router.post('/register', authCtrl.register)
router.post('/login', authCtrl.login)
router.post('/refresh', authCtrl.refresh)

export default router
