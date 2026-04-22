// src/constants/FeatureFlags.ts

/**
 * Feature Flags Configuration Module
 * @module FeatureFlags
 * @description Centralized feature management system for controlling module availability
 *              and feature toggles across the entire application.
 * @version 2.0.0
 * @last_modified 2024-01-15
 */

// ============================================
// 🏠 DASHBOARD / HOME MODULE FEATURES
// ============================================
/**
 * Dashboard module availability
 * Controls entire dashboard module access
 */
export const MODULE_DASHBOARD = true;

/**
 * Display total leads count widget on dashboard
 * Shows aggregated lead metrics
 */
export const DASHBOARD_TOTAL_LEADS = true;

/**
 * Display total tasks count widget on dashboard
 * Shows task completion statistics
 */
export const DASHBOARD_TOTAL_TASKS = true;

/**
 * Display total contacts count widget on dashboard
 * Shows contact database size
 */
export const DASHBOARD_TOTAL_CONTACTS = true;

/**
 * Display upcoming meetings section on dashboard
 * Shows scheduled meetings for next 7 days
 */
export const DASHBOARD_UPCOMING_MEETINGS = true;

/**
 * Display today's events section on dashboard
 * Shows calendar events for current day
 */
export const DASHBOARD_TODAY_EVENTS = true;

/**
 * Display quick actions toolbar on dashboard
 * Provides shortcuts to common operations
 */
export const DASHBOARD_QUICK_ACTIONS = true;

/**
 * Display recent chat conversations widget
 * Shows last 5 chat interactions
 */
export const DASHBOARD_RECENT_CHAT = true;

/**
 * Enable real-time analytics updates on dashboard
 * Auto-refreshes analytics data every 30 seconds
 */
export const DASHBOARD_ANALYTICS_REALTIME = true;

/**
 * Display unread chat message counter
 * Shows badge with pending message count
 */
export const DASHBOARD_UNREAD_CHAT_COUNT = true;

/**
 * Enable notification bell icon on dashboard header
 * Provides access to system notifications
 */
export const DASHBOARD_NOTIFICATION_BELL = true;

// ============================================
// 📱 BOTTOM TAB NAVIGATION MODULES
// ============================================
/**
 * Home tab visibility in bottom navigation
 * Main landing page access point
 */
export const TAB_HOME = true;

/**
 * Leads management tab visibility
 * Access to lead tracking and management
 */
export const TAB_LEADS = true;

/**
 * Tasks management tab visibility
 * Access to task tracking system
 */
export const TAB_TASKS = true;

/**
 * Contacts management tab visibility
 * Access to contact database
 */
export const TAB_CONTACTS = true;

/**
 * Analytics dashboard tab visibility
 * Access to reporting and metrics
 */
export const TAB_ANALYTICS = true;

/**
 * Calendar management tab visibility
 * Access to scheduling system
 */
export const TAB_CALENDAR = true;

/**
 * User profile tab visibility
 * Access to account management
 */
export const TAB_PROFILE = true;

/**
 * Tools & utilities tab visibility
 * Extended functionality access
 * @disabled Currently disabled for performance optimization
 */
export const TAB_TOOLS = false;

// ============================================
// 📂 SIDEBAR / DRAWER NAVIGATION MODULES
// ============================================
/**
 * Dashboard link in sidebar navigation
 * Quick access to main dashboard
 */
export const SIDEBAR_DASHBOARD = true;

/**
 * Leads section in sidebar navigation
 * Comprehensive lead management access
 */
export const SIDEBAR_LEADS = true;

/**
 * Tasks section in sidebar navigation
 * Complete task management system
 */
export const SIDEBAR_TASKS = true;

/**
 * Contacts section in sidebar navigation
 * Full contact management features
 */
export const SIDEBAR_CONTACTS = true;

/**
 * Analytics section in sidebar navigation
 * Advanced reporting and insights
 */
export const SIDEBAR_ANALYTICS = true;

