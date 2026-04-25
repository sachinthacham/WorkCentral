login credentials
Email: capstone.owner@demo.local
Password: DemoFull2026!

----------------------Unit testing----------------------------------
Did the API testing for Unit tests for workspace, Tasks, pagination helper, AuthService (login / refresh / forgot / reset), ProjectsService (members / roles), SprintsService + SprintsController (with mocks), plus the existing email.service spec.

api/src/common/helpers/paginated-result.helper.spec.ts
api/src/modules/auth/auth.service.spec.ts
api/src/modules/email/email.service.spec.ts
api/src/modules/projects/projects.service.spec.ts
api/src/modules/sprints/sprints.controller.spec.ts
api/src/modules/sprints/sprints.service.spec.ts
api/src/modules/tasks/tasks.services.spec.ts
api/src/modules/workspace/workspace.service.spec.ts

Did the UI testing for Dashboard

client/app/dashboard/page.test.tsx
client/components/TaskComments.test.tsx
client/components/ui/Button.test.tsx
client/components/ui/EmptyState.test.tsx
client/features/auth/api.test.ts

------------------------Roles-----------------------
Workspace OWNER
---Can---
Use POST /workspace/invite and PATCH /workspace/settings (must be workspace OWNER or ADMIN per RolesGuard).
Pass ProjectRolesGuard as if they had project access: workspace OWNER / ADMIN bypass project-role checks, so they can call MANAGER-only project member routes for any project in that workspace (add/remove/change roles), even without a ProjectMember row.
Do anything that only needs JwtAuthGuard: create/list workspace, list workspace members, create/list projects, tasks, sprints, search, dashboard analytics, notifications, etc.

---Can’t---
Nothing extra is denied by role guards beyond what any logged-in user lacks (e.g. still need valid token and headers). There is no separate “owner-only” API beyond sharing the same OWNER/ADMIN rules as ADMIN for the guarded workspace routes.

Workspace ADMIN

---Can---
Same workspace admin APIs as OWNER: POST /workspace/invite, PATCH /workspace/settings.
Same project guard bypass as OWNER (full project member management on all projects in the workspace).
All JWT-only routes (projects, tasks, sprints, search, dashboard, notifications, etc.).

---Can’t---
By API, not distinguished from OWNER on the guarded routes (both are in @Roles('OWNER', 'ADMIN')). Any “owner vs admin” difference is not enforced in the snippets we use.

Workspace MEMBER

---Can---
All JWT-only routes: workspaces (create/list), GET /workspace/members, projects (create/list), tasks, comments, sprints, search, dashboard, notifications, etc.
Project roster: GET /projects/:projectId/members if they have a project role of MANAGER, MEMBER, or VIEWER (or if they are workspace OWNER/ADMIN via bypass).
Change project roster only if they are project MANAGER or workspace OWNER/ADMIN (bypass).

---Can’t---
POST /workspace/invite or PATCH /workspace/settings (blocked by RolesGuard unless they are OWNER/ADMIN).
Add/remove project members or PATCH member role if they are only project MEMBER or VIEWER and not workspace OWNER/ADMIN.

Workspace GUEST
Can / can’t (for enforced behavior): same as workspace MEMBER on the routes we checked—only OWNER/ADMIN get the extra workspace and project-bypass powers. There is no separate “guest” branch in RolesGuard / ProjectRolesGuard.
Can’t (meaningfully, by design intent)
Treated as a limited workspace role in the schema, but task/project “read-only” is not fully enforced in the API (tasks/sprints/etc. only use JwtAuthGuard).
################################################
Project MANAGER
Can
POST /projects/:projectId/members (invite/add to project).
GET /projects/:projectId/members.
PATCH /projects/:projectId/members/:userId/role.
DELETE /projects/:projectId/members/:userId (cannot remove self; enforced in service).
All JWT-only app features (tasks, sprints, …) like any logged-in user.
Can’t
Use POST /workspace/invite or PATCH /workspace/settings unless they are also workspace OWNER/ADMIN.

Project MEMBER
Can
GET /projects/:projectId/members (listed explicitly in @ProjectRoles('MANAGER', 'MEMBER', 'VIEWER')).
All JWT-only features (tasks, etc.)—no project-role check on task routes today.
Can’t
Add/remove project members or change roles (those routes require MANAGER, unless workspace OWNER/ADMIN bypass applies).

Project VIEWER
Can
GET /projects/:projectId/members (same as MEMBER for this route).
JWT-only features (including tasks)—again, tasks are not gated by VIEWER in the backend.
Can’t
Add/remove members or change roles (needs MANAGER or workspace OWNER/ADMIN bypass).
