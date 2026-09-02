/**
 * Seed — one primary account owns all meaningful data; placeholder users exist
 * only for the workspace members list (no tasks/projects/notifications for them).
 *
 * Run: npx ts-node -r tsconfig-paths/register src/seed.ts
 *
 * LOGIN (only account you need):
 *   Email:    sachinthachamindu26@gmail.com
 *   Password: 12345678
 */

import mongoose, { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    refreshToken: String,
    passwordResetToken: String,
    passwordResetExpiry: Date,
  },
  { timestamps: true },
);

const WorkspaceSchema = new mongoose.Schema(
  {
    name: String,
    owner: { type: Types.ObjectId, ref: 'User' },
    settings: { type: Object, default: {} },
  },
  { timestamps: true },
);

const WorkspaceMemberSchema = new mongoose.Schema(
  {
    workspaceId: { type: Types.ObjectId, ref: 'Workspace', required: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    role: {
      type: String,
      enum: ['OWNER', 'ADMIN', 'MEMBER', 'GUEST'],
      default: 'MEMBER',
    },
  },
  { timestamps: true },
);

const ProjectSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    workspaceId: { type: Types.ObjectId, ref: 'Workspace' },
    createdBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);
ProjectSchema.index(
  { name: 'text', description: 'text' },
  { name: 'project_text_idx', weights: { name: 3, description: 1 } },
);

const ProjectMemberSchema = new mongoose.Schema(
  {
    projectId: { type: Types.ObjectId, ref: 'Project', required: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    role: {
      type: String,
      enum: ['MANAGER', 'MEMBER', 'VIEWER'],
      default: 'MEMBER',
    },
  },
  { timestamps: true },
);
ProjectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

const SprintSchema = new mongoose.Schema(
  {
    name: String,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['PLANNED', 'ACTIVE', 'CLOSED'],
      default: 'PLANNED',
    },
    projectId: { type: Types.ObjectId, ref: 'Project', required: true },
  },
  { timestamps: true },
);

const TaskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    projectId: { type: Types.ObjectId, ref: 'Project' },
    workspaceId: { type: Types.ObjectId, ref: 'Workspace' },
    assignee: { type: Types.ObjectId, ref: 'User' },
    createdBy: { type: Types.ObjectId, ref: 'User' },
    labels: { type: [String], default: [] },
    dueDate: Date,
    coverColor: String,
    order: { type: Number, default: 0 },
    checklist: { type: [Object], default: [] },
    attachments: { type: [String], default: [] },
    sprintId: { type: Types.ObjectId, ref: 'Sprint' },
    parentTaskId: { type: Types.ObjectId, ref: 'Task', default: null },
    blockedBy: { type: [{ type: Types.ObjectId, ref: 'Task' }], default: [] },
    blocks: { type: [{ type: Types.ObjectId, ref: 'Task' }], default: [] },
  },
  { timestamps: true },
);
TaskSchema.index(
  { title: 'text', description: 'text' },
  { name: 'task_text_idx', weights: { title: 3, description: 1 } },
);

