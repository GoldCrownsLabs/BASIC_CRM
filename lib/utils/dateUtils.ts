// lib/utils/dateUtils.ts

export const normalizeDate = (
  date: string | Date | undefined,
): string | undefined => {
  if (!date) return undefined;
  if (date instanceof Date) {
    return date.toISOString();
  }
  return date;
};

export const normalizeUserDates = (user: any): any => {
  if (!user) return user;

  return {
    ...user,
    lastLogin: normalizeDate(user.lastLogin),
    createdAt: normalizeDate(user.createdAt),
    updatedAt: normalizeDate(user.updatedAt),
    lastSync: normalizeDate(user.lastSync),
    joinDate: normalizeDate(user.joinDate),
  };
};
