import { Request, Response, NextFunction } from "express";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ message: "Oturum açılmamış" });
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Oturum açılmamış" });
  }

  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, req.session.userId)
  });

  if (!user?.isAdmin) {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
  }

  next();
};
