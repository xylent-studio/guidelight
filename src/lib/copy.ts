/**
 * Guidelight Copy & Microtext
 * 
 * Central source of truth for all UI strings.
 * Written for SOM budtenders and managers — clear first, a little stoner, never cringe.
 * 
 * DO NOT EDIT: Profile field examples (My vibe, Expertise, Tolerance) or pick form examples.
 * Those are defined in their respective components and are intentionally crafted.
 */

// =============================================================================
// LANDING / APP SHELL
// =============================================================================

export const landing = {
  badge: 'STATE OF MIND · GUIDELIGHT v1',
  title: 'For the people behind the counter',
  subline: 'Guests trust you to turn a menu into a feeling.',
  definition: 'A guidelight is a small light that helps you find your way in the dark — this one is for SOM staff and the people you serve.',
  footer: {
    line1: 'Guidelight v1 · Built by Xylent Studios for State of Mind',
    line2: 'If a guest is reading this, someone forgot to switch to Customer View. 😉',
  },
};

// =============================================================================
// MODE TOGGLE CARDS
// =============================================================================

export const modeToggle = {
  customer: {
    title: 'Customer View',
    description: 'Guest side of the counter.',
  },
  staff: {
    title: 'Staff View',
    description: 'Behind the counter, before the rush.',
  },
};

// =============================================================================
// CUSTOMER VIEW
// =============================================================================

export const customerView = {
  budtenderSelector: {
    heading: 'Budtenders & their picks',
    subtext: 'Real people. Real lineups.',
  },
  posNote: 'POS note: Looks best on a 1920×1080 front counter screen. On smaller devices, everything scrolls.',
  empty: {
    heading: 'No picks to show yet.',
    subtext: "Head to Staff View and add a few favorites you'd actually recommend to your favorite regular.",
    cta: 'Go to Staff View',
  },
  loading: 'Loading the good stuff...',
  categoryEmpty: (budtenderName: string, categoryName: string) =>
    `${budtenderName}'s ${categoryName.toLowerCase()} picks are coming soon. Ask them what they're into!`,
};

// =============================================================================
// STAFF VIEW
// =============================================================================

export const staffView = {
  budtenderSelector: {
    heading: 'Who are you managing?',
    subtext: 'Choose a staff profile to tweak their card and picks.',
  },
  myProfile: {
    title: 'My Profile',
    description: 'This is the 3-second story guests get about you before you say hi.',
  },
  categoryEmpty: "No picks yet. Add something you'd be bummed to see leave the menu.",
  allCategoriesEmpty: "Start by adding the things you'd be genuinely sad to see disappear from the menu.",
  addPick: {
    cardTitle: 'Add Pick',
    cardDescription: 'Quick-add a recommendation to any category. Perfect for when inspiration strikes.',
  },
};

// =============================================================================
// STAFF MANAGEMENT
// =============================================================================

export const staffManagement = {
  heading: 'Staff Management',
  subtext: 'Invite new teammates, tune their profiles, and control who can log in.',
  stats: {
    totalStaff: 'Total Staff',
    active: 'Active',
    invitesPending: 'Invites pending',
    inactive: 'Inactive',
  },
  card: {
    canSignInLabel: 'Can sign in',
    removeTooltip: 'Remove from team',
  },
  empty: {
    all: 'No staff members yet. Invite your first teammate to get started!',
    active: 'No active staff members yet.',
    inactive: "No one's on the bench — everyone's active!",
    pending: "No pending invites. Everyone's signed in.",
  },
};

// =============================================================================
// AUTH & SESSION
// =============================================================================

export const auth = {
  login: {
    title: 'Sign in to Guidelight',
    subtitle: 'State of Mind Staff Portal',
    helpText: 'Need help? Ask your manager or ping the team.',
    error: "We couldn't sign you in. Double-check your email and try again.",
  },
  logout: {
    title: 'Sign out?',
    body: "You'll be signed out on this device. Log back in next shift when it's time to talk terps again.",
    confirm: 'Sign out',
    cancel: 'Stay signed in',
  },
  sessionExpired: {
    title: 'Session took a little nap',
    body: "You've been away for a bit, so we signed you out. Hop back in to keep using Guidelight.",
    cta: 'Sign in again',
  },
  passwordChange: {
    title: 'Change password',
    description: 'Choose a new password for your account.',
    success: "Password updated! You're all set.",
    hint: "Password must be at least 6 characters. Make it something you'll remember!",
  },
  profileError: {
    title: 'Account Setup Required',
    helpText: 'If you think this is a mistake, try refreshing. Still stuck? Ask your manager to check your staff profile.',
    retry: 'Try Again',
    signOut: 'Sign Out',
  },
};