const TaskCommentSchema = new mongoose.Schema(
  {
    taskId: { type: Types.ObjectId, ref: 'Task' },
    userId: { type: Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
  },
  { timestamps: true },
);
TaskCommentSchema.index({ content: 'text' }, { name: 'comment_text_idx' });

const TaskActivitySchema = new mongoose.Schema(
  {
    taskId: { type: Types.ObjectId, ref: 'Task' },
    userId: { type: Types.ObjectId, ref: 'User' },
    action: String,
    message: String,
  },
  { timestamps: true },
);

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User' },
    message: String,
    type: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const User = mongoose.model('User', UserSchema);
const Workspace = mongoose.model('Workspace', WorkspaceSchema);
const WorkspaceMember = mongoose.model('WorkspaceMember', WorkspaceMemberSchema);
const Project = mongoose.model('Project', ProjectSchema);
const ProjectMember = mongoose.model('ProjectMember', ProjectMemberSchema);
const Sprint = mongoose.model('Sprint', SprintSchema);
const Task = mongoose.model('Task', TaskSchema);
const TaskComment = mongoose.model('TaskComment', TaskCommentSchema);
const TaskActivity = mongoose.model('TaskActivity', TaskActivitySchema);
const Notification = mongoose.model('Notification', NotificationSchema);

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

const PRIMARY = {
  email: 'sachinthachamindu26@gmail.com',
  password: '12345678',
  name: 'Sachintha Chamindu',
};

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/saas-platform';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Workspace.deleteMany({}),
    WorkspaceMember.deleteMany({}),
    Project.deleteMany({}),
    ProjectMember.deleteMany({}),
    Sprint.deleteMany({}),
    Task.deleteMany({}),
    TaskComment.deleteMany({}),
    TaskActivity.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('🗑️  Cleared collections');

  const hashPrimary = await bcrypt.hash(PRIMARY.password, 10);
  const hashGhost = await bcrypt.hash('__no_login_placeholder__', 10);

  const owner = await User.create({
    name: PRIMARY.name,
    email: PRIMARY.email,
    password: hashPrimary,
  });

  // Placeholders: appear in Members only — do not use for login
  const [ghostA, ghostB, ghostC] = await User.insertMany([
    { name: 'Alex Rivera', email: 'placeholder.member1@internal.local', password: hashGhost },
    { name: 'Jordan Lee', email: 'placeholder.member2@internal.local', password: hashGhost },
    { name: 'Sam Okonkwo', email: 'placeholder.member3@internal.local', password: hashGhost },
  ]);

  const workspace = await Workspace.create({
    name: 'Capstone Workspace',
    owner: owner._id,
    settings: {
      theme: 'light',
      allowPublicLinks: true,
      defaultView: 'kanban',
      timezone: 'Asia/Colombo',
      weekStartsOn: 'monday',
    },
  });

  await WorkspaceMember.insertMany([
    { workspaceId: workspace._id, userId: owner._id, role: 'OWNER' },
    { workspaceId: workspace._id, userId: ghostA._id, role: 'ADMIN' },
    { workspaceId: workspace._id, userId: ghostB._id, role: 'MEMBER' },
    { workspaceId: workspace._id, userId: ghostC._id, role: 'GUEST' },
  ]);

  const projectDefs = [
    {
      name: 'Thesis Management',
      description: 'Literature review, experiments, writing milestones, and supervisor checkpoints.',
    },
    {
      name: 'Product UI Revamp',
      description: 'Design system rollout, accessibility audit, and component library for the client app.',
    },
    {
      name: 'API & Integrations',
      description: 'REST v2, webhooks, third-party OAuth providers, and observability dashboards.',
    },
    {
      name: 'Mobile Companion',
      description: 'React Native app: auth, offline cache, push notifications, and store submission.',
    },
    {
      name: 'Research Data Pipeline',
      description: 'ETL jobs, validation rules, export formats, and scheduled backups.',
    },
    {
      name: 'Team Operations',
      description: 'Onboarding docs, runbooks, incident templates, and quarterly planning.',
    },
  ];

  const projects = await Project.insertMany(
    projectDefs.map((p) => ({
      ...p,
      workspaceId: workspace._id,
      createdBy: owner._id,
    })),
  );

  const projectMembers: any[] = [];
  for (const p of projects) {
    projectMembers.push({ projectId: p._id, userId: owner._id, role: 'MANAGER' });
    projectMembers.push({ projectId: p._id, userId: ghostA._id, role: 'MEMBER' });
    projectMembers.push({ projectId: p._id, userId: ghostB._id, role: 'MEMBER' });
    if (String(p.name).includes('Team') || String(p.name).includes('Thesis')) {
      projectMembers.push({ projectId: p._id, userId: ghostC._id, role: 'VIEWER' });
    }
  }
  await ProjectMember.insertMany(projectMembers);

  const sprintTemplates = [
    { label: 'Sprint 1 — Foundation', status: 'CLOSED' as const, startDay: -28, endDay: -15 },
    { label: 'Sprint 2 — Build', status: 'ACTIVE' as const, startDay: -14, endDay: 7 },
    { label: 'Sprint 3 — Polish', status: 'PLANNED' as const, startDay: 1, endDay: 28 },
  ];

  const allSprints: any[] = [];
  for (const p of projects) {
    for (const tpl of sprintTemplates) {
      allSprints.push({
        name: `${p.name.split(' ')[0]} · ${tpl.label}`,
        startDate: daysFromNow(tpl.startDay),
        endDate: daysFromNow(tpl.endDay),
        status: tpl.status,
        projectId: p._id,
      });
    }
  }
  const sprints = await Sprint.insertMany(allSprints);

  const sprintsByProject = new Map<string, Types.ObjectId[]>();
  for (const s of sprints) {
    const pid = String(s.projectId);
    if (!sprintsByProject.has(pid)) sprintsByProject.set(pid, []);
    sprintsByProject.get(pid)!.push(s._id);
  }

  const labelsPool = ['docs', 'frontend', 'backend', 'urgent', 'research', 'design', 'qa', 'devops'];
  const taskTitles = [
    'Kickoff notes & scope doc',
    'Stakeholder interview summary',
    'Wireframes v1 review',
    'API contract draft',
    'DB migration script',
    'Unit tests for auth module',
    'E2E: login + workspace switch',
    'Error boundary + logging',
    'Performance budget checklist',
    'Security headers verification',
    'Sprint retrospective template',
    'Risk register update',
    'Budget vs actual spreadsheet',
    'Slide deck for mid-review',
    'User testing script',
    'Analytics event naming',
    'Feature flag rollout plan',
    'Dependency upgrade (minor)',
    'CI cache optimisation',
    'Backup restore drill',
  ];

  const tasksToInsert: any[] = [];
  let orderCounter = 0;
  for (const p of projects) {
    const spIds = sprintsByProject.get(String(p._id)) || [];
    const nTasks = 14;
    for (let i = 0; i < nTasks; i++) {
      const statusRoll = i % 5;
      const status = statusRoll === 0 ? 'done' : statusRoll <= 2 ? 'in_progress' : 'todo';
      const priority = i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low';
      const assignToOwner = i % 4 !== 0; // ~75% assigned to you for “My Tasks”
      const title = `${taskTitles[i % taskTitles.length]} — ${p.name}`;
      const checklist =
        i % 2 === 0
          ? [
              { id: 'a', text: 'Draft outline', isCompleted: status === 'done' },
              { id: 'b', text: 'Peer review', isCompleted: status === 'done' },
              { id: 'c', text: 'Publish / hand off', isCompleted: status === 'done' },
            ]
          : [{ id: 'x', text: 'Initial pass', isCompleted: status === 'done' }];

      tasksToInsert.push({
        title,
        description: `Tracked under ${p.name}. Owner: ${PRIMARY.name}. Priority ${priority}; keep notes in the thesis log.`,
        status,
        priority,
        projectId: p._id,
        workspaceId: workspace._id,
        assignee: assignToOwner ? owner._id : null,
        createdBy: owner._id,
        labels: [labelsPool[i % labelsPool.length], labelsPool[(i + 3) % labelsPool.length]],
        dueDate: daysFromNow((i % 7) - 2),
        order: orderCounter++,
        checklist,
        sprintId: spIds[i % spIds.length],
      });
    }
  }

  const tasks = await Task.insertMany(tasksToInsert);

  // Subtasks on first project (parent = first task of thesis project)
  const thesis = projects.find((p) => p.name.includes('Thesis'));
  if (thesis) {
    const top = tasks.find((t) => String(t.projectId) === String(thesis._id));
    if (top) {
      await Task.insertMany([
        {
          title: 'Subtask: Collect supervisor feedback',
          description: 'Email draft + meeting notes.',
          status: 'in_progress',
          priority: 'high',
          projectId: thesis._id,
          workspaceId: workspace._id,
          assignee: owner._id,
          createdBy: owner._id,
          parentTaskId: top._id,
          labels: ['docs'],
          order: 1,
        },
        {
          title: 'Subtask: Appendix figures',
          description: 'Export charts at 300dpi.',
          status: 'todo',
          priority: 'medium',
          projectId: thesis._id,
          workspaceId: workspace._id,
          assignee: owner._id,
          createdBy: owner._id,
          parentTaskId: top._id,
          labels: ['research'],
          order: 2,
        },
      ]);
    }
  }

  // Dependency: link two tasks in first project
  const p0 = projects[0];
  const p0tasks = tasks.filter((t) => String(t.projectId) === String(p0._id)).sort((a, b) => a.order - b.order);
  if (p0tasks.length >= 2) {
    const [a, b] = p0tasks;
    await Task.updateOne({ _id: b._id }, { $push: { blockedBy: a._id } });
    await Task.updateOne({ _id: a._id }, { $push: { blocks: b._id } });
  }

  const comments: any[] = [];
  const activities: any[] = [];
  for (let i = 0; i < Math.min(40, tasks.length); i++) {
    const t = tasks[i];
    comments.push({
      taskId: t._id,
      userId: owner._id,
      content: `Update ${i + 1}: reviewed scope — next step is ${t.status === 'done' ? 'closed' : 'in progress'}.`,
    });
    activities.push(
      { taskId: t._id, userId: owner._id, action: 'created', message: 'Task created' },
      {
        taskId: t._id,
        userId: owner._id,
        action: 'updated',
        message: `Status set to ${t.status}`,
      },
    );
  }
  await TaskComment.insertMany(comments);
  await TaskActivity.insertMany(activities);

  await Notification.insertMany([
    { userId: owner._id, message: 'Sprint 2 — Build is now active across multiple projects.', type: 'sprint', isRead: false },
    { userId: owner._id, message: '3 tasks are due in the next 48 hours.', type: 'deadline', isRead: false },
    { userId: owner._id, message: 'Weekly digest: 12 tasks moved to Done.', type: 'digest', isRead: true },
    { userId: owner._id, message: 'New comment on Thesis Management board.', type: 'comment', isRead: false },
    { userId: owner._id, message: 'Reminder: submit mid-term report draft.', type: 'reminder', isRead: false },
    { userId: owner._id, message: 'API contract draft is ready for review.', type: 'task', isRead: true },
    { userId: owner._id, message: 'Placeholder.member1 was added as ADMIN (seed).', type: 'member', isRead: true },
    { userId: owner._id, message: 'Mobile Companion sprint ends in 7 days.', type: 'sprint', isRead: false },
    { userId: owner._id, message: 'High priority: Performance budget checklist.', type: 'priority', isRead: false },
    { userId: owner._id, message: 'Research pipeline backup verified OK.', type: 'system', isRead: true },
  ]);

  console.log('\n🎉 Seed complete.\n');
  console.log('══════════════════════════════════════════════════════');
  console.log('  SIGN IN (all app data belongs to this account):');
  console.log(`    Email:    ${PRIMARY.email}`);
  console.log(`    Password: ${PRIMARY.password}`);
  console.log('');
  console.log('  3 placeholder users exist for the Members page only.');
  console.log('  They are not meant for login.');
  console.log('══════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
