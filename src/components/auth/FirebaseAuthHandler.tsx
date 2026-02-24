
'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

/**
 * Handles automatic anonymous authentication for new players.
 * This ensures that hooks like useUser() and useFirestore() have 
 * an authenticated context as soon as possible.
 */
export function FirebaseAuthHandler() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // Only attempt anonymous sign-in if we've finished checking 
    // the initial auth state and no user is present.
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  // This component doesn't render anything UI-related.
  return null;
}
