import { GuildMember } from 'discord.js';

interface VerificationAttempt {
  userId: string;
  joinedAt: Date;
  attempts: number;
  lastAttempt?: Date;
}

class VerificationTracker {
  private verificationAttempts: Map<string, VerificationAttempt> = new Map();
  private readonly VERIFICATION_TIMEOUT = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_ATTEMPTS = 3;

  public trackNewMember(member: GuildMember): void {
    this.verificationAttempts.set(member.id, {
      userId: member.id,
      joinedAt: new Date(),
      attempts: 0
    });

    // Schedule cleanup after timeout
    setTimeout(() => this.handleTimeout(member), this.VERIFICATION_TIMEOUT);
  }

  public async handleVerificationAttempt(userId: string): Promise<boolean> {
    const attempt = this.verificationAttempts.get(userId);
    if (!attempt) return false;

    attempt.attempts++;
    attempt.lastAttempt = new Date();

    if (attempt.attempts > this.MAX_ATTEMPTS) {
      return false;
    }

    return true;
  }

  public async handleSuccessfulVerification(userId: string): Promise<void> {
    this.verificationAttempts.delete(userId);
  }

  private async handleTimeout(member: GuildMember): Promise<void> {
    const attempt = this.verificationAttempts.get(member.id);
    if (!attempt) return;

    // If user hasn't verified within timeout period
    if (!member.roles.cache.has(process.env.VERIFIED_ROLE_ID!)) {
      try {
        await member.send('Verification timeout reached. Please rejoin the server to try again.');
        await member.kick('Verification timeout reached');
      } catch (error) {
        console.error(`Failed to handle timeout for user ${member.id}:`, error);
      }
    }

    this.verificationAttempts.delete(member.id);
  }

  public getVerificationStatus(userId: string): VerificationAttempt | undefined {
    return this.verificationAttempts.get(userId);
  }
}

export const verificationTracker = new VerificationTracker();
