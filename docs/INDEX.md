# Guidelight Documentation Index

**Last Updated:** 2025-11-25  
**Maintainer:** Xylent Studios

This is the central hub for all Guidelight project documentation. If you're new to the project, start with the **Getting Started** section below.

---

## 📖 Documentation Map

### **For New Developers: Start Here**
1. [README.md](../README.md) - Project overview, tech stack, setup instructions
2. [CONTRIBUTING.md](../CONTRIBUTING.md) - How to contribute, code style, workflow
3. [docs/GUIDELIGHT_SPEC.md](./GUIDELIGHT_SPEC.md) - Full product specification
4. [notes/DEV_QUICK_REFERENCE.md](../notes/DEV_QUICK_REFERENCE.md) - Code patterns & quick lookup

### **Product Documentation**
| Document | Purpose | Audience | Status | Last Updated |
|----------|---------|----------|--------|--------------|
| [GUIDELIGHT_SPEC.md](./GUIDELIGHT_SPEC.md) | Complete product specification: features, flows, data model, permissions | Product, Engineering | ✅ Active | 2025-11-25 |
| [GUIDELIGHT_DESIGN_SYSTEM.md](./GUIDELIGHT_DESIGN_SYSTEM.md) | Design tokens, color palette, typography, component patterns | Design, Engineering | ✅ Active | 2025-11-25 |

### **Technical Documentation**
| Document | Purpose | Audience | Status | Last Updated |
|----------|---------|----------|--------|--------------|
| [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md) | System architecture, data flow, API structure, security model | Engineering | ✅ Active | 2025-11-25 |
| [AI_ASSISTANCE.md](./AI_ASSISTANCE.md) | Guide for using AI tools (Cursor, Supabase MCP) with Guidelight | Engineering | ✅ Active | 2025-11-25 |
| [GUIDELIGHT_DEV_AGENT.md](./GUIDELIGHT_DEV_AGENT.md) | Instructions for Cursor agent when working on Guidelight | Engineering | ✅ Active | 2025-11-25 |

### **Planning & Implementation**
| Document | Purpose | Audience | Status | Last Updated |
|----------|---------|----------|--------|--------------|
| [notes/GUIDELIGHT_MVP_IMPLEMENTATION_PLAN.md](../notes/GUIDELIGHT_MVP_IMPLEMENTATION_PLAN.md) | Step-by-step MVP implementation guide (8 steps) | Engineering | ✅ Complete | 2025-11-25 |
| [notes/GUIDELIGHT_MVP_PROGRESS.md](../notes/GUIDELIGHT_MVP_PROGRESS.md) | Progress log of v1.0.0 and v1.1.0 implementation | Engineering, Product | ✅ Active | 2025-11-25 |
| [notes/MVP_CRITICAL_DECISIONS.md](../notes/MVP_CRITICAL_DECISIONS.md) | Record of key architectural and product decisions | Engineering, Product | ✅ Active | 2025-11-25 |
| [notes/DEV_QUICK_REFERENCE.md](../notes/DEV_QUICK_REFERENCE.md) | Copy-paste code patterns, common errors, commands | Engineering | ✅ Active | 2025-11-25 |
| [notes/DOCUMENTATION_STANDARDS.md](../notes/DOCUMENTATION_STANDARDS.md) | Documentation guidelines, conventions, and best practices | All | ✅ Active | 2025-11-25 |

### **Deployment & Operations**
| Document | Purpose | Audience | Status | Last Updated |
|----------|---------|----------|--------|--------------|
| [DEPLOYMENT.md](../DEPLOYMENT.md) | Complete guide for deploying to Netlify with Supabase | Engineering, Operations | ✅ Active | 2025-11-25 |
| [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) | Step-by-step deployment and testing checklist | Engineering, Operations | ✅ Active | 2025-11-25 |
| [QUICK_START.md](../QUICK_START.md) | Quick reference for deployment and local development | Engineering | ✅ Active | 2025-11-25 |
| [CHANGELOG.md](../CHANGELOG.md) | Version history and release notes | All | ✅ Active | 2025-11-25 |

### **Future Features (Post-MVP)**
| Document | Purpose | Audience | Status | Last Updated |
|----------|---------|----------|--------|--------------|
| [NEXT_STEPS.md](../NEXT_STEPS.md) | Post-v1.0.0 roadmap: 20 prioritized enhancements | Engineering, Product | ✅ Active | 2025-11-25 |
| [BUDTENDER_PICKS_BOARD_SPEC.md](./BUDTENDER_PICKS_BOARD_SPEC.md) | Product spec for customer-facing board feature | Product, Design | 📋 Future | Pre-MVP |
| [BUDTENDER_PICKS_BOARD_TECH_DESIGN.md](./BUDTENDER_PICKS_BOARD_TECH_DESIGN.md) | Technical design for board feature implementation | Engineering | 📋 Future | Pre-MVP |

### **Archived / Superseded**
| Document | Purpose | Status | Superseded By |
|----------|---------|--------|---------------|
| [notes/GUIDELIGHT_MVP_SPRINT_PLAN.md](../notes/GUIDELIGHT_MVP_SPRINT_PLAN.md) | Original detailed sprint plan (exploratory) | 🗄️ Archived | `GUIDELIGHT_MVP_IMPLEMENTATION_PLAN.md` |

---

## 🎯 Quick Links by Task

