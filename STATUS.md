# Eduspark — Build Status

_A plain checklist of what works today and what's left. Updated as we build._

## ✅ Done and working (you can use these now)

**Public website**
- Premium landing page, dark mode 🌙, language switch EN / AR (RTL) / TR, responsive
- Pages: About, Pricing, Contact, Privacy, Terms, Courses
- Every navigation link works (no dead links)

**Accounts**
- Sign in
- Register (with role choice: student / parent / tutor)
- Role-based routing (each role lands on its own dashboard)

**Marketplace (the core loop)**
- Find tutors: search + subject filters + sort + pagination
- Tutor profile page with bio, offerings, and **real available time slots**
- **Save/favorite** tutors (heart) + a Favorites page
- **Book a session**: pick a slot → creates a real booking request
- **My bookings**: see your requests + status + cancel (student area)

**Admin console**
- Overview with live stats
- **Manage Users**: real, paginated list of every account

**Under the hood**
- 6 demo tutors seeded; permissions wired; rate-limit fixed
- Full English + Arabic translations; Turkish key strings

## 🔜 Not built yet (the "Soon" items)

**Tutor side**
- See incoming booking requests → confirm / reject
- Edit own profile: subjects, languages, rate, bio
- Manage availability calendar

**Student side**
- Learning goals (set & track)
- Progress tracking
- Enrolled courses view

**Parent side**
- Link a child account
- Monitor a child's sessions & progress

**Admin side**
- Tutor verification queue (approve/reject tutors)
- Content & courses management (create/publish)
- Analytics dashboard
- Countries / settings / localization admin

**Platform-wide**
- Notifications & messaging
- Account settings page
- Payments / checkout (backend business rules are intentionally pending)

## How to experience every role

Sign in with these demo accounts (after running the demo-accounts seed):

| Role | Email | Password | You'll see |
|---|---|---|---|
| Student | student@demo.edu | Student12345! | student dashboard, favorites, **My bookings** |
| Parent | parent@demo.edu | Parent12345! | parent dashboard, favorites |
| Tutor | tutor@demo.edu | Tutor12345! | tutor dashboard |
| Admin | admin@edu.local | Admin@12345 | admin console, Manage Users |

> Tip: "My bookings" only appears when you're signed in as a **student** — that's
> why it wasn't visible while logged in as admin.