// =============================================================================
// NETWORK / ERROR MESSAGES
// =============================================================================

export const errors = {
  networkInline: {
    heading: 'The connection spaced out for a sec.',
    body: 'Check your Wi-Fi and try again. If it keeps doing this, grab a manager so we can get it back on track.',
    retry: 'Try again',
  },
  networkToast: "Guidelight couldn't reach the server. Check your connection and try again.",
  generic: {
    heading: "Well, that wasn't on the menu.",
    body: 'Something went sideways in Guidelight. Try a refresh. If it keeps acting weird, grab a screenshot and show a manager.',
    toast: "That didn't go as planned. Try again in a sec.",
  },
  crash: {
    heading: 'This hit harder than expected.',
    body: 'Guidelight ran into a serious error. Try refreshing. If it keeps doing this, grab a screenshot and show a manager so we can get it fixed.',
  },
  notFound: {
    heading: "You've wandered off the menu.",
    body: "This page doesn't exist. Head back to Staff View to find your way again.",
    cta: 'Back to Staff View',
  },
  noSearchResults: {
    heading: 'Nothing matched that.',
    body: "Loosen the filters or check the spelling. The right jar's probably hiding in plain sight.",
  },
  // Common form error messages
  somethingWentWrong: 'Something went sideways. Give it another shot?',
  failedToSave: "Couldn't save that. Try again in a moment.",
  failedToLoad: 'Had trouble loading this. Try refreshing.',
  signOutFailed: "Couldn't sign out. Try again?",
};

// =============================================================================
// PROFILE EDITING (system messages only, NOT field examples)
// =============================================================================

export const profile = {
  unsavedChanges: {
    title: 'Leave without saving?',
    body: "You've tweaked your vibe, but it's not saved yet. Keep editing or drop these changes.",
    keep: 'Keep editing',
    discard: 'Discard changes',
  },
  saveSuccess: "Profile saved. Your vibe's ready for the front.",
  saveError: "We couldn't save your profile. Try again in a moment.",
};

// =============================================================================
// PICKS MANAGEMENT
// =============================================================================

export const picks = {
  addSuccess: (productName: string) => `${productName} added to your picks.`,
  removeConfirm: {
    title: 'Remove this pick?',
    body: "It'll disappear from your staff picks, but you can always add it back later.",
    confirm: 'Remove pick',
    cancel: 'Keep it',
  },
  removeSuccess: 'Pick removed.',
  clearAll: {
    title: 'Clear all your picks?',
    body: "This wipes your list so you can start fresh. You'll need to re-add anything you still want to show guests.",
    confirm: 'Clear all picks',
    cancel: 'Cancel',
  },
  clearAllSuccess: 'All picks cleared. Blank canvas, who dis?',
  saveError: 'Something went wrong. Give it another shot?',
};

// =============================================================================
// INVITES & STAFF LIFECYCLE
// =============================================================================

export const invites = {
  sent: (email: string) => `Invite sent to ${email}. They'll get a link to set up their profile and picks.`,
  failed: "We couldn't send that invite. Double-check the email and try again.",
  deactivate: {
    title: 'Deactivate this staff account?',
    body: "They won't be able to sign in or change their picks until you reactivate them. Their data stays saved in case they come back.",
    confirm: 'Deactivate',
    cancel: 'Cancel',
  },
  deactivateSuccess: 'Account deactivated. You can reactivate them from Staff Management.',
  reactivate: {
    title: 'Reactivate this staff account?',
    body: "They'll be able to sign in and use Guidelight again.",
    confirm: 'Reactivate',
    cancel: 'Cancel',
  },
  reactivateSuccess: 'Account reactivated. Welcome back to the rotation.',
};

// =============================================================================
// DELETE / REMOVE STAFF
// =============================================================================

export const deleteStaff = {
  title: (name: string) => `Remove ${name} from the team?`,
  body: (pickCount: number) => 
    pickCount > 0 
      ? `This permanently deletes their profile and all ${pickCount} of their picks. This can't be undone.`
      : "This permanently deletes their profile. This can't be undone.",
  confirm: 'Remove from team',
  cancel: 'Cancel',
  finalTitle: 'Final confirmation',
  finalBody: (name: string) => `You're about to permanently remove ${name}. Last chance to cancel.`,
  finalConfirm: 'Yes, remove permanently',
  success: (name: string) => `${name} has been removed from the team.`,
};

// =============================================================================
// GLOBAL SUCCESS
// =============================================================================

export const globalSuccess = {
  allSaved: "Everything saved. This shift's lining up nicely.",
};
