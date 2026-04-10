// src/constants/FeatureFlags.ts

// ============================================
// NAVIGATION / SIDEBAR MODULES
// ============================================
export const MODULE_DASHBOARD = true;
export const MODULE_LEADS = true;
export const MODULE_TASKS = true;
export const MODULE_CONTACTS = true;
export const MODULE_ANALYTICS = true;
export const MODULE_CALENDAR = true;
export const MODULE_MEETING_SCHEDULING = true;
export const MODULE_CHAT_SUPPORT = true;
export const MODULE_EMAIL_SENDER = false; // false = email templates hide
export const MODULE_REPORTS = true;
export const MODULE_PROFILE = true;
export const MODULE_SETTINGS = true;
export const MODULE_ACTIVITIES = true;
export const MODULE_IMPORT_EXPORT = true;
export const MODULE_HELP_SUPPORT = true;

// ============================================
// CHAT SUPPORT MODULE FEATURES
// ============================================
export const CHAT_REAL_TIME_TYPING = false;
export const CHAT_IMAGE_SHARE = false;
export const CHAT_FILE_SHARE = false;
export const CHAT_MESSAGE_DELETE = false;
export const CHAT_BLOCK_USER = false;
export const CHAT_PUSH_NOTIFICATION = false;
export const CHAT_MARK_READ_INSTANT = false;

// ============================================
// EMAIL SENDER MODULE FEATURES
// ============================================
export const EMAIL_ATTACHMENT = false;
export const EMAIL_TEMPLATES = false;
export const EMAIL_BULK_SEND = false;
export const EMAIL_CC_BCC = true;
export const EMAIL_BCC_HIDE = true;

// ============================================
// ANALYTICS MODULE FEATURES
// ============================================
export const ANALYTICS_TOP_PERFORMER = false;
export const ANALYTICS_PDF_EXPORT = false;
export const ANALYTICS_REAL_TIME = false;
export const ANALYTICS_MONTHLY_COMPARISON = false;
export const ANALYTICS_LEAD_CONVERSION = true;

// ============================================
// CALENDAR MODULE FEATURES
// ============================================
export const CALENDAR_EVENT_REMINDER = false;
export const CALENDAR_GOOGLE_SYNC = false;
export const CALENDAR_REPEAT_EVENT = false;
export const CALENDAR_SHARE_EVENT = false;
export const CALENDAR_SEARCH_ADVANCED = true;

// ============================================
// MEETING SCHEDULING MODULE FEATURES
// ============================================
export const MEETING_ZOOM_INTEGRATION = false;
export const MEETING_GOOGLE_MEET = false;
export const MEETING_REMINDER = false;
export const MEETING_INVITE_EMAIL = false;
export const MEETING_RECURRING = false;
export const MEETING_IN_APP_JOIN = false;
export const MEETING_PARTICIPANT_TRACKING = true;

// ============================================
// LEADS MODULE FEATURES
// ============================================
export const LEADS_ASSIGN = false;
export const LEADS_FOLLOWUP_REMINDER = false;
export const LEADS_EXPORT = false;
export const LEADS_FILTER_PERSISTENT = false;
export const LEADS_SEARCH_CASE_SENSITIVE = true;

// ============================================
// TASKS MODULE FEATURES
// ============================================
export const TASKS_REMINDER = false;
export const TASKS_ASSIGN = false;
export const TASKS_SUB_TASK = false;
export const TASKS_ATTACHMENT = false;
export const TASKS_ATTACHMENT_IMAGES_ONLY = true;
export const TASKS_DUE_DATE_FILTER_ADVANCED = false;

// ============================================
// CONTACTS MODULE FEATURES
// ============================================
export const CONTACTS_CALL_FROM_APP = false;
export const CONTACTS_WHATSAPP_MESSAGE = true;
export const CONTACTS_EXPORT = false;
export const CONTACTS_IMPORT_PHONE = false;
export const CONTACTS_GROUP = false;

// ============================================
// PROFILE MODULE FEATURES
// ============================================
export const PROFILE_EDIT_NAME = true;
export const PROFILE_EDIT_EMAIL = true;
export const PROFILE_EDIT_MOBILE = true;
export const PROFILE_EDIT_PHOTO = true;
export const PROFILE_CHANGE_PASSWORD = true;
export const PROFILE_DELETE_ACCOUNT = false;
export const PROFILE_ACTIVITY_LOG = true;
export const PROFILE_ADDRESS_MANAGEMENT = true;
export const PROFILE_DEVICES_LIST = true;
export const PROFILE_STATS_CARD = true;
export const PROFILE_PREFERENCES_CARD = true;
export const PROFILE_PERSONAL_INFO_CARD = true;
export const PROFILE_REMOVE_PHOTO_CACHE = false;
export const PROFILE_LOGIN_ACTIVITY = false;

