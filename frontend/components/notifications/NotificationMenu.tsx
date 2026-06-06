import { useEffect, useRef, useState } from "react";
import {
  acceptRoommateRequest,
  getMessages,
  getUnreadMessageCounts,
  markMessagesRead,
  Message,
  rejectRoommateRequest,
  RoommateRequest,
  sendMessage,
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

  const formatHour = (hour: number | null | undefined) => {
    if (hour == null) {
      return 'Any';
    }

    if (hour === 0) {
      return '12 AM';
    }

    if (hour < 12) {
      return `${hour} AM`;
    }

    if (hour === 12) {
      return '12 PM';
    }

    return `${hour - 12} PM`;
  };

  return `${formatHour(user.quiet_hours_from)} - ${formatHour(user.quiet_hours_to)}`;
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
  const [selectedChatUser, setSelectedChatUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [actionInProgress, setActionInProgress] = useState<RequestAction | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const notificationMenuRef = useRef<HTMLDivElement | null>(null);

  const pendingReceivedCount = receivedRequests.filter(
    (request) => request.status === 'pending'
  ).length;
  const unreadMessageCount = Object.values(unreadCounts).reduce(
    (total, count) => total + count,
    0
  );
  const notificationBadgeCount = pendingReceivedCount + unreadMessageCount;

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
        setSelectedChatUser(null);
      }
    }

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isNotificationsOpen]);

  useEffect(() => {
    async function loadUnreadCounts() {
      try {
        const counts = await getUnreadMessageCounts(currentUserId);
        setUnreadCounts(
          counts.reduce<Record<number, number>>((total, item) => {
            total[item.user_id] = item.unread_count;
            return total;
          }, {})
        );
      } catch (error) {
        console.error('Unable to load unread message counts', error);
      }
    }

    loadUnreadCounts();
  }, [currentUserId, connections]);

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

  async function openChat(user: UserProfile) {
    try {
      setSelectedChatUser(user);
      setMessageError(null);
      setMessageText('');
      setMessages(await getMessages(currentUserId, user.id));
      await markMessagesRead(currentUserId, user.id);
      setUnreadCounts((current) => ({
        ...current,
        [user.id]: 0,
      }));
    } catch (error) {
      setMessages([]);
      setMessageError(error instanceof Error ? error.message : 'Unable to load messages.');
    }
  }

  async function handleSendMessage() {
    if (!selectedChatUser || !messageText.trim()) {
      return;
    }

    try {
      setIsSendingMessage(true);
      setMessageError(null);
      await sendMessage(currentUserId, selectedChatUser.id, messageText);
      setMessageText('');
      setMessages(await getMessages(currentUserId, selectedChatUser.id));
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : 'Unable to send message.');
    } finally {
      setIsSendingMessage(false);
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
        {notificationBadgeCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
            {notificationBadgeCount}
          </span>
        ) : null}
      </button>

      {isNotificationsOpen ? (
        <div className="absolute right-0 z-10 mt-3 w-96 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Request center</p>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {pendingReceivedCount} pending
              {unreadMessageCount > 0 ? ` · ${unreadMessageCount} new message${unreadMessageCount > 1 ? 's' : ''}` : ''}
            </span>
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
                {tab === 'received' ? 'Received' : tab === 'sent' ? 'Sent' : (
                  <span className="inline-flex items-center gap-1">
                    Connections
                    {unreadMessageCount > 0 ? (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                        notificationTab === tab ? 'bg-white text-blue-600' : 'bg-red-600 text-white'
                      }`}>
                        {unreadMessageCount}
                      </span>
                    ) : null}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="max-h-72 space-y-3 overflow-auto">
            {notificationTab === 'received' && (
              <div className="space-y-3">
                {receivedRequests.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No received requests.</p>
                ) : (
                  [...receivedRequests]
                    .sort((firstRequest, secondRequest) => {
                      if (firstRequest.status === 'pending' && secondRequest.status !== 'pending') {
                        return -1;
                      }

                      if (firstRequest.status !== 'pending' && secondRequest.status === 'pending') {
                        return 1;
                      }

                      return secondRequest.id - firstRequest.id;
                    })
                    .map((request) => {
                    const sender = users.find((item) => item.id === request.sender_id);
                    const isNewRequest = request.status === 'pending';
                    return (
                      <button
                        key={request.id}
                        type="button"
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionMessage(null);
                        }}
                        className={`block w-full rounded-2xl border p-3 text-left text-sm transition hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-700 dark:hover:bg-blue-950 ${
                          isNewRequest
                            ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/60'
                            : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-950'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className={`${isNewRequest ? 'font-bold' : 'font-medium'} text-gray-900 dark:text-white`}>
                            {sender?.username || 'Unknown user'}
                          </p>
                          {isNewRequest ? (
                            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              New request
                            </span>
                          ) : null}
                        </div>
                        <p className={`${isNewRequest ? 'font-semibold text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          Request status: {request.status}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {notificationTab === 'sent' && (
              <div className="space-y-3">
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
              <div className="space-y-3">
                {connections.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No accepted connections yet.</p>
                ) : (
                  connections.map((request) => {
                    const otherUser = users.find(
                      (item) => item.id === (request.sender_id === currentUserId ? request.receiver_id : request.sender_id)
                    );
                    const unreadCount = otherUser ? unreadCounts[otherUser.id] || 0 : 0;
                    return (
                      <div key={request.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-950">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 dark:text-white">{otherUser?.username || 'Matched user'}</p>
                              {unreadCount > 0 ? (
                                <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                                  {unreadCount} new
                                </span>
                              ) : null}
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">
                              {unreadCount > 0 ? `New message from ${otherUser?.username || 'this user'}` : 'Connected successfully'}
                            </p>
                          </div>
                          {otherUser ? (
                            <button
                              type="button"
                              onClick={() => openChat(otherUser)}
                              className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                            >
                              Message
                            </button>
                          ) : null}
                        </div>
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
                className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                aria-label="Reject request"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleRequestAction('accept')}
                disabled={actionInProgress !== null || selectedRequest.status !== 'pending'}
                className="inline-flex items-center justify-center rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
                aria-label="Accept request"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedChatUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl bg-white p-5 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  Messages
                </p>
                <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedChatUser.username}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChatUser(null)}
                className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="min-h-64 flex-1 space-y-3 overflow-auto rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  No messages yet. Start the conversation.
                </p>
              ) : (
                messages.map((message) => {
                  const isMine = message.sender_id === currentUserId;
                  return (
                    <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                          isMine
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-800 shadow-sm dark:bg-gray-800 dark:text-gray-100'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {messageError ? (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                {messageError}
              </p>
            ) : null}

            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="min-w-0 flex-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={isSendingMessage || !messageText.trim()}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
