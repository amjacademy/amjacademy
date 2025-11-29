# TODO: Add Popup Notifications for Admin Actions

## Overview
Implement popup notifications in the bottom right corner for admin pages when performing update, enroll, and add actions. Notifications should be styled as message forms with green for success and red for failure.

## Steps
- [ ] Create a reusable PopupNotification component in src/components/common/
- [ ] Create CSS for the popup notification (bottom right, message form style, green/red colors)
- [ ] Integrate PopupNotification into User_enrollment.jsx for enroll/update actions
- [x] Integrate PopupNotification into Announcements.jsx for post announcement action
- [ ] Integrate PopupNotification into Class_arrangement.jsx for add/update schedule actions
- [ ] Test the notifications in all admin components