// ============================================
// SETTINGS MODULE FEATURES
// ============================================
export const SETTINGS_LANGUAGE_CHANGE = false;
export const SETTINGS_DARK_MODE = true;
export const SETTINGS_LOGOUT_ALL_DEVICES = false;
export const SETTINGS_DATA_EXPORT = false;
export const SETTINGS_NOTIFICATION_TOGGLE = true;
export const SETTINGS_CLEAR_CACHE = true;
export const SETTINGS_PRIVACY_POLICY = true;
export const SETTINGS_TERMS_CONDITIONS = true;

// ============================================
// DASHBOARD / HOME MODULE FEATURES
// ============================================
export const DASHBOARD_TOTAL_CONTACTS = true;
export const DASHBOARD_RECENT_CHAT = false;
export const DASHBOARD_ANALYTICS_REALTIME = false;
export const DASHBOARD_UNREAD_CHAT_COUNT = false;
export const DASHBOARD_TOTAL_LEADS = true;
export const DASHBOARD_TOTAL_TASKS = true;
export const DASHBOARD_UPCOMING_MEETINGS = true;
export const DASHBOARD_TODAY_EVENTS = true;
export const DASHBOARD_QUICK_ACTIONS = true;
export const DASHBOARD_NOTIFICATION_BELL = true;

// ============================================
// REPORTS MODULE FEATURES
// ============================================
export const REPORTS_PDF_EXPORT = false;
export const REPORTS_EXCEL_EXPORT = false;
export const REPORTS_SCHEDULED_EMAIL = false;

// ============================================
// UI / APPEARANCE FEATURES
// ============================================
export const FEATURE_RECENT_ITEMS = true;
export const FEATURE_THEME_TOGGLE = true;
export const FEATURE_SYNC_STATUS = true;
export const FEATURE_APP_INFO = true;
export const FEATURE_DARK_MODE = true;
export const FEATURE_OFFLINE_MODE = true;

// ============================================
// AUTHENTICATION FEATURES
// ============================================
export const GOOGLE_OAUTH = false;
export const FACEBOOK_OAUTH = false;
export const GITHUB_OAUTH = false;
export const OTP_VERIFICATION = false;
export const EMAIL_VERIFICATION = false;
export const SOCIAL_LOGIN = false;

// ============================================
// NOTIFICATION FEATURES
// ============================================
export const PUSH_NOTIFICATIONS = true;
export const EMAIL_NOTIFICATIONS = true;
export const IN_APP_NOTIFICATIONS = true;
export const SMS_NOTIFICATIONS = false;

// ============================================
// DATA MANAGEMENT FEATURES
// ============================================
export const DATA_BACKUP = false;
export const DATA_RESTORE = false;
export const DATA_SYNC = true;
export const DATA_EXPORT_JSON = false;
export const DATA_EXPORT_CSV = false;

// ============================================
// INTEGRATION FEATURES
// ============================================
export const INTEGRATION_ZOOM = false;
export const INTEGRATION_GOOGLE_CALENDAR = false;
export const INTEGRATION_SLACK = false;
export const INTEGRATION_TEAMS = false;
export const INTEGRATION_WHATSAPP = true;
export const INTEGRATION_GOOGLE_DRIVE = false;
export const INTEGRATION_DROPBOX = false;

// ============================================
// PAYMENT / BILLING FEATURES
// ============================================
export const PAYMENT_STRIPE = false;
export const PAYMENT_RAZORPAY = false;
export const PAYMENT_PAYPAL = false;
export const SUBSCRIPTION_PLANS = false;
export const INVOICE_GENERATION = false;

// ============================================
// ROLE BASED FEATURES
// ============================================
export const ROLE_ADMIN = true;
export const ROLE_MANAGER = true;
export const ROLE_USER = true;
export const ROLE_GUEST = true;
export const MULTI_TEAM_SUPPORT = false;
export const PERMISSION_MANAGEMENT = false;

