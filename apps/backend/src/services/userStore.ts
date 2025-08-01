import { UserProfile } from "../types/UserProfile";

export class UserStore {
  private users = new Map<string, UserProfile>();

  async createUser(sessionId: string): Promise<UserProfile> {
    const user: UserProfile = {
      sessionId,
      notificationPreferences: {
        enabled: true,
        advanceNoticeMinutes: 60,
      },
    };

    this.users.set(sessionId, user);
    return user;
  }

  async getUser(sessionId: string): Promise<UserProfile | null> {
    return this.users.get(sessionId) || null;
  }

  async updateUser(
    sessionId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const existingUser = await this.getUser(sessionId);
    if (!existingUser) {
      throw new Error(`User with session ID ${sessionId} not found`);
    }

    const updatedUser: UserProfile = {
      ...existingUser,
      ...updates,
    };

    this.users.set(sessionId, updatedUser);
    return updatedUser;
  }

  async deleteUser(sessionId: string): Promise<void> {
    this.users.delete(sessionId);
  }

  async findUsersWithSMS(): Promise<UserProfile[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.smsPhoneNumber && user.notificationPreferences?.enabled
    );
  }

  async hasUser(sessionId: string): Promise<boolean> {
    return this.users.has(sessionId);
  }
}