/**
 * Calendar section in sidebar navigation
 * Complete scheduling interface
 */
export const SIDEBAR_CALENDAR = true;

/**
 * Meeting scheduling module access
 * Video conferencing and meeting management
 */
export const SIDEBAR_MEETING_SCHEDULING = true;

/**
 * Chat support system access
 * Real-time customer support interface
 */
export const SIDEBAR_CHAT_SUPPORT = true;

/**
 * Email marketing module access
 * Campaign management and email automation
 */
export const SIDEBAR_EMAIL_SENDER = true;

/**
 * Reports generation module access
 * Custom report builder and export
 */
export const SIDEBAR_REPORTS = true;

/**
 * User activity tracking module
 * Audit logs and user behavior analytics
 */
export const SIDEBAR_ACTIVITIES = true;

/**
 * Data import/export utilities
 * Bulk data operations interface
 */
export const SIDEBAR_IMPORT_EXPORT = true;

/**
 * System configuration access
 * Application settings and preferences
 */
export const SIDEBAR_SETTINGS = true;

/**
 * Help & documentation center
 * User support and knowledge base
 */
export const SIDEBAR_HELP_SUPPORT = true;

/**
 * User profile management
 * Account settings and preferences
 */
export const SIDEBAR_PROFILE = true;

// ============================================
// 💬 CHAT SUPPORT MODULE FEATURES
// ============================================
/**
 * Real-time typing indicators in chat
 * Shows when user is composing message
 */
export const CHAT_REAL_TIME_TYPING = true;

/**
 * Image sharing capability in chat
 * Support for image attachments
 */
export const CHAT_IMAGE_SHARE = true;

/**
 * File sharing in chat conversations
 * Document and media attachment support
 */
export const CHAT_FILE_SHARE = true;

/**
 * Message deletion functionality
 * Allows users to remove sent messages
 */
export const CHAT_MESSAGE_DELETE = true;

/**
 * User blocking in chat system
 * Privacy and moderation control
 */
export const CHAT_BLOCK_USER = true;

/**
 * Push notifications for chat messages
 * Real-time alert system for new messages
 */
export const CHAT_PUSH_NOTIFICATION = true;

/**
 * Instant read receipt tracking
 * Real-time message read status updates
 */
export const CHAT_MARK_READ_INSTANT = true;

// ============================================
// ✉️ EMAIL SENDER MODULE FEATURES
// ============================================
/**
 * Email attachment support
 * File attachment capability in emails
 */
export const EMAIL_ATTACHMENT = true;

/**
 * Email template management
 * Pre-designed email layouts and snippets
 */
export const EMAIL_TEMPLATES = true;

/**
 * Bulk email sending capability
 * Mass email campaign management
 */
export const EMAIL_BULK_SEND = true;

/**
 * CC/BCC field support in emails
 * Advanced recipient management
 */
export const EMAIL_CC_BCC = true;

/**
 * BCC field hiding feature
 * Privacy protection for recipients
 */
export const EMAIL_BCC_HIDE = true;

// ============================================
// 📊 ANALYTICS MODULE FEATURES
// ============================================
/**
 * Top performer identification
 * Best performing agents/metrics detection
 */
export const ANALYTICS_TOP_PERFORMER = true;

/**
 * PDF report export functionality
 * Generate downloadable PDF reports
 */
export const ANALYTICS_PDF_EXPORT = true;

/**
 * Real-time analytics updates
 * Live data streaming and updates
 */
export const ANALYTICS_REAL_TIME = true;

/**
 * Month-over-month comparison
 * Trend analysis and growth tracking
 */
export const ANALYTICS_MONTHLY_COMPARISON = true;

/**
 * Lead conversion rate analytics
 * Funnel analysis and conversion tracking
 */
export const ANALYTICS_LEAD_CONVERSION = true;

// ============================================
// 📅 CALENDAR MODULE FEATURES
// ============================================
/**
 * Event reminder notifications
 * Automated reminder system for events
 */
