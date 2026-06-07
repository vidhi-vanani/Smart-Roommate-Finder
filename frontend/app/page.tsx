"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getAllUsers,
  getUserById,
  sendRoommateRequest,
  getSentRequests,
  getReceivedRequests,
  getConnections,
  RoommateRequest,
  UserProfile,
} from "@/lib/services/auth";
import API_BASE_URL from "@/lib/services/apiConfig";
import NotificationMenu from "@/components/notifications/NotificationMenu";
import {
  calculateCosineCompatibility,
  sortUsersByCompatibility,
} from "@/lib/compatibility";

const dietOptions = [
  'Vegetarian',
  'Non-veg',
  'Vegan',
  'Pescatarian',
  'No preference',
];

const allergyOptions = [
  'Nuts',
  'Gluten free',
  'Soy',
  'Wheat',
  'Egg',
  'Dairy',
  'Shellfish',
  'No allergies',
  'Other',
];

const cleanlinessOptions = [
  'Clean room once a week',
  'Clean room twice a week',
  'Clean shared spaces daily',
  'Deep clean monthly',
  'Flexible',
];

const socialInteractionOptions = [
  'No interaction',
  'Medium interaction',
  'A lot of interaction',
];

const stateOptions = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
];

const quietHourOptions = Array.from({ length: 24 }, (_, index) => ({
  value: index,
  label: index === 0 ? '12 AM' : index < 12 ? `${index} AM` : index === 12 ? '12 PM' : `${index - 12} PM`,
}));

function formatHour(value: string) {
  if (!value) return 'Any';
  const hour = Number(value);
  if (Number.isNaN(hour)) return 'Any';
  return hour === 0
    ? '12 AM'
    : hour < 12
    ? `${hour} AM`
    : hour === 12
    ? '12 PM'
    : `${hour - 12} PM`;
}

function getStoredCurrentUserId() {
  if (typeof window === 'undefined') {
    return 0;
  }
  return Number(window.localStorage.getItem('smart_roommate_user_id') || '0');
}

function getStoredPhotoPreview() {
  if (typeof window === 'undefined') {
    return null;
  }

  const userId = getStoredCurrentUserId();
  const previewKey = userId
    ? `smart_roommate_photo_preview_${userId}`
    : 'smart_roommate_photo_preview';
  return window.localStorage.getItem(previewKey);
}

