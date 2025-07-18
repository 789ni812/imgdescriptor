import { createVotingStore } from './votingStore';

// Singleton voting store instance
// This ensures all API routes use the same store instance
let sharedVotingStore: ReturnType<typeof createVotingStore> | null = null;

export function getSharedVotingStore() {
  if (!sharedVotingStore) {
    sharedVotingStore = createVotingStore();
    console.log('Created new shared voting store instance');
  }
  return sharedVotingStore;
}

export function resetSharedVotingStore() {
  sharedVotingStore = createVotingStore();
  console.log('Reset shared voting store instance');
  return sharedVotingStore;
} 