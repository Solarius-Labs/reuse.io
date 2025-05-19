import prisma from "../../database";


export class UserService {
  public async findUserById(userId: string) {
    // Find user with Prisma, excluding password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        enable2FA: true,
        emailNotification: true,
      }
    });
    
    return user || null;
  }
}