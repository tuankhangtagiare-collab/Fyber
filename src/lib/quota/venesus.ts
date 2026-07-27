import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MAX_CHAT_REQUESTS = 50; // Arbitrary quota for demo

export async function enforceQuota(anonymousToken: string, type: 'chat' | 'image' | 'video'): Promise<boolean> {
  if (!anonymousToken) return false;

  let quota = await prisma.userQuota.findUnique({
    where: { anonymousToken },
  });

  if (!quota) {
    quota = await prisma.userQuota.create({
      data: { anonymousToken },
    });
  }

  if (type === 'chat') {
    if (quota.requestCount >= MAX_CHAT_REQUESTS) {
      return false;
    }
    await prisma.userQuota.update({
      where: { anonymousToken },
      data: { requestCount: { increment: 1 }, lastRequestAt: new Date() },
    });
    return true;
  }
  
  // Handlers for image/video quotas can be added here
  return true;
}

export async function getUsage(anonymousToken: string) {
  if (!anonymousToken) return null;
  return await prisma.userQuota.findUnique({
    where: { anonymousToken },
  });
}
