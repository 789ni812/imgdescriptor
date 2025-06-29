# Documentation Review Template

## Quick Reference for New Functionality

**Use this template when proposing or implementing new features to ensure comprehensive documentation coverage.**

---

## 🎯 Feature Overview
**Feature Name:** [Brief description]
**Proposed by:** [Your name]
**Date:** [YYYY-MM-DD]
**Complexity Tier:** [Tier 1/2/3 - see below]

---

## 📊 Documentation Tiers

### Tier 1: Small Changes (5-10 min review)
**Examples:** Bug fixes, minor UI tweaks, simple text changes
- [ ] Update relevant code comments
- [ ] Update `spec.md` if it's a tracked task
- [ ] Quick test to ensure nothing broke

### Tier 2: Medium Features (15-30 min review)
**Examples:** New components, API endpoints, state changes
- [ ] **Core Documents**: Update `ARCHITECTURE.md` and `spec.md`
- [ ] **Code**: Add JSDoc comments, update types
- [ ] **Tests**: Ensure comprehensive test coverage
- [ ] **Future-proofing**: Quick check for template type compatibility

### Tier 3: Major Features (30-60 min review)
**Examples:** New game mechanics, major refactoring, new template types
- [ ] **Full Review**: All documents and diagrams
- [ ] **Architecture Impact**: Data models, state management, API changes
- [ ] **Future Directions**: Update `IDEAS.md` with new use cases
- [ ] **Workflow Updates**: Update `.cursor/rules/` if needed

---

## 🚀 Quick Commands

```bash
# Check for broken documentation links
grep -r "\[.*\](" . --include="*.md"

# Find TODO/FIXME items
grep -r "TODO\|FIXME\|PENDING" . --include="*.md"

# Run tests to ensure documentation matches code
npm test && npm run build
```

---

## 📋 Essential Checklist (All Tiers)

### Before Implementation
- [ ] **What**: What exactly are we building?
- [ ] **Why**: Why are we building it this way?
- [ ] **How**: How does it fit into the existing architecture?
- [ ] **Future**: Will this work with all template types?

### During Implementation
- [ ] **Code Comments**: Document the "why" not just the "what"
- [ ] **Type Safety**: Ensure strict TypeScript types
- [ ] **Tests**: Write tests that document expected behavior

### After Implementation
- [ ] **Update Spec**: Mark tasks complete in `spec.md`
- [ ] **Update Architecture**: If data models or flow changed
- [ ] **Commit**: Clear commit message explaining the change

---

## 🎯 Tier-Specific Checklists

### Tier 1: Small Changes
- [ ] Update code comments if logic changed
- [ ] Update `spec.md` if it was a tracked task
- [ ] Quick test: `npm test`

### Tier 2: Medium Features
- [ ] **Data Models**: Update TypeScript interfaces if needed
- [ ] **State Management**: Update Zustand stores if needed
- [ ] **API/LLM**: Update routes or prompts if needed
- [ ] **Spec Updates**: Add new tasks to `spec.md`
- [ ] **Architecture**: Update relevant sections in `ARCHITECTURE.md`
- [ ] **Tests**: Comprehensive test coverage
- [ ] **Template Types**: Ensure works with all template types

### Tier 3: Major Features
- [ ] **Full Documentation Review**: All documents and diagrams
- [ ] **Architecture Impact**: Complete impact assessment
- [ ] **Future Directions**: Update `IDEAS.md` with new use cases
- [ ] **Workflow Updates**: Update `.cursor/rules/` if needed
- [ ] **Migration Notes**: Document any breaking changes
- [ ] **Knowledge Transfer**: Document decisions and trade-offs

### Tier 3: Game Mechanics & Dice Systems
- [ ] **Dice System Documentation**: Document all dice types, modifiers, and calculations
- [ ] **Combat Flow Diagrams**: Create visual representations of combat sequences
- [ ] **Character State Updates**: Document how game mechanics affect character stats
- [ ] **Template Integration**: Ensure game mechanics work with all template types
- [ ] **Balance Documentation**: Document difficulty scaling and progression curves
- [ ] **Testing Strategy**: Comprehensive test coverage for random elements
- [ ] **User Experience**: Document how mechanics enhance storytelling

---

## 💡 Efficiency Tips

### For Rapid Iteration
- **Focus on the "why"**: Document decisions, not just implementation
- **Update as you go**: Don't leave documentation for the end
- **Use the tier system**: Don't over-document simple changes
- **Leverage existing patterns**: Follow established conventions

### For Complex Features
- **Start with architecture**: Understand the full impact first
- **Document decisions**: Why this approach over alternatives?
- **Consider future use cases**: Will this work for other template types?
- **Update diagrams**: Visual documentation is often clearer

---

## 📝 Required Document Updates

### Core Documents (Tier 2+)
- [ ] **`ARCHITECTURE.md`** - Update relevant sections and diagrams
- [ ] **`spec.md`** - Add new phases/tasks and update status
- [ ] **`IDEAS.md`** - Document new use cases (Tier 3)

### Supporting Documents (Tier 3)
- [ ] **`.cursor/rules/`** - Update workflow rules if needed
- [ ] **`README.md`** - Update setup/usage if dependencies change

---

**Remember**: The goal is **efficient, not exhaustive** documentation. Focus on what helps you and future contributors understand the **what, why, and how** of the system. 