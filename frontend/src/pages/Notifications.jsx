import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  Ticket,
  MessageSquare,
  UserPlus,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Notifications = () => {
  const { accessToken } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const authConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/notifications",
        authConfig
      );

      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchNotifications();
    }
  }, [accessToken]);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(
        `/notifications/${notificationId}/read`,
        {},
        authConfig
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "ticket_assigned":
        return <UserPlus size={19} />;

      case "comment_added":
        return <MessageSquare size={19} />;

      case "status_changed":
        return <Clock size={19} />;

      case "ticket_resolved":
      case "ticket_closed":
        return <Check size={19} />;

      default:
        return <Ticket size={19} />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="notifications-page">

      <div className="notifications-header">
        <div className="notifications-title">
          <div className="notifications-icon">
            <Bell size={23} />
          </div>

          <div>
            <span className="page-eyebrow">
              UPDATES
            </span>

            <h1>Notifications</h1>

            <p>
              Stay updated on your tickets and support activity.
            </p>
          </div>
        </div>

        {notifications.length > 0 && (
          <span className="notification-count">
            {notifications.filter((item) => !item.isRead).length} unread
          </span>
        )}
      </div>

      <div className="notifications-container">

        {loading ? (
          <div className="notifications-loading">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="empty-bell">
              <Bell size={30} />
            </div>

            <h2>You're all caught up</h2>

            <p>
              New ticket updates and activity will appear here.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${
                !notification.isRead ? "unread" : ""
              }`}
            >
              <div className="notification-item-icon">
                {getIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-top">
                  <h3>{notification.message}</h3>

                  {!notification.isRead && (
                    <span className="unread-dot"></span>
                  )}
                </div>

                {notification.ticket && (
                  <button
                    className="notification-ticket"
                    onClick={() =>
                      window.location.href = `/tickets/${notification.ticket._id}`
                    }
                  >
                    <Ticket size={14} />
                    {notification.ticket.title}
                  </button>
                )}

                <span className="notification-time">
                  {formatDate(notification.createdAt)}
                </span>
              </div>

              {!notification.isRead && (
                <button
                  className="mark-read-button"
                  onClick={() => markAsRead(notification._id)}
                  title="Mark as read"
                >
                  <Check size={17} />
                </button>
              )}
            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default Notifications;