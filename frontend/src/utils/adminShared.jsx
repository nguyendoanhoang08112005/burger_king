/**
 * adminShared.jsx
 *
 * Legacy barrel file kept for backward compatibility.
 * All utilities now live in adminUtils.jsx – import from there directly.
 */
export {
  // URL helpers
  assetUrl,
  logoSizeValue,

  // Flag helpers
  getCountryCode,
  renderFlag,

  // Text / formatting
  slugify,
  skuify,
  fieldInputClass,

  // Order helpers
  statusTabs,
  statusClasses,
  orderStatusFlow,
  getAllowedOrderStatuses,
  orderStatusProgress,

  // Badge / menu helpers
  formatBadgeCount,
  adminPermissionModules,
  canAccessAdminModule,
  adminPathModule,
  bannerPositionOptions,
  CURRENCY_OPTIONS,
  menuGroups,

  // API helpers
  unwrap,
  getMeta,
  unwrapNotifications,
  notificationData,
  notificationTitle,
  notificationBody,

  // Audio
  playNotificationSound,

  // Hooks
  useAdminText,

  // UI components
  TableSkeleton,
  EmptyTableRow,
  EmptyState,
  Pagination,
  ConfirmDialog,
  AdminPageShell,
  ToggleCell,
  SettingInput,
  SettingTextarea,
  SettingSelect,
  SettingToggle,
  AdminImageInput,
} from './adminUtils'
