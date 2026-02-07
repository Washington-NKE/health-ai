# Known Issues & Fixes

## Current Issues Detected

### 1. TypeScript Errors in Staff/Doctor API Routes ❌

**Location**:

- `app/api/admin/staff/route.ts`
- `app/api/admin/doctors/route.ts`
- `app/api/admin/staff/[id]/route.ts`

**Issue**:
The code is trying to access `firstName` and `lastName` on the User model, but these fields already exist in the Prisma schema. The error is a TypeScript/Prisma Client generation issue.

**Current Schema** (Correct):

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  password      String?
  phone         String?
  firstName     String?    // ✅ Already exists
  lastName      String?    // ✅ Already exists
  role          UserRole  @default(patient)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
}
```

**Fix Required**:

```bash
# Regenerate Prisma Client
npx prisma generate

# Push schema to ensure sync
npx prisma db push
```

**Status**: Minor - Will resolve after Prisma client regeneration

---

### 2. Tailwind CSS Gradient Class Warnings ⚠️

**Issue**: Tailwind v4 prefers `bg-linear-to-*` instead of `bg-gradient-to-*`

**Affected Files**:

- Multiple UI components using gradients
- Not a breaking error, just deprecation warnings

**Fix** (Optional - for Tailwind v4 compliance):
Find and replace:

- `bg-gradient-to-br` → `bg-linear-to-br`
- `bg-gradient-to-r` → `bg-linear-to-r`
- `bg-gradient-to-b` → `bg-linear-to-b`

**Status**: Low priority - Current code works fine

---

### 3. Chart Component Type Issues ⚠️

**Location**:

- `app/admin/billing/page.tsx` (line 294)
- `app/admin/dashboard/page.tsx` (line 251)

**Issue**:

```typescript
label={(entry) => `${entry.status}: ${entry.count}`}
// Property 'status' does not exist on type 'PieLabelRenderProps'
```

**Fix**:

```typescript
// Change from:
label={(entry) => `${entry.status}: ${entry.count}`}

// To:
label={(entry: any) => `${entry.status}: ${entry.count}`}
// OR use proper Recharts typing:
label={(entry) => {
  const data = entry as { status: string; count: number };
  return `${data.status}: ${data.count}`;
}}
```

**Status**: Minor visual issue - Charts still render correctly

---

## Quick Fix Commands

### Run These in Order:

```bash
# 1. Regenerate Prisma Client (Fixes TypeScript errors)
npx prisma generate

# 2. Verify database sync
npx prisma db push

# 3. Clear Next.js cache
rm -rf .next

# 4. Rebuild
npm run build

# 5. Restart dev server
npm run dev
```

---

## Testing Checklist After Fixes

- [ ] Admin can create staff members
- [ ] Admin can create doctors
- [ ] Admin dashboard charts display correctly
- [ ] Billing page charts render properly
- [ ] No TypeScript errors in terminal
- [ ] All pages load without console errors

---

## Non-Critical Improvements

### Code Quality

1. Add TypeScript strict mode checking
2. Implement ESLint rules for unused variables
3. Add Prettier auto-formatting
4. Set up Husky pre-commit hooks

### Performance

1. Implement React.memo for heavy components
2. Add loading skeletons for better UX
3. Optimize image loading with Next.js Image
4. Implement route prefetching

### Accessibility

1. Add ARIA labels to interactive elements
2. Ensure keyboard navigation works
3. Add focus indicators
4. Test with screen readers

---

_Last Updated: February 8, 2026_
