import { Request, Response } from 'express'
import * as authService from './auth.service'


export const register = async (req: Request, res: Response) => {
  try {
    const tokens = await authService.register(req.body)
    res.status(201).json(tokens)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const tokens = await authService.login(req.body)
    res.json(tokens)
  } catch (err: any) {
    res.status(401).json({ error: err.message })
  }
}
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    res.status(400).json({ error: 'Token manquant' })
    return
  }

  try {
    const tokens = await authService.refreshToken(refreshToken)
    res.json(tokens)
  } catch (err: any) {
    res.status(403).json({ error: err.message })
  }
}
