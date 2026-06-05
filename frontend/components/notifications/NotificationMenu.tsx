import { useEffect, useRef, useState } from "react";
import {
  acceptRoommateRequest,
  rejectRoommateRequest,
  RoommateRequest,
  UserProfile,
} from "@/lib/services/auth";

type NotificationTab = 'received' | 'sent' | 'connections';
type RequestAction = 'accept' | 'reject';

interface NotificationMenuProps {
  users: UserProfile[];
  sentRequests: RoommateRequest[];
  receivedRequests: RoommateRequest[];
  connections: RoommateRequest[];
  currentUserId: number;
  onRequestsChanged: () => Promise<void>;
}

function formatBudget(user: UserProfile) {
  if (user.min_budget == null && user.max_budget == null) {
    return 'Not specified';
  }

  if (user.min_budget != null && user.max_budget != null) {
    return `$${user.min_budget} - $${user.max_budget}`;
  }

  return user.min_budget != null ? `From $${user.min_budget}` : `Up to $${user.max_budget}`;
}

function formatQuietHours(user: UserProfile) {
  if (user.quiet_hours_from == null && user.quiet_hours_to == null) {
    return 'Not specified';
  }

  return `${user.quiet_hours_from ?? 'Any'} - ${user.quiet_hours_to ?? 'Any'}`;
}

