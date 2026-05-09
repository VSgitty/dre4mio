import { Router, type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

export interface AuthRequest extends Request {
  userId?: string;
  user?: unknown;
}

// Auth middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    (req as any).user = user;
    next();
  });
};

// Sign up
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // TODO: Implement user creation with Supabase
    res.json({ message: 'User created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Sign in
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // TODO: Implement authentication with Supabase
    const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '24h',
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    // TODO: Implement token refresh
    res.json({ token: 'new-token' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

export default router;
