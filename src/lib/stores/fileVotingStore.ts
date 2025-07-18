import { promises as fs } from 'fs';
import { join } from 'path';
import { createVotingStore } from './votingStore';

const STORE_PATH = join(process.cwd(), 'voting-session.json');

export async function loadVotingStore() {
  try {
    const data = await fs.readFile(STORE_PATH, 'utf-8');
    const obj = JSON.parse(data);
    const store = createVotingStore();
    if (obj.session) {
      // Rehydrate session (dates as Date objects)
      const session = obj.session;
      session.startTime = new Date(session.startTime);
      session.endTime = new Date(session.endTime);
      session.createdAt = new Date(session.createdAt);
      session.updatedAt = new Date(session.updatedAt);
      for (const round of session.rounds) {
        round.startTime = new Date(round.startTime);
        round.endTime = new Date(round.endTime);
        for (const vote of round.votes) {
          vote.timestamp = new Date(vote.timestamp);
        }
      }
      store.restoreSession(session);
    }
    return store;
  } catch {
    return createVotingStore();
  }
}

export async function saveVotingStore(store: ReturnType<typeof createVotingStore>) {
  const session = store.getSession();
  await fs.writeFile(STORE_PATH, JSON.stringify({ session }), 'utf-8');
} 