# MONOPOL STUDIO - Contributing Guide

Thank you for your interest in contributing to MONOPOL STUDIO!

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/monopol-studio.git
   cd monopol-studio
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

## Code Style

- **JavaScript/TypeScript**: Follow ESLint config
- **Formatting**: Use Prettier
- **Commits**: Use conventional commits

```bash
npm run format     # Format code
npm run lint       # Check linting
npm run type-check # Check types
```

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Tests
- `chore` - Build/tooling

**Example:**
```
feat(editor): add canvas zoom controls

- Implement mouse wheel zoom
- Add keyboard shortcuts (+ and -)
- Maintain zoom center on cursor

Closes #123
```

## Pull Request Process

1. Update documentation for any changes
2. Add tests for new features
3. Ensure all tests pass: `npm run test`
4. Update CHANGELOG.md
5. Create descriptive PR with screenshots if UI changes
6. Link any related issues

## Coding Standards

### TypeScript
- Strict mode enabled
- No `any` types unless necessary
- Proper error handling

### React
- Functional components with hooks
- Proper prop typing
- Memoization where needed

### Database
- Use Prisma migrations
- Add indexes on frequently queried fields
- Keep schemas normalized

## Testing

- Write tests for new features
- Maintain >80% coverage
- Include integration tests for API routes

```bash
npm run test              # Run tests
npm run test -- --watch  # Watch mode
npm run test:coverage    # Coverage report
```

## Documentation

- Update README.md for new features
- Add JSDoc comments for public APIs
- Update API docs in docs/API.md

## Performance

- Lazy load components
- Optimize images
- Use React.memo for heavy components
- Profile before optimizing

## Security

- Don't commit secrets
- Validate all inputs
- Use parameterized queries
- Follow OWASP guidelines

## Questions?

- Open a GitHub Discussion
- Join our Discord community
- Email: dev@monopolstudio.com

---

**Thank you for contributing! 🎬**
