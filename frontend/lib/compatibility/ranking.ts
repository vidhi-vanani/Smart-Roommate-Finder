import { UserProfile } from '@/lib/services/auth';
import { calculateCosineCompatibility } from './cosine';

export function sortUsersByCompatibility(currentUser: UserProfile | null, users: UserProfile[]) {
  return [...users].sort((firstUser, secondUser) => {
    const firstScore = calculateCosineCompatibility(currentUser, firstUser) ?? -1;
    const secondScore = calculateCosineCompatibility(currentUser, secondUser) ?? -1;
    return secondScore - firstScore;
  });
}