export const CALENDAR_EVENT_REMINDER = true;

/**
 * Google Calendar synchronization
 * Two-way sync with Google Calendar
 */
export const CALENDAR_GOOGLE_SYNC = true;

/**
 * Recurring event support
 * Daily, weekly, monthly event patterns
 */
export const CALENDAR_REPEAT_EVENT = true;

/**
 * Event sharing capabilities
 * Share calendar events with users
 */
export const CALENDAR_SHARE_EVENT = true;

/**
 * Advanced event search functionality
 * Filter events by multiple criteria
 */
export const CALENDAR_SEARCH_ADVANCED = true;

// ============================================
// 📆 MEETING SCHEDULING MODULE FEATURES
// ============================================
/**
 * Zoom video conferencing integration
 * Direct Zoom meeting creation
 */
export const MEETING_ZOOM_INTEGRATION = true;

/**
 * Google Meet integration
 * Google Meet meeting links generation
 */
export const MEETING_GOOGLE_MEET = true;

/**
 * Meeting reminder notifications
 * Automated pre-meeting reminders
 */
export const MEETING_REMINDER = true;

/**
 * Email invitation system
 * Automated meeting invite emails
 */
export const MEETING_INVITE_EMAIL = true;

/**
 * Recurring meeting support
 * Scheduled repeating meetings
 */
export const MEETING_RECURRING = true;

/**
 * In-app meeting joining
 * Direct join from application
 */
export const MEETING_IN_APP_JOIN = true;

/**
 * Participant tracking system
 * Attendance and engagement metrics
 */
export const MEETING_PARTICIPANT_TRACKING = true;

// ============================================
// 👥 LEADS MODULE FEATURES
// ============================================
/**
 * Lead assignment system
 * Assign leads to team members
 */
export const LEADS_ASSIGN = true;

/**
 * Follow-up reminder system
 * Automated follow-up scheduling
 */
export const LEADS_FOLLOWUP_REMINDER = true;

/**
 * Lead data export functionality
 * Export leads to CSV/Excel
 */
export const LEADS_EXPORT = true;

/**
 * Persistent filter preferences
 * Save and restore filter settings
 */
export const LEADS_FILTER_PERSISTENT = true;

/**
 * Case-sensitive search option
 * Enhanced search precision control
 */
export const LEADS_SEARCH_CASE_SENSITIVE = true;

// ============================================
// ✅ TASKS MODULE FEATURES
// ============================================
/**
 * Task reminder notifications
 * Automated task deadline alerts
 */
export const TASKS_REMINDER = true;

/**
 * Task assignment system
 * Assign tasks to team members
 */
export const TASKS_ASSIGN = true;

/**
 * Sub-task creation support
 * Break down tasks into sub-tasks
 */
export const TASKS_SUB_TASK = true;

/**
 * File attachments for tasks
 * Document and file attachments
 */
export const TASKS_ATTACHMENT = true;

/**
 * Image-only attachment restriction
 * Limit attachments to image files
 */
export const TASKS_ATTACHMENT_IMAGES_ONLY = true;

/**
 * Advanced due date filtering
 * Complex date range filtering
 */
export const TASKS_DUE_DATE_FILTER_ADVANCED = true;

// ============================================
// 📇 CONTACTS MODULE FEATURES
// ============================================
/**
 * In-app calling functionality
 * Direct phone call initiation
 */
export const CONTACTS_CALL_FROM_APP = true;

/**
 * WhatsApp messaging integration
 * Direct WhatsApp message sending
 */
export const CONTACTS_WHATSAPP_MESSAGE = true;

/**
 * Contact export functionality
 * Export contacts to various formats
 */
export const CONTACTS_EXPORT = true;

/**
 * Phone contact import
 * Import contacts from device
 */
export const CONTACTS_IMPORT_PHONE = true;

/**
 * Contact grouping feature
 * Organize contacts into groups
 */
export const CONTACTS_GROUP = true;

