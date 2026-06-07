'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreatePage() {
  const router = useRouter();

  useEffect(() => {
    const storedUserId = window.localStorage.getItem('smart_roommate_user_id');

    if (!storedUserId) {
      router.replace('/login');
      return;
    }

    router.replace('/preferences');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 dark:from-gray-900 dark:to-gray-800">
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Redirecting...
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Please wait while we take you to the right page.
        </p>
      </div>
    </div>
  );
}
