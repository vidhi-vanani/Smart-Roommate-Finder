"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem('smart_roommate_photo_preview');
    if (stored) {
      setPhotoPreview(stored);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">
      <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold tracking-normal">
            Smart Roommate Finder
          </Link>

          <details className="group relative">
            <summary
              aria-label="Open profile menu"
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-700 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900 [&::-webkit-details-marker]:hidden"
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile photo"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a8.25 8.25 0 0 1 15 0"
                  />
                </svg>
              )}
            </summary>

            <div className="absolute right-0 z-10 mt-3 w-44 rounded-md border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <Link
                href="/preferences"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Preference
              </Link>
              <Link
                href="/login"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Logout
              </Link>
            </div>
          </details>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">Home</h1>
      </main>
    </div>
  );
}