// ============================================
// 👤 PROFILE MODULE FEATURES
// ============================================
/**
 * Name editing capability
 * Update user display name
 */
export const PROFILE_EDIT_NAME = true;

/**
 * Email address editing
 * Change associated email
 */
export const PROFILE_EDIT_EMAIL = true;

/**
 * Mobile number editing
 * Update contact number
 */
export const PROFILE_EDIT_MOBILE = true;

/**
 * Profile photo upload
 * Change profile picture
 */
export const PROFILE_EDIT_PHOTO = true;

/**
 * Password change functionality
 * Update account password
 */
export const PROFILE_CHANGE_PASSWORD = true;

/**
 * Account deletion option
 * Permanently remove account
 */
export const PROFILE_DELETE_ACCOUNT = true;

/**
 * Activity log viewer
 * Track user actions history
 */
export const PROFILE_ACTIVITY_LOG = true;

/**
 * Address management system
 * Store and manage addresses
 */
export const PROFILE_ADDRESS_MANAGEMENT = true;

/**
 * Connected devices list
 * View active sessions
 */
export const PROFILE_DEVICES_LIST = true;

/**
 * Statistics card display
 * Show user metrics
 */
export const PROFILE_STATS_CARD = true;

/**
 * Preferences card display
 * User preference management
 */
export const PROFILE_PREFERENCES_CARD = true;

/**
 * Personal information card
 * Display user details
 */
export const PROFILE_PERSONAL_INFO_CARD = true;

/**
 * Photo cache management
 * Clear cached profile images
 */
export const PROFILE_REMOVE_PHOTO_CACHE = true;

/**
 * Login activity tracking
 * Monitor account access
 */
export const PROFILE_LOGIN_ACTIVITY = true;

// ============================================
// ⚙️ SETTINGS MODULE FEATURES
// ============================================
/**
 * Language preference change
 * Multi-language support
 */
export const SETTINGS_LANGUAGE_CHANGE = true;

/**
 * Dark mode toggle
 * Theme switching capability
 */
export const SETTINGS_DARK_MODE = true;

/**
 * Logout from all devices
 * Remote session termination
 */
export const SETTINGS_LOGOUT_ALL_DEVICES = true;

/**
 * Data export functionality
 * Export user data
 */
export const SETTINGS_DATA_EXPORT = true;

/**
 * Notification preferences toggle
 * Configure alert settings
 */
export const SETTINGS_NOTIFICATION_TOGGLE = true;

/**
 * Clear application cache
 * Free up storage space
 */
export const SETTINGS_CLEAR_CACHE = true;

/**
 * Privacy policy viewer
 * Legal document access
 */
export const SETTINGS_PRIVACY_POLICY = true;

/**
 * Terms & conditions viewer
 * Legal agreement access
 */
export const SETTINGS_TERMS_CONDITIONS = true;

// ============================================
// 📄 REPORTS MODULE FEATURES
// ============================================
/**
 * PDF report generation
 * Export reports as PDF
 */
export const REPORTS_PDF_EXPORT = true;

/**
 * Excel report export
 * Spreadsheet format export
 */
export const REPORTS_EXCEL_EXPORT = true;

/**
 * Scheduled email reports
 * Automated report delivery
 */
export const REPORTS_SCHEDULED_EMAIL = true;

// ============================================
// 🎨 UI / APPEARANCE FEATURES
// ============================================
/**
 * Recently viewed items
 * Track and display recent items
 */
export const FEATURE_RECENT_ITEMS = true;

/**
 * Theme toggle capability
 * Light/dark theme switching
 */
export const FEATURE_THEME_TOGGLE = true;

/**
 * Sync status indicator
 * Show data sync status
 */
export const FEATURE_SYNC_STATUS = true;

/**
 * Application information display
 * Version and build info
 */
export const FEATURE_APP_INFO = true;

/**
 * Dark mode support
 * Dark theme availability
 */
export const FEATURE_DARK_MODE = true;