export default function Home() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [dietFilter, setDietFilter] = useState('');
  const [occupationFilter, setOccupationFilter] = useState('');
  const [smokingFilter, setSmokingFilter] = useState('');
  const [allergiesFilter, setAllergiesFilter] = useState<string[]>([]);
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [minBudgetFilter, setMinBudgetFilter] = useState('');
  const [maxBudgetFilter, setMaxBudgetFilter] = useState('');
  const [quietFromFilter, setQuietFromFilter] = useState('22');
  const [quietToFilter, setQuietToFilter] = useState('7');
  const [cleanlinessFilter, setCleanlinessFilter] = useState('');
  const [socialFilter, setSocialFilter] = useState('');
  const [interestsFilter, setInterestsFilter] = useState('');
  const [currentUserId] = useState(getStoredCurrentUserId);
  const [sentRequests, setSentRequests] = useState<RoommateRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<RoommateRequest[]>([]);
  const [connections, setConnections] = useState<RoommateRequest[]>([]);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const [sendingRequestIds, setSendingRequestIds] = useState<number[]>([]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const sendingRequestIdsRef = useRef(new Set<number>());
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const refreshRequests = useCallback(async (userId: number) => {
    try {
      const [sent, received, connected] = await Promise.all([
        getSentRequests(userId),
        getReceivedRequests(userId),
        getConnections(userId),
      ]);
      setSentRequests(sent);
      setReceivedRequests(received);
      setConnections(connected);
    } catch (loadError) {
      console.error('Unable to load request data', loadError);
    }
  }, []);

  useEffect(() => {
    const storedCurrentUserId = currentUserId;

    const previewKey = storedCurrentUserId
      ? `smart_roommate_photo_preview_${storedCurrentUserId}`
      : 'smart_roommate_photo_preview';

    async function loadCurrentUserPhoto() {
      if (!storedCurrentUserId) {
        return;
      }
      try {
        const currentUser = await getUserById(storedCurrentUserId);
        setCurrentUserProfile(currentUser);
        if (currentUser.profile_photo) {
          const fullUrl = currentUser.profile_photo.startsWith('http')
            ? currentUser.profile_photo
            : `${API_BASE_URL}${currentUser.profile_photo}`;
          setPhotoPreview(fullUrl);
          window.localStorage.setItem(previewKey, fullUrl);
        }
      } catch {
        // ignore current user photo fetch errors for now
      }
    }

    async function loadUsers() {
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers.filter((user) => user.id !== storedCurrentUserId));
        if (storedCurrentUserId) {
          await refreshRequests(storedCurrentUserId);
        }
      } catch (loadError) {
        console.error('Unable to load users', loadError);
      }
    }

    loadCurrentUserPhoto();
    loadUsers();
  }, [currentUserId, refreshRequests]);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    function handleDocumentClick(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isProfileMenuOpen]);

  const filteredUsers = useMemo(() => {
    const matchingUsers = users.filter((user) => {
      const text = `${user.username} ${user.email} ${user.age ?? ''} ${user.diet ?? ''} ${user.occupation ?? ''}`.toLowerCase();
      const termMatch = text.includes(searchTerm.trim().toLowerCase());
      const dietMatch = dietFilter ? user.diet === dietFilter : true;
      const occupationMatch = occupationFilter ? user.occupation === occupationFilter : true;
      const smokingMatch = smokingFilter
        ? String(user.smoking_preference) === smokingFilter
        : true;
      // Allergies filter: require that user has all selected allergies
      let allergiesMatch = true;
      if (Array.isArray(allergiesFilter) && allergiesFilter.length > 0) {
        const requested = allergiesFilter.map((s) => s.trim().toLowerCase()).filter(Boolean);
        const userAllergies = (user.allergies || []).map((a) => String(a).toLowerCase());
        allergiesMatch = requested.every((req) => userAllergies.includes(req));
      }

      const cityMatch = cityFilter
        ? (user.city || '').toLowerCase().includes(cityFilter.trim().toLowerCase())
        : true;
      const stateMatch = stateFilter ? user.state === stateFilter : true;

      // Budget overlap check
      const selectedMin = minBudgetFilter ? Number(minBudgetFilter) : null;
      const selectedMax = maxBudgetFilter ? Number(maxBudgetFilter) : null;
      let budgetMatch = true;
      if (selectedMin !== null || selectedMax !== null) {
        const uMin = user.min_budget ?? null;
        const uMax = user.max_budget ?? null;
        if (uMin === null && uMax === null) {
          budgetMatch = true;
        } else {
          const sMin = selectedMin ?? Number.MIN_SAFE_INTEGER;
          const sMax = selectedMax ?? Number.MAX_SAFE_INTEGER;
          const userMin = uMin ?? Number.MIN_SAFE_INTEGER;
          const userMax = uMax ?? Number.MAX_SAFE_INTEGER;
          budgetMatch = !(userMax < sMin || userMin > sMax);
        }
      }

      // Quiet hours overlap (handles wrap-around midnight)
      let quietMatch = true;
      if (quietFromFilter || quietToFilter) {
        const sFrom = quietFromFilter ? Number(quietFromFilter) : 0;
        const sTo = quietToFilter ? Number(quietToFilter) : 23;
        const uFrom = user.quiet_hours_from ?? 0;
        const uTo = user.quiet_hours_to ?? 23;

        const ranges = (start: number, end: number) =>
          start <= end ? [[start, end]] : [[start, 23], [0, end]];

        const sRanges = ranges(sFrom, sTo);
        const uRanges = ranges(uFrom, uTo);

        quietMatch = sRanges.some((sr) =>
          uRanges.some((ur) => !(ur[1] < sr[0] || sr[1] < ur[0]))
        );
      }

      // Cleanliness and social
      const cleanlinessMatch = cleanlinessFilter ? (user.cleanliness || '') === cleanlinessFilter : true;
      const socialMatch = socialFilter ? (user.social_interaction || '') === socialFilter : true;

      // Interests substring match (any of comma-separated)
      let interestsMatch = true;
      if (interestsFilter.trim()) {
        const reqs = interestsFilter.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
        const uInterests = (user.interests || '').toLowerCase();
        interestsMatch = reqs.every((r) => uInterests.includes(r));
      }

      return (
        termMatch &&
        dietMatch &&
        occupationMatch &&
        smokingMatch &&
        allergiesMatch &&
        cityMatch &&
        stateMatch &&
        budgetMatch &&
        quietMatch &&
        cleanlinessMatch &&
        socialMatch &&
        interestsMatch
      );
    });

    return sortUsersByCompatibility(currentUserProfile, matchingUsers);
  }, [
    users,
    currentUserProfile,
    searchTerm,
    dietFilter,
    occupationFilter,
    smokingFilter,
    allergiesFilter,
    cityFilter,
    stateFilter,
    minBudgetFilter,
    maxBudgetFilter,
    quietFromFilter,
    quietToFilter,
    cleanlinessFilter,
    socialFilter,
    interestsFilter,
  ]);

  async function handleSendRequest(receiverId: number) {
    if (!currentUserId) {
      setRequestMessage('Please log in to send a request.');
      return;
    }

    if (sendingRequestIdsRef.current.has(receiverId)) {
      return;
    }

    const user = users.find((profile) => profile.id === receiverId);
    if (user && isRequestButtonDisabled(user)) {
      setRequestMessage(getRequestButtonLabel(user));
      return;
    }

    sendingRequestIdsRef.current.add(receiverId);
    setSendingRequestIds((ids) => [...ids, receiverId]);

    try {
      setRequestMessage(null);
      await sendRoommateRequest(currentUserId, receiverId);
      await refreshRequests(currentUserId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send request.';
      if (message === 'A request is already pending') {
        await refreshRequests(currentUserId);
        setRequestMessage('Request is already pending.');
      } else {
        setRequestMessage(message);
      }
    } finally {
      sendingRequestIdsRef.current.delete(receiverId);
      setSendingRequestIds((ids) => ids.filter((id) => id !== receiverId));
    }
  }

  function getRequestButtonLabel(user: UserProfile) {
    const isConnected = connections.some(
      (request) => request.status === 'accepted' && (request.receiver_id === user.id || request.sender_id === user.id)
    );

    if (isConnected) {
      return 'Connected';
    }

    if (sentRequests.some((request) => request.receiver_id === user.id && request.status === 'pending')) {
      return 'Request sent';
    }

    if (receivedRequests.some((request) => request.sender_id === user.id && request.status === 'pending')) {
      return 'Pending response';
    }

    return 'Send request';
  }

  function isRequestButtonDisabled(user: UserProfile) {
    return (
      connections.some(
        (request) => request.status === 'accepted' && (request.receiver_id === user.id || request.sender_id === user.id)
      ) ||
      sentRequests.some((request) => request.receiver_id === user.id && request.status === 'pending') ||
      receivedRequests.some((request) => request.sender_id === user.id && request.status === 'pending') ||
      sendingRequestIds.includes(user.id)
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">
      <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold tracking-normal">
            Smart Roommate Finder
          </Link>

          <div className="flex items-center gap-5">
            <NotificationMenu
              users={users}
              sentRequests={sentRequests}
              receivedRequests={receivedRequests}
              connections={connections}
              currentUserId={currentUserId}
              onRequestsChanged={() => refreshRequests(currentUserId)}
            />

            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                aria-label="Open profile menu"
                onClick={() => setIsProfileMenuOpen((current) => !current)}
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
              </button>

              {isProfileMenuOpen ? (
                <div className="absolute right-0 z-10 mt-3 w-44 rounded-md border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  <Link
                    href="/preferences"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Logout
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Home</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Browse roommate profiles and preferences.
            </p>
            {requestMessage ? (
              <p className="mt-2 rounded-lg border border-gray-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                {requestMessage}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <button
              type="button"
              onClick={() => setShowFilter((current) => !current)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Filters
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full min-w-[220px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {showFilter && (
          <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowFilter(false)}
            />

            <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-gray-900 md:rounded-3xl">
              <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-800">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Filter preferences</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Find roommate matches by lifestyle, location, and budget.
                  </p>
                </div>
                <button
                  aria-label="Close filters"
                  onClick={() => setShowFilter(false)}
                  className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto px-6 py-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Diet
                  <select
                    value={dietFilter}
                    onChange={(event) => setDietFilter(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">All diets</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-veg">Non-veg</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Pescatarian">Pescatarian</option>
                    <option value="No preference">No preference</option>
                  </select>
                </label>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Occupation
                  <select
                    value={occupationFilter}
                    onChange={(event) => setOccupationFilter(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">All occupations</option>
                    <option value="Student">Student</option>
                    <option value="Worker">Worker</option>
                    <option value="Remote worker">Remote worker</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Smoking preference
                  <select
                    value={smokingFilter}
                    onChange={(event) => setSmokingFilter(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">All smoking preferences</option>
                    <option value="true">Smoker</option>
                    <option value="false">Non-smoker</option>
                  </select>
                </label>
                
                <div className="col-span-full rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/60">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Allergies</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {allergyOptions.map((option) => (
                      <label
                        key={option}
                        className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                          allergiesFilter.includes(option)
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={allergiesFilter.includes(option)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setAllergiesFilter((current) => {
                              const next = new Set(current);
                              if (option === 'No allergies') {
                                if (checked) {
                                  return ['No allergies'];
                                }
                                next.delete('No allergies');
                              } else {
                                if (checked) {
                                  next.delete('No allergies');
                                  next.add(option);
                                } else {
                                  next.delete(option);
                                }
                              }
                              return Array.from(next);
                            });
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  City
                  <input
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    placeholder="e.g. New York"
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </label>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  State
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">All states</option>
                    {stateOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="col-span-full rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget range</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ${minBudgetFilter || '500'} – ${maxBudgetFilter || '1500'}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Min
                      <input
                        type="range"
                        min="0"
                        max="2900"
                        step="50"
                        value={minBudgetFilter || '500'}
                        onChange={(e) => {
                          const nextMinBudget = Math.min(Number(e.target.value), 2900);
                          const currentMaxBudget = Number(maxBudgetFilter || '1500');
                          const minimumMaxBudget = nextMinBudget + 100;

                          setMinBudgetFilter(String(nextMinBudget));
                          if (minimumMaxBudget > currentMaxBudget) {
                            setMaxBudgetFilter(String(minimumMaxBudget));
                          }
                        }}
                        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg border-0 bg-gray-200 outline-none transition dark:bg-gray-700"
                      />
                      <div className="mt-1 flex justify-between text-xs text-gray-500">
                        <span>$0</span>
                        <span>$2,900</span>
                      </div>
                    </label>

                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Max
                      <input
                        type="range"
                        min="0"
                        max="3000"
                        step="50"
                        value={maxBudgetFilter || '1500'}
                        onChange={(e) => {
                          const nextMaxBudget = Number(e.target.value);
                          const currentMinBudget = Number(minBudgetFilter || '500');
                          const maximumMinBudget = nextMaxBudget - 100;

                          setMaxBudgetFilter(e.target.value);
                          if (maximumMinBudget < currentMinBudget) {
                            setMinBudgetFilter(String(maximumMinBudget));
                          }
                        }}
                        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg border-0 bg-gray-200 outline-none transition dark:bg-gray-700"
                      />
                      <div className="mt-1 flex justify-between text-xs text-gray-500">
                        <span>$0</span>
                        <span>$3,000</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="col-span-full rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quiet hours</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatHour(quietFromFilter)} – {formatHour(quietToFilter)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      From
                      <select
                        value={quietFromFilter}
                        onChange={(e) => setQuietFromFilter(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      >
                        <option value="">Any</option>
                        {quietHourOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      To
                      <select
                        value={quietToFilter}
                        onChange={(e) => setQuietToFilter(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      >
                        <option value="">Any</option>
                        {quietHourOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cleanliness
                  <select
                    value={cleanlinessFilter}
                    onChange={(e) => setCleanlinessFilter(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">Select cleanliness</option>
                    {cleanlinessOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Social interaction
                  <select
                    value={socialFilter}
                    onChange={(e) => setSocialFilter(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">Select social interaction</option>
                    {socialInteractionOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Interests (comma separated)
                  <input
                    value={interestsFilter}
                    onChange={(e) => setInterestsFilter(e.target.value)}
                    placeholder="e.g. gaming, cooking"
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </label>
              </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
                <button
                  type="button"
                  onClick={() => {
                    setDietFilter('');
                    setOccupationFilter('');
                    setSmokingFilter('');
                    setAllergiesFilter([]);
                    setCityFilter('');
                    setStateFilter('');
                    setMinBudgetFilter('');
                    setMaxBudgetFilter('');
                    setQuietFromFilter('22');
                    setQuietToFilter('7');
                    setCleanlinessFilter('');
                    setSocialFilter('');
                    setInterestsFilter('');
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilter(false)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Set preferences
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-5">
          {filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              No roommate profiles found.
            </div>
          ) : (
            filteredUsers.map((user) => {
              const compatibilityScore = calculateCosineCompatibility(currentUserProfile, user);

              return (
              <div key={user.id} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
                  <div className="shrink-0">
                    <div className="h-24 w-24 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                      {user.profile_photo ? (
                        <img
                          src={user.profile_photo.startsWith('http') ? user.profile_photo : `${API_BASE_URL}${user.profile_photo}`}
                          alt={`${user.username} profile`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-gray-700 dark:text-gray-300">
                          {user.username
                            .split(' ')
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0]?.toUpperCase())
                            .join('')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user.username}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                      <div
                        className="mt-3 flex h-20 w-20 shrink-0 items-center justify-center rounded-full sm:mt-0"
                        style={{
                          background: `conic-gradient(#2563eb ${compatibilityScore ?? 0}%, #e5e7eb 0)`,
                        }}
                        aria-label={compatibilityScore === null ? 'Compatibility not available' : `${compatibilityScore}% compatibility`}
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-lg font-bold text-blue-700 dark:bg-gray-900 dark:text-blue-300">
                          {compatibilityScore === null ? 'N/A' : `${compatibilityScore}%`}
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                      Age {user.age ?? 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 px-5 py-4 dark:border-gray-700">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                      <span className="font-semibold">Diet:</span> {user.diet || 'Not specified'}
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                      <span className="font-semibold">Cleanliness:</span> {user.cleanliness || 'Not specified'}
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                      <span className="font-semibold">Social:</span> {user.social_interaction || 'Not specified'}
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                      <span className="font-semibold">Occupation:</span> {user.occupation || 'Not specified'}
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                      <span className="font-semibold">Smoking:</span> {user.smoking_preference === true ? 'Smoker' : user.smoking_preference === false ? 'Non-smoker' : 'Not specified'}
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                      <span className="font-semibold">Location:</span> {user.city || 'N/A'}{user.state ? `, ${user.state}` : ''}{user.country ? `, ${user.country}` : ''}
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200 sm:col-span-2 lg:col-span-1">
                      <span className="font-semibold">Interests:</span> {user.interests || 'Not specified'}
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200 sm:col-span-2 lg:col-span-1">
                      <span className="font-semibold">Allergies:</span> {user.allergies?.join(', ') || 'Not specified'}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-5 py-4 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Ready to reach out?</span>
                    <button
                      type="button"
                      onClick={() => handleSendRequest(user.id)}
                      disabled={isRequestButtonDisabled(user)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isRequestButtonDisabled(user)
                          ? 'cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {getRequestButtonLabel(user)}
                    </button>
                  </div>
                </div>
              </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
