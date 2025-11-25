# Guidelight Documentation Standards

**Last Updated:** 2025-11-25

This document defines documentation standards for the Guidelight project to ensure consistency, maintainability, and discoverability.

---

## 📋 Documentation Principles

### 1. Discoverability
- New developers should find what they need in < 5 minutes
- Always update `docs/INDEX.md` when adding/removing docs
- Use descriptive file names (`GUIDELIGHT_SPEC.md`, not `spec.md`)

### 2. Maintainability
- Include metadata table at top of all active docs
- Update "Last Updated" date when making changes
- Keep docs close to the code they describe

### 3. Consistency
- Use standardized frontmatter format (see below)
- Follow Markdown conventions (see below)
- Use emoji status indicators consistently

### 4. Context Preservation
- Archive superseded docs instead of deleting
- Document decision rationale in `MVP_CRITICAL_DECISIONS.md`
- Keep historical reference available for future developers

---

## 📝 Document Frontmatter Template

Add this metadata table to the top of all active documentation (after title, before content):

```markdown
# Document Title

---
**Document Metadata**

| Field | Value |
|-------|-------|
| **Status** | ✅ Active / 📋 Future / 🗄️ Archived |
| **Last Updated** | YYYY-MM-DD |
| **Owner** | Name / Team |
| **Audience** | Product / Engineering / Design / All |
| **Purpose** | One-sentence description of document purpose |

---

## Content starts here...
```

### Status Indicators

| Emoji | Status | Meaning |
|-------|--------|---------|
| ✅ | Active | Current, accurate, regularly updated |
| 📋 | Future | Planned feature, not yet implemented |
| 🗄️ | Archived | Superseded or historical reference only |
| 🚧 | Draft | Work in progress, not yet final |

---

## 📂 Folder Organization

### `docs/` - Permanent Reference Documentation
**Purpose:** Long-lived documentation that describes the product, architecture, and systems

**Contains:**
- Product specifications
- Technical architecture
- API documentation
- Design system
- AI tooling guides

**Characteristics:**
- Updated as product evolves
- Rarely deleted
- High-level, conceptual

### `notes/` - Planning, Decisions, and Logs
**Purpose:** Working documents for planning, decision tracking, and progress logs

**Contains:**
- Implementation plans
- Decision records (ADRs)
- Progress logs
- Quick references
- SQL migrations

**Characteristics:**
- More tactical, execution-focused
- May be archived when superseded
- Often includes code snippets

### `root/` - Entry Points
**Purpose:** First documents developers see

**Contains:**
- `README.md` - Project overview
- `CHANGELOG.md` - Version history
- `CONTRIBUTING.md` - Contribution guidelines

---

## ✍️ Markdown Conventions

### Headings
```markdown
# Top-level (H1) - Document title only
## Major sections (H2)
### Subsections (H3)
#### Sub-subsections (H4) - avoid if possible
```

### Code Blocks
Always specify language for syntax highlighting:

```markdown
```typescript
const example = 'code';
```
```

### Lists
- Use `-` for unordered lists
- Use `1.` for ordered lists (Markdown auto-numbers)
- Indent nested lists with 2 spaces

### Links
```markdown
[Link text](./relative/path.md) - Internal links (relative paths)
[Link text](https://example.com) - External links (absolute URLs)
```

### Tables
```markdown
| Column 1 | Column 2 |
|----------|----------|
| Value 1  | Value 2  |
```

### Emphasis
- `**bold**` for important terms
- `*italic*` for emphasis
- `` `code` `` for inline code, file names, commands

---

## 🔄 Document Lifecycle

### Creating New Documents

1. **Choose location:**
   - Permanent reference → `docs/`
   - Planning/decisions → `notes/`
   - Entry point → root

2. **Add frontmatter:**
   - Status, Last Updated, Owner, Audience, Purpose

3. **Update `docs/INDEX.md`:**
   - Add to appropriate table
   - Include purpose and status

4. **Link from related docs:**
   - Cross-reference from relevant documents

### Updating Existing Documents

1. **Make changes**
2. **Update "Last Updated" date** in frontmatter
3. **If major change:**
   - Add entry to `CHANGELOG.md`
   - Notify team (commit message, PR description)

### Archiving Documents

1. **Add deprecation notice** to top of document:
   ```markdown
   ---
   **⚠️ ARCHIVED DOCUMENT**
   
   **Status:** 🗄️ Archived / Superseded  
   **Superseded By:** `NEW_DOCUMENT.md`  
   **Date Archived:** YYYY-MM-DD  
   **Reason:** Brief explanation
   ---
   ```

2. **Update status in `docs/INDEX.md`** to 🗄️ Archived

3. **Move to archive folder** (optional):
   - Create `docs/archived/` or `notes/archived/`
   - Move file and update all links

4. **Do NOT delete** - keep for historical reference

---

## 📊 CHANGELOG.md Guidelines

Follow [Keep a Changelog](https://keepachangelog.com/) format:

### Structure
```markdown
# Changelog

## [Unreleased]
### Added
- New features

### Changed
- Changes to existing functionality

### Fixed
- Bug fixes

## [Version] - YYYY-MM-DD
### Added
- Feature X

### Removed
- Feature Y
```

### Categories
- **Added** - New features or files
- **Changed** - Changes to existing functionality
- **Deprecated** - Features marked for removal
- **Removed** - Deleted features
- **Fixed** - Bug fixes
- **Security** - Security-related changes

### When to Update
- After completing each implementation step
- Before merging major features
- After significant refactors
- For all breaking changes

---

## 🎯 Documentation Checklist

Before merging a PR with documentation changes:

- [ ] All new docs include frontmatter metadata
- [ ] "Last Updated" dates are current
- [ ] `docs/INDEX.md` is updated if docs added/removed
- [ ] `CHANGELOG.md` is updated for significant changes
- [ ] Archived docs have deprecation notice
- [ ] Code examples are tested and accurate
- [ ] Links are relative paths (not absolute)
- [ ] Markdown renders correctly (preview in editor)
- [ ] No typos or grammar errors (use spell check)

---

## 🚀 Best Practices from Real Dev Teams

### What Great Teams Do
✅ **Single Source of Truth** - One index, clear hierarchy  
✅ **Living Documents** - Docs evolve with code  
✅ **Context Preservation** - Decision rationale captured  
✅ **Onboarding Friendly** - Clear entry points for new devs  
✅ **Version Tracking** - CHANGELOG for transparency  

### What to Avoid
❌ Scattered docs with no index  
❌ Outdated docs without deprecation notices  
❌ Missing context (why was this decided?)  
❌ Tribal knowledge not written down  
❌ "Update docs" as afterthought  

---

## 📚 External Resources

- [Keep a Changelog](https://keepachangelog.com/) - CHANGELOG.md format
- [Semantic Versioning](https://semver.org/) - Version numbering
- [Markdown Guide](https://www.markdownguide.org/) - Markdown syntax
- [Write the Docs](https://www.writethedocs.org/) - Documentation community

---

## 💬 Questions?

If you're unsure about documentation standards:
1. Check `docs/INDEX.md` for examples
2. Look at existing docs for patterns
3. Ask Justin or file an issue

**When in doubt, document it.** Future you will thank present you.

---

**Maintained by:** Xylent Studios  
**Last reviewed:** 2025-11-25