/**
 * Offline mode support
 * Work without internet
 */
export const FEATURE_OFFLINE_MODE = true;

// ============================================
// 🔐 AUTHENTICATION FEATURES
// ============================================
/**
 * Google OAuth integration
 * Sign in with Google
 */
export const GOOGLE_OAUTH = true;

/**
 * Facebook OAuth integration
 * Sign in with Facebook
 */
export const FACEBOOK_OAUTH = true;

/**
 * GitHub OAuth integration
 * Sign in with GitHub
 */
export const GITHUB_OAUTH = true;

/**
 * OTP verification system
 * One-time password authentication
 */
export const OTP_VERIFICATION = true;

/**
 * Email verification requirement
 * Validate email addresses
 */
export const EMAIL_VERIFICATION = true;

/**
 * Social login providers
 * Multiple social auth options
 */
export const SOCIAL_LOGIN = true;

// ============================================
// 🔔 NOTIFICATION FEATURES
// ============================================
/**
 * Push notification support
 * Mobile and web push alerts
 */
export const PUSH_NOTIFICATIONS = true;

/**
 * Email notification system
 * Automated email alerts
 */
export const EMAIL_NOTIFICATIONS = true;

/**
 * In-app notification center
 * Internal alert system
 */
export const IN_APP_NOTIFICATIONS = true;

/**
 * SMS notification delivery
 * Text message alerts
 */
export const SMS_NOTIFICATIONS = true;

// ============================================
// 💾 DATA MANAGEMENT FEATURES
// ============================================
/**
 * Data backup functionality
 * Automated backup system
 */
export const DATA_BACKUP = true;

/**
 * Data restore capability
 * Backup restoration
 */
export const DATA_RESTORE = true;

/**
 * Data synchronization
 * Cross-device sync
 */
export const DATA_SYNC = true;

/**
 * JSON data export
 * Structured data export
 */
export const DATA_EXPORT_JSON = true;

/**
 * CSV data export
 * Spreadsheet-compatible export
 */
export const DATA_EXPORT_CSV = true;

// ============================================
// 🔌 INTEGRATION FEATURES
// ============================================
/**
 * Zoom meeting integration
 * Video conferencing support
 */
export const INTEGRATION_ZOOM = true;

/**
 * Google Calendar sync
 * Calendar integration
 */
export const INTEGRATION_GOOGLE_CALENDAR = true;

/**
 * Slack workspace integration
 * Team communication
 */
export const INTEGRATION_SLACK = true;

/**
 * Microsoft Teams integration
 * Enterprise collaboration
 */
export const INTEGRATION_TEAMS = true;

/**
 * WhatsApp Business integration
 * Messaging platform
 */
export const INTEGRATION_WHATSAPP = true;

/**
 * Google Drive integration
 * Cloud storage access
 */
export const INTEGRATION_GOOGLE_DRIVE = true;

/**
 * Dropbox integration
 * File storage sync
 */
export const INTEGRATION_DROPBOX = true;

// ============================================
// 💳 PAYMENT / BILLING FEATURES
// ============================================
/**
 * Stripe payment gateway
 * Credit card processing
 */
export const PAYMENT_STRIPE = true;

/**
 * Razorpay integration
 * Indian payment gateway
 */
export const PAYMENT_RAZORPAY = true;

/**
 * PayPal payment system
 * Digital wallet payments
 */
export const PAYMENT_PAYPAL = true;

/**
 * Subscription plan management
 * Tiered pricing system
 */
export const SUBSCRIPTION_PLANS = true;

/**
 * Invoice generation system
 * Automated billing documents
 */
export const INVOICE_GENERATION = true;

// ============================================
// 👑 ROLE BASED FEATURES
// ============================================
/**
 * Administrator role access
 * Full system control
 */
export const ROLE_ADMIN = true;

/**
 * Manager role capabilities
 * Team management access
 */
export const ROLE_MANAGER = true;