export default function NotificationMenu({
  users,
  sentRequests,
  receivedRequests,
  connections,
  currentUserId,
  onRequestsChanged,
}: NotificationMenuProps) {
  const [notificationTab, setNotificationTab] = useState<NotificationTab>('received');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RoommateRequest | null>(null);
  const [actionInProgress, setActionInProgress] = useState<RequestAction | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const notificationMenuRef = useRef<HTMLDivElement | null>(null);

  const pendingReceivedCount = receivedRequests.filter(
    (request) => request.status === 'pending'
  ).length;

  const selectedUser = selectedRequest
    ? users.find((item) => item.id === selectedRequest.sender_id)
    : null;

  useEffect(() => {
    if (!isNotificationsOpen) {
      return;
    }

    function handleDocumentClick(event: MouseEvent) {
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false);
        setSelectedRequest(null);
      }
    }

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isNotificationsOpen]);

  async function handleRequestAction(action: RequestAction) {
    if (!selectedRequest) {
      return;
    }

    try {
      setActionInProgress(action);
      setActionMessage(null);

      if (action === 'accept') {
        await acceptRoommateRequest(selectedRequest.id, currentUserId);
        setNotificationTab('connections');
      } else {
        await rejectRoommateRequest(selectedRequest.id, currentUserId);
        setNotificationTab('received');
      }

      await onRequestsChanged();
      setSelectedRequest(null);
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to update request.');
    } finally {
      setActionInProgress(null);
    }
  }

  return (
    <div ref={notificationMenuRef} className="relative">
      <button
        type="button"
        aria-label="Open request notifications"
        onClick={() => setIsNotificationsOpen((current) => !current)}
        className="relative inline-flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus:ring-offset-gray-900 [&::-webkit-details-marker]:hidden"
      >
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
            d="M14.857 17.082a2.25 2.25 0 0 1-4.714 0M18 8.25a6 6 0 0 0-12 0c0 7-3 7.5-3 7.5h18s-3-.5-3-7.5Z"
          />
        </svg>
        {pendingReceivedCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
            {pendingReceivedCount}
          </span>
        ) : null}
      </button>

      {isNotificationsOpen ? (
        <div className="absolute right-0 z-10 mt-3 w-96 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Request center</p>
            <span className="text-xs text-gray-500 dark:text-gray-400">{pendingReceivedCount} pending</span>
          </div>

          <div className="mb-3 grid grid-cols-3 gap-2">
            {(['received', 'sent', 'connections'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setNotificationTab(tab)}
                className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                  notificationTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tab === 'received' ? 'Received' : tab === 'sent' ? 'Sent' : 'Connections'}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-72 overflow-auto">
            {notificationTab === 'received' && (
              <div>
                {receivedRequests.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No received requests.</p>
                ) : (
                  receivedRequests.map((request) => {
                    const sender = users.find((item) => item.id === request.sender_id);
                    return (
                      <button
                        key={request.id}
                        type="button"
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionMessage(null);
                        }}
                        className="block w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-left text-sm transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-950 dark:hover:border-blue-700 dark:hover:bg-blue-950"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">{sender?.username || 'Unknown user'}</p>
                        <p className="text-gray-500 dark:text-gray-400">Request status: {request.status}</p>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {notificationTab === 'sent' && (
              <div>
                {sentRequests.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No requests sent yet.</p>
                ) : (
                  sentRequests.map((request) => {
                    const receiver = users.find((item) => item.id === request.receiver_id);
                    return (
                      <div key={request.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-950">
                        <p className="font-medium text-gray-900 dark:text-white">{receiver?.username || 'Unknown user'}</p>
                        <p className="text-gray-500 dark:text-gray-400">Request status: {request.status}</p>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {notificationTab === 'connections' && (
              <div>
                {connections.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No accepted connections yet.</p>
                ) : (
                  connections.map((request) => {
                    const otherUser = users.find(
                      (item) => item.id === (request.sender_id === currentUserId ? request.receiver_id : request.sender_id)
                    );
                    return (
                      <div key={request.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-950">
                        <p className="font-medium text-gray-900 dark:text-white">{otherUser?.username || 'Matched user'}</p>
                        <p className="text-gray-500 dark:text-gray-400">Connected successfully</p>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {selectedRequest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  Roommate request
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {selectedUser?.username || 'Unknown user'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedUser?.email || 'No email available'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            {selectedUser ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                  <span className="font-semibold">Age:</span> {selectedUser.age || 'Not specified'}
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                  <span className="font-semibold">Occupation:</span> {selectedUser.occupation || 'Not specified'}
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                  <span className="font-semibold">Phone:</span> {selectedUser.phone_number || 'Not specified'}
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                  <span className="font-semibold">Diet:</span> {selectedUser.diet || 'Not specified'}
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                  <span className="font-semibold">Budget:</span> {formatBudget(selectedUser)}
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                  <span className="font-semibold">Cleanliness:</span> {selectedUser.cleanliness || 'Not specified'}
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                  <span className="font-semibold">Social:</span> {selectedUser.social_interaction || 'Not specified'}
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                  <span className="font-semibold">Quiet hours:</span> {formatQuietHours(selectedUser)}
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                  <span className="font-semibold">Smoking:</span>{' '}
                  {selectedUser.smoking_preference === true
                    ? 'Smoker'
                    : selectedUser.smoking_preference === false
                      ? 'Non-smoker'
                      : 'Not specified'}
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200">
                  <span className="font-semibold">Zip code:</span> {selectedUser.zip_code || 'Not specified'}
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200 sm:col-span-2">
                  <span className="font-semibold">Location:</span> {selectedUser.city || 'N/A'}
                  {selectedUser.state ? `, ${selectedUser.state}` : ''}
                  {selectedUser.country ? `, ${selectedUser.country}` : ''}
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200 sm:col-span-2">
                  <span className="font-semibold">Address:</span> {selectedUser.street_address || 'Not specified'}
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200 sm:col-span-2">
                  <span className="font-semibold">Interests:</span> {selectedUser.interests || 'Not specified'}
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200 sm:col-span-2">
                  <span className="font-semibold">Allergies:</span> {selectedUser.allergies?.join(', ') || 'Not specified'}
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-200 sm:col-span-2">
                  <span className="font-semibold">Description:</span> {selectedUser.description || 'Not specified'}
                </div>
              </div>
            ) : (
              <p className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-950 dark:text-gray-300">
                User details are not available.
              </p>
            )}

            {actionMessage ? (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                {actionMessage}
              </p>
            ) : null}

            <div className="mt-5 flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
              <button
                type="button"
                onClick={() => handleRequestAction('reject')}
                disabled={actionInProgress !== null || selectedRequest.status !== 'pending'}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                aria-label="Reject request"
              >
                ✕
              </button>
              <button
                type="button"
                onClick={() => handleRequestAction('accept')}
                disabled={actionInProgress !== null || selectedRequest.status !== 'pending'}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
                aria-label="Accept request"
              >
                ✓
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
