import { NotFoundException } from "../../common/utils/catch-errors";
import prisma from "../../database";


export class SessionService {
  public async getAllSession(userId: string) {
    // Get all sessions with Prisma
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiredAt: { gt: new Date() },
      },
      select: {
        id: true,
        userId: true,
        userAgent: true,
        createdAt: true,
        expiredAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      sessions,
    };
  }

  public async getSessionById(sessionId: string) {
    // Find session with Prisma and include user data
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
            enable2FA: true,
            emailNotification: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException("Session not found");
    }
    
    const { user } = session;

    return {
      user,
    };
  }

  public async deleteSession(sessionId: string, userId: string) {
    // Delete session with Prisma
    const deletedSession = await prisma.session.deleteMany({
      where: {
        id: sessionId,
        userId: userId,
      },
    });
    
    if (deletedSession.count === 0) {
      throw new NotFoundException("Session not found");
    }
    
    return;
  }
}