/**
 * Standard user role
 * Basic feature access
 */
export const ROLE_USER = true;

/**
 * Guest user access
 * Limited preview features
 */
export const ROLE_GUEST = true;

/**
 * Multi-team support
 * Team-based organization
 */
export const MULTI_TEAM_SUPPORT = true;

/**
 * Permission management system
 * Granular access control
 */
export const PERMISSION_MANAGEMENT = true;

// ============================================
// 📦 EXPORT ALL FLAGS AS SINGLE OBJECT
// ============================================

/**
 * Consolidated feature flags object
 * Provides single access point for all feature toggles
 * @constant
 */
export const FeatureFlags = {
  // Dashboard Module
  DASHBOARD_TOTAL_LEADS,
  DASHBOARD_TOTAL_TASKS,
  DASHBOARD_TOTAL_CONTACTS,
  DASHBOARD_UPCOMING_MEETINGS,
  DASHBOARD_TODAY_EVENTS,
  DASHBOARD_QUICK_ACTIONS,
  DASHBOARD_RECENT_CHAT,
  DASHBOARD_ANALYTICS_REALTIME,
  DASHBOARD_UNREAD_CHAT_COUNT,
  DASHBOARD_NOTIFICATION_BELL,

  // Bottom Tab Navigation
  TAB_HOME,
  TAB_LEADS,
  TAB_TASKS,
  TAB_CONTACTS,
  TAB_ANALYTICS,
  TAB_CALENDAR,
  TAB_PROFILE,
  TAB_TOOLS,

  // Sidebar Navigation
  SIDEBAR_DASHBOARD,
  SIDEBAR_LEADS,
  SIDEBAR_TASKS,
  SIDEBAR_CONTACTS,
  SIDEBAR_ANALYTICS,
  SIDEBAR_CALENDAR,
  SIDEBAR_MEETING_SCHEDULING,
  SIDEBAR_CHAT_SUPPORT,
  SIDEBAR_EMAIL_SENDER,
  SIDEBAR_REPORTS,
  SIDEBAR_ACTIVITIES,
  SIDEBAR_IMPORT_EXPORT,
  SIDEBAR_SETTINGS,
  SIDEBAR_HELP_SUPPORT,
  SIDEBAR_PROFILE,

  // Chat Features
  CHAT_REAL_TIME_TYPING,
  CHAT_IMAGE_SHARE,
  CHAT_FILE_SHARE,
  CHAT_MESSAGE_DELETE,
  CHAT_BLOCK_USER,
  CHAT_PUSH_NOTIFICATION,
  CHAT_MARK_READ_INSTANT,

  // Email Features
  EMAIL_ATTACHMENT,
  EMAIL_TEMPLATES,
  EMAIL_BULK_SEND,
  EMAIL_CC_BCC,
  EMAIL_BCC_HIDE,

  // Analytics Features
  ANALYTICS_TOP_PERFORMER,
  ANALYTICS_PDF_EXPORT,
  ANALYTICS_REAL_TIME,
  ANALYTICS_MONTHLY_COMPARISON,
  ANALYTICS_LEAD_CONVERSION,

  // Calendar Features
  CALENDAR_EVENT_REMINDER,
  CALENDAR_GOOGLE_SYNC,
  CALENDAR_REPEAT_EVENT,
  CALENDAR_SHARE_EVENT,
  CALENDAR_SEARCH_ADVANCED,

  // Meeting Features
  MEETING_ZOOM_INTEGRATION,
  MEETING_GOOGLE_MEET,
  MEETING_REMINDER,
  MEETING_INVITE_EMAIL,
  MEETING_RECURRING,
  MEETING_IN_APP_JOIN,
  MEETING_PARTICIPANT_TRACKING,

  // Leads Features
  LEADS_ASSIGN,
  LEADS_FOLLOWUP_REMINDER,
  LEADS_EXPORT,
  LEADS_FILTER_PERSISTENT,
  LEADS_SEARCH_CASE_SENSITIVE,

  // Tasks Features
  TASKS_REMINDER,
  TASKS_ASSIGN,
  TASKS_SUB_TASK,
  TASKS_ATTACHMENT,
  TASKS_ATTACHMENT_IMAGES_ONLY,
  TASKS_DUE_DATE_FILTER_ADVANCED,

  // Contacts Features
  CONTACTS_CALL_FROM_APP,
  CONTACTS_WHATSAPP_MESSAGE,
  CONTACTS_EXPORT,
  CONTACTS_IMPORT_PHONE,
  CONTACTS_GROUP,

  // Profile Features
  PROFILE_EDIT_NAME,
  PROFILE_EDIT_EMAIL,
  PROFILE_EDIT_MOBILE,
  PROFILE_EDIT_PHOTO,
  PROFILE_CHANGE_PASSWORD,
  PROFILE_DELETE_ACCOUNT,
  PROFILE_ACTIVITY_LOG,
  PROFILE_ADDRESS_MANAGEMENT,
  PROFILE_DEVICES_LIST,
  PROFILE_STATS_CARD,
  PROFILE_PREFERENCES_CARD,
  PROFILE_PERSONAL_INFO_CARD,
  PROFILE_REMOVE_PHOTO_CACHE,
  PROFILE_LOGIN_ACTIVITY,

  // Settings Features
  SETTINGS_LANGUAGE_CHANGE,
  SETTINGS_DARK_MODE,
  SETTINGS_LOGOUT_ALL_DEVICES,
  SETTINGS_DATA_EXPORT,
  SETTINGS_NOTIFICATION_TOGGLE,
  SETTINGS_CLEAR_CACHE,
  SETTINGS_PRIVACY_POLICY,
  SETTINGS_TERMS_CONDITIONS,

  // Reports Features
  REPORTS_PDF_EXPORT,
  REPORTS_EXCEL_EXPORT,
  REPORTS_SCHEDULED_EMAIL,

  // UI Features
  FEATURE_RECENT_ITEMS,
  FEATURE_THEME_TOGGLE,
  FEATURE_SYNC_STATUS,
  FEATURE_APP_INFO,
  FEATURE_DARK_MODE,
  FEATURE_OFFLINE_MODE,

  // Authentication Features
  GOOGLE_OAUTH,
  FACEBOOK_OAUTH,
  GITHUB_OAUTH,
  OTP_VERIFICATION,
  EMAIL_VERIFICATION,
  SOCIAL_LOGIN,

  // Notification Features
  PUSH_NOTIFICATIONS,
  EMAIL_NOTIFICATIONS,
  IN_APP_NOTIFICATIONS,
  SMS_NOTIFICATIONS,

  // Data Management
  DATA_BACKUP,
  DATA_RESTORE,
  DATA_SYNC,
  DATA_EXPORT_JSON,
  DATA_EXPORT_CSV,

  // Integrations
  INTEGRATION_ZOOM,
  INTEGRATION_GOOGLE_CALENDAR,
  INTEGRATION_SLACK,
  INTEGRATION_TEAMS,
  INTEGRATION_WHATSAPP,
  INTEGRATION_GOOGLE_DRIVE,
  INTEGRATION_DROPBOX,

  // Payment Features
  PAYMENT_STRIPE,
  PAYMENT_RAZORPAY,
  PAYMENT_PAYPAL,
  SUBSCRIPTION_PLANS,
  INVOICE_GENERATION,

  // Role-Based Access
  ROLE_ADMIN,
  ROLE_MANAGER,
  ROLE_USER,
  ROLE_GUEST,
  MULTI_TEAM_SUPPORT,
  PERMISSION_MANAGEMENT,
} as const;

/**
 * Default export of feature flags configuration
 * @example
 * import FeatureFlags from './constants/FeatureFlags';
 * if (FeatureFlags.TAB_ANALYTICS) {
 *   // Show analytics tab
 * }
 */
export default FeatureFlags;
