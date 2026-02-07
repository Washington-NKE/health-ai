# Contributing to Healthcare AI Assistant

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing](#testing)
8. [Documentation](#documentation)

---

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, gender, gender identity, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers and help them get started
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment, trolling, or discriminatory comments
- Personal attacks or derogatory language
- Publishing others' private information
- Other conduct deemed inappropriate in a professional setting

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git installed locally
- Code editor (VS Code recommended)
- Basic knowledge of Next.js, React, and TypeScript

### Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/healthcare-ai-assistant.git
cd healthcare-ai-assistant

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/healthcare-ai-assistant.git
```

### Initial Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# At minimum, you need:
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - GOOGLE_GENERATIVE_AI_API_KEY

# Setup database
npx prisma generate
npx prisma db push
npm run seed

# Start development
npm run dev
```

---

## 💻 Development Workflow

### 1. Create a Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# OR
git checkout -b fix/bug-description
# OR
git checkout -b docs/documentation-update
```

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/email-notifications`)
- `fix/` - Bug fixes (e.g., `fix/appointment-conflict`)
- `docs/` - Documentation only (e.g., `docs/api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-logic`)
- `test/` - Adding tests (e.g., `test/api-routes`)
- `chore/` - Maintenance tasks (e.g., `chore/update-deps`)

### 2. Make Changes

- Write clean, readable code
- Follow the coding standards (see below)
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Start dev server and manually test
npm run dev

# Build to check for TypeScript errors
npm run build

# Check linting
npm run lint

# (Future) Run automated tests
npm test
```

### 4. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with conventional commit message
git commit -m "feat: add email notification feature"
```

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Go to GitHub and create Pull Request
```

---

## 📝 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ DO: Use explicit types
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// ❌ DON'T: Use 'any' unless absolutely necessary
const userData: any = {};

// ✅ DO: Use meaningful variable names
const userAppointments = await fetchAppointments(userId);

// ❌ DON'T: Use abbreviations or unclear names
const uAppts = await fetchAppts(uid);

// ✅ DO: Add JSDoc comments for functions
/**
 * Fetches user appointments from database
 * @param userId - Unique user identifier
 * @param status - Optional appointment status filter
 * @returns Promise with appointment array
 */
async function getUserAppointments(
  userId: string,
  status?: AppointmentStatus,
): Promise<Appointment[]> {
  // ...
}
```

### React Component Guidelines

```tsx
// ✅ DO: Use function components with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ label, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {label}
    </button>
  );
}

// ✅ DO: Extract custom hooks for reusable logic
function useAppointments(userId: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments(userId)
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, [userId]);

  return { appointments, loading };
}

// ✅ DO: Use proper prop destructuring
function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <Card>
      <h3>{user.name}</h3>
      {/* ... */}
    </Card>
  );
}
```

### API Route Guidelines

```typescript
// app/api/example/route.ts

// ✅ DO: Proper error handling
export async function GET(req: Request) {
  try {
    const session = await auth();

    // Check authentication
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check authorization
    if (session.user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await prisma.user.findMany();
    return Response.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ✅ DO: Validate input with Zod
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["patient", "doctor", "admin", "staff"]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = createUserSchema.parse(body);

    // Proceed with validated data
    const user = await createUser(validated);
    return Response.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }
    throw error;
  }
}
```

### File Organization

```bash
# Component files
components/
  ├── ui/                    # Shadcn UI components
  ├── UserCard.tsx          # Component
  └── user-card.module.css  # Styles (if needed)

# Feature-based organization
app/
  ├── admin/
  │   ├── appointments/
  │   │   └── page.tsx
  │   └── layout.tsx
  └── api/
      └── appointments/
          └── route.ts
```

### Styling

```tsx
// ✅ DO: Use Tailwind utility classes
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
  <Avatar />
  <div className="flex-1">
    <h3 className="text-lg font-semibold">{name}</h3>
    <p className="text-sm text-slate-600">{email}</p>
  </div>
</div>;

// ✅ DO: Use cn() utility for conditional classes
import { cn } from "@/lib/utils";

<Button
  className={cn(
    "px-4 py-2 rounded",
    variant === "primary" && "bg-blue-600 text-white",
    variant === "secondary" && "bg-slate-200 text-slate-800",
    disabled && "opacity-50 cursor-not-allowed",
  )}
>
  {label}
</Button>;
```

---

## 📦 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependencies

### Examples

```bash
# Feature
git commit -m "feat(auth): add password reset functionality"

# Bug fix
git commit -m "fix(appointments): prevent double booking conflicts"

# Documentation
git commit -m "docs: update API route documentation"

# Breaking change
git commit -m "feat(api): change appointment status enum
BREAKING CHANGE: appointment status 'pending' renamed to 'requested'"
```

### Commit Message Best Practices

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Keep subject line under 50 characters
- Capitalize first letter of subject
- No period at end of subject
- Separate subject from body with blank line
- Wrap body at 72 characters
- Explain _what_ and _why_, not _how_

---

## 🔄 Pull Request Process

### Before Submitting

1. ✅ Code follows project style guidelines
2. ✅ All tests pass (when implemented)
3. ✅ No console errors or warnings
4. ✅ Documentation updated if needed
5. ✅ Commits follow conventional commit format
6. ✅ Branch is up to date with main

### PR Template

When creating a PR, include:

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Screenshots (if applicable)

[Add screenshots here]

## Testing

How to test these changes:

1. Step 1
2. Step 2
3. Step 3

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated (if applicable)
```

### PR Review Process

1. Automated checks run (lint, build)
2. Maintainer reviews code
3. Feedback provided if needed
4. You address feedback
5. Approved and merged

### After Merge

```bash
# Update your local main
git checkout main
git pull upstream main

# Delete feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## 🧪 Testing

### Manual Testing Checklist

When testing your changes:

- [ ] Test in Chrome/Firefox/Safari
- [ ] Test responsive design on mobile
- [ ] Test all user roles (patient, doctor, admin, staff)
- [ ] Test error cases (invalid input, network errors)
- [ ] Test edge cases (empty lists, max limits)
- [ ] Check console for errors/warnings
- [ ] Verify database changes are correct

### Future: Automated Tests

We plan to add:

- Unit tests (Jest + React Testing Library)
- Integration tests (API routes)
- E2E tests (Playwright)

---

## 📚 Documentation

### What to Document

When making changes, update relevant documentation:

- **Code Comments**: Complex logic, why (not what)
- **README.md**: Setup instructions, dependencies
- **PROJECT_DOCUMENTATION.md**: Feature descriptions, architecture
- **API Documentation**: New endpoints, parameters
- **JSDoc Comments**: Public functions and components

### Example Documentation

```typescript
/**
 * Books an appointment for a patient
 *
 * This function checks doctor availability, prevents double bookings,
 * and sends a confirmation email to the patient.
 *
 * @param patientId - Unique identifier for the patient
 * @param doctorId - Unique identifier for the doctor
 * @param appointmentDate - Desired appointment date and time
 * @param reason - Optional reason for the visit
 * @returns Promise resolving to the created appointment
 * @throws {Error} If doctor is unavailable or slot is taken
 *
 * @example
 * const appointment = await bookAppointment(
 *   'patient_123',
 *   'doctor_456',
 *   new Date('2026-02-15T10:00:00'),
 *   'Annual checkup'
 * );
 */
export async function bookAppointment(
  patientId: string,
  doctorId: string,
  appointmentDate: Date,
  reason?: string,
): Promise<Appointment> {
  // Implementation
}
```

---

## 🎯 Areas Needing Contribution

### High Priority

- [ ] Email notification system
- [ ] Appointment conflict detection
- [ ] Password reset flow
- [ ] Unit tests setup
- [ ] API route tests

### Medium Priority

- [ ] Report generation (PDFs)
- [ ] File upload system
- [ ] Advanced analytics
- [ ] Payment integration
- [ ] Search improvements

### Low Priority

- [ ] Multi-language support
- [ ] PWA features
- [ ] Dark mode
- [ ] Mobile optimization
- [ ] Accessibility improvements

See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md#improvement-recommendations) for detailed descriptions.

---

## 💡 Questions?

- **General Questions**: Open a GitHub Discussion
- **Bug Reports**: Open a GitHub Issue
- **Feature Requests**: Open a GitHub Issue with `feature` label
- **Security Issues**: Email security@example.com (or create private issue)

---

## 🙏 Recognition

Contributors will be recognized in:

- README.md Contributors section
- Release notes
- Project documentation

Thank you for contributing! 🎉

---

_Last Updated: February 8, 2026_