// ============================================
// EXPORT ALL FLAGS AS OBJECT
// ============================================
export const FeatureFlags = {
  // Navigation
  MODULE_DASHBOARD,
  MODULE_LEADS,
  MODULE_TASKS,
  MODULE_CONTACTS,
  MODULE_ANALYTICS,
  MODULE_CALENDAR,
  MODULE_MEETING_SCHEDULING,
  MODULE_CHAT_SUPPORT,
  MODULE_EMAIL_SENDER,
  MODULE_REPORTS,
  MODULE_PROFILE,
  MODULE_SETTINGS,
  MODULE_ACTIVITIES,
  MODULE_IMPORT_EXPORT,
  MODULE_HELP_SUPPORT,

  // Chat
  CHAT_REAL_TIME_TYPING,
  CHAT_IMAGE_SHARE,
  CHAT_FILE_SHARE,
  CHAT_MESSAGE_DELETE,
  CHAT_BLOCK_USER,
  CHAT_PUSH_NOTIFICATION,
  CHAT_MARK_READ_INSTANT,

  // Email
  EMAIL_ATTACHMENT,
  EMAIL_TEMPLATES,
  EMAIL_BULK_SEND,
  EMAIL_CC_BCC,
  EMAIL_BCC_HIDE,

  // Analytics
  ANALYTICS_TOP_PERFORMER,
  ANALYTICS_PDF_EXPORT,
  ANALYTICS_REAL_TIME,
  ANALYTICS_MONTHLY_COMPARISON,
  ANALYTICS_LEAD_CONVERSION,

  // Calendar
  CALENDAR_EVENT_REMINDER,
  CALENDAR_GOOGLE_SYNC,
  CALENDAR_REPEAT_EVENT,
  CALENDAR_SHARE_EVENT,
  CALENDAR_SEARCH_ADVANCED,

  // Meeting
  MEETING_ZOOM_INTEGRATION,
  MEETING_GOOGLE_MEET,
  MEETING_REMINDER,
  MEETING_INVITE_EMAIL,
  MEETING_RECURRING,
  MEETING_IN_APP_JOIN,
  MEETING_PARTICIPANT_TRACKING,

  // Leads
  LEADS_ASSIGN,
  LEADS_FOLLOWUP_REMINDER,
  LEADS_EXPORT,
  LEADS_FILTER_PERSISTENT,
  LEADS_SEARCH_CASE_SENSITIVE,

  // Tasks
  TASKS_REMINDER,
  TASKS_ASSIGN,
  TASKS_SUB_TASK,
  TASKS_ATTACHMENT,
  TASKS_ATTACHMENT_IMAGES_ONLY,
  TASKS_DUE_DATE_FILTER_ADVANCED,

  // Contacts
  CONTACTS_CALL_FROM_APP,
  CONTACTS_WHATSAPP_MESSAGE,
  CONTACTS_EXPORT,
  CONTACTS_IMPORT_PHONE,
  CONTACTS_GROUP,

  // Profile
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

  // Settings
  SETTINGS_LANGUAGE_CHANGE,
  SETTINGS_DARK_MODE,
  SETTINGS_LOGOUT_ALL_DEVICES,
  SETTINGS_DATA_EXPORT,
  SETTINGS_NOTIFICATION_TOGGLE,
  SETTINGS_CLEAR_CACHE,
  SETTINGS_PRIVACY_POLICY,
  SETTINGS_TERMS_CONDITIONS,

  // Dashboard
  DASHBOARD_TOTAL_CONTACTS,
  DASHBOARD_RECENT_CHAT,
  DASHBOARD_ANALYTICS_REALTIME,
  DASHBOARD_UNREAD_CHAT_COUNT,
  DASHBOARD_TOTAL_LEADS,
  DASHBOARD_TOTAL_TASKS,
  DASHBOARD_UPCOMING_MEETINGS,
  DASHBOARD_TODAY_EVENTS,
  DASHBOARD_QUICK_ACTIONS,
  DASHBOARD_NOTIFICATION_BELL,

  // Reports
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

  // Auth
  GOOGLE_OAUTH,
  FACEBOOK_OAUTH,
  GITHUB_OAUTH,
  OTP_VERIFICATION,
  EMAIL_VERIFICATION,
  SOCIAL_LOGIN,

  // Notifications
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

  // Payment
  PAYMENT_STRIPE,
  PAYMENT_RAZORPAY,
  PAYMENT_PAYPAL,
  SUBSCRIPTION_PLANS,
  INVOICE_GENERATION,

  // Role Based
  ROLE_ADMIN,
  ROLE_MANAGER,
  ROLE_USER,
  ROLE_GUEST,
  MULTI_TEAM_SUPPORT,
  PERMISSION_MANAGEMENT,
};

export default FeatureFlags;