### "I need to understand..."
- **What Guidelight is** → [README.md](../README.md)
- **What features we're building** → [GUIDELIGHT_SPEC.md](./GUIDELIGHT_SPEC.md)
- **How the system is architected** → [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)
- **Why we made decision X** → [MVP_CRITICAL_DECISIONS.md](../notes/MVP_CRITICAL_DECISIONS.md)

### "I need to implement..."
- **Feature X** → [GUIDELIGHT_MVP_IMPLEMENTATION_PLAN.md](../notes/GUIDELIGHT_MVP_IMPLEMENTATION_PLAN.md)
- **Auth flow** → [ARCHITECTURE_OVERVIEW.md § 2.2](./ARCHITECTURE_OVERVIEW.md) + [DEV_QUICK_REFERENCE.md § Auth Patterns](../notes/DEV_QUICK_REFERENCE.md)
- **UI component** → [GUIDELIGHT_DESIGN_SYSTEM.md](./GUIDELIGHT_DESIGN_SYSTEM.md)

### "I'm stuck with..."
- **Code pattern** → [DEV_QUICK_REFERENCE.md](../notes/DEV_QUICK_REFERENCE.md)
- **Error message** → [DEV_QUICK_REFERENCE.md § Common Errors](../notes/DEV_QUICK_REFERENCE.md)
- **RLS policy** → [ARCHITECTURE_OVERVIEW.md § 7.3](./ARCHITECTURE_OVERVIEW.md)

### "I need to know..."
- **What changed** → [notes/GUIDELIGHT_MVP_PROGRESS.md](../notes/GUIDELIGHT_MVP_PROGRESS.md)
- **What's next** → Check current step in [GUIDELIGHT_MVP_IMPLEMENTATION_PLAN.md](../notes/GUIDELIGHT_MVP_IMPLEMENTATION_PLAN.md)
- **Project status** → [notes/GUIDELIGHT_MVP_PROGRESS.md](../notes/GUIDELIGHT_MVP_PROGRESS.md) (latest entry)

---

## 📂 Folder Structure

```
guidelight/
├── README.md                              # Project overview & setup
├── CHANGELOG.md                           # Version history (v1.0.0 released)
├── CONTRIBUTING.md                        # Contribution guidelines
├── DEPLOYMENT.md                          # Complete deployment guide
├── DEPLOYMENT_CHECKLIST.md                # Deployment testing checklist
├── QUICK_START.md                         # Quick deployment reference
├── NEXT_STEPS.md                          # Post-v1.0.0 roadmap
├── netlify.toml                           # Netlify configuration
│
├── docs/                                  # Core documentation
│   ├── INDEX.md                           # ← You are here
│   ├── GUIDELIGHT_SPEC.md                 # Product specification
│   ├── ARCHITECTURE_OVERVIEW.md           # Technical architecture
│   ├── GUIDELIGHT_DESIGN_SYSTEM.md        # Design system
│   ├── AI_ASSISTANCE.md                   # AI tooling guide
│   ├── GUIDELIGHT_DEV_AGENT.md            # Cursor agent instructions
│   ├── BUDTENDER_PICKS_BOARD_SPEC.md      # Future feature spec
│   └── BUDTENDER_PICKS_BOARD_TECH_DESIGN.md  # Future feature tech design
│
├── notes/                                 # Planning, decisions, logs
│   ├── GUIDELIGHT_MVP_IMPLEMENTATION_PLAN.md  # MVP plan (completed)
│   ├── GUIDELIGHT_MVP_PROGRESS.md         # v1.0.0 + v1.1.0 progress log
│   ├── MVP_CRITICAL_DECISIONS.md          # Decision log (includes v1.1.0 updates)
│   ├── DEV_QUICK_REFERENCE.md             # Code patterns
│   ├── DOCUMENTATION_STANDARDS.md         # Doc guidelines
│   ├── RLS_MANAGER_POLICIES.sql           # SQL migrations (applied)
│   ├── STEP_7_STAFF_MANAGEMENT_PLAN.md    # Staff management spec
│   └── GUIDELIGHT_MVP_SPRINT_PLAN.md      # (Archived) Original sprint plan
│
└── supabase/functions/                   # Edge Functions (deployed)
    ├── invite-staff/                      # v7 - One-click staff invitation
    ├── get-staff-with-status/             # v2 - Staff dashboard data
    └── reset-staff-password/              # v1 - Manager password reset
```

---

## 🔄 Document Lifecycle

### **Status Definitions**
- ✅ **Active** - Current, accurate, regularly updated
- 📋 **Future** - Planned feature, not yet implemented
- 🗄️ **Archived** - Superseded or historical reference only
- 🚧 **Draft** - Work in progress, not yet final

### **Update Process**
1. When you update a document, change the "Last Updated" date in its frontmatter
2. Update this INDEX.md if you add/remove/archive docs
3. For major changes, add entry to CHANGELOG.md
4. Archive superseded docs by moving to `docs/archived/` or adding deprecation notice

---

## 🤝 Contributing to Docs

See [CONTRIBUTING.md](../CONTRIBUTING.md) for general contribution guidelines.

**Documentation-specific guidelines:**
- Use clear, concise language
- Include code examples where helpful
- Keep docs up-to-date with code changes
- Add "Last Updated" dates to all docs
- Use consistent formatting (headings, lists, code blocks)

---

## 📝 Notes

- All documentation uses Markdown format
- Code examples use triple-backtick fences with language tags
- Internal links use relative paths
- External links include descriptive text

**Questions about documentation?** Ask Justin or file an issue.

---

**This index is maintained manually. Last reviewed: 2025-11-25 (v1.1.0 Profile Enhancement & Landing Screen)**

