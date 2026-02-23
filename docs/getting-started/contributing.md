# Contributing to Documentation

This guide explains how to add or edit documentation for Learning HubZ using VS Code.

## Prerequisites

- [Node.js 20+](https://nodejs.org/) installed
- [VS Code](https://code.visualstudio.com/) installed
- Git configured with your GitHub account
- Access to the [lhz.docs repository](https://github.com/learninghubz/lhz.docs)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/learninghubz/lhz.docs.git
cd lhz.docs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Open in VS Code

```bash
code .
```

### 4. Install Recommended Extensions

Install these VS Code extensions for the best documentation editing experience:

| Extension | ID | Purpose |
|-----------|-----|---------|
| **Markdown Editor Optimized** | `vadimmelnicuk.markdown-editor-optimized` | Enhanced Markdown preview and editing |
| **Prettier** | `esbenp.prettier-vscode` | Automatic code formatting |
| **Code Spell Checker** | `streetsidesoftware.code-spell-checker` | Catch spelling errors |
| **GitLens** | `eamodio.gitlens` | Git integration and history |

Install from VS Code:
- Press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows/Linux)
- Search for each extension by name or ID
- Click "Install"

## Development Workflow

### 1. Start the Development Server

```bash
npm start
```

This opens the documentation site in your browser at `http://localhost:3000` with live reload.

### 2. Edit Documentation

All documentation files are in the `/docs` folder:

```
docs/
├── intro.md                    # Introduction page
├── getting-started/
│   ├── quickstart.md
│   └── contributing.md         # This file
├── architecture/
│   ├── overview.md
│   ├── data-modeling.md
│   └── api-design.md
├── development/
│   ├── web-app/
│   │   ├── development-guide.md
│   │   └── lazy-loading.md
│   └── backend/
│       └── development-guide.md
├── api-reference/
│   ├── index.md
│   └── export-api.md
└── deployment/
    └── index.md
```

### 3. Create or Edit Pages

#### To Edit an Existing Page:
1. Navigate to the file in `/docs`
2. Open it in VS Code
3. Edit the Markdown content
4. Save the file (`Cmd+S` or `Ctrl+S`)
5. Check the browser - changes appear automatically

#### To Create a New Page:
1. Create a new `.md` file in the appropriate `/docs` subfolder
2. Add frontmatter at the top:

```markdown
---
sidebar_position: 1
sidebar_label: Page Title
---

# Page Title

Your content here...
```

3. Save the file - it appears in the sidebar automatically

## Markdown Features

### Basic Formatting

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*
`inline code`

- Bullet list
- Another item

1. Numbered list
2. Another item

[Link text](https://example.com)
```

### Code Blocks

````markdown
```javascript
function example() {
  return "code with syntax highlighting";
}
```
````

### Admonitions (Callouts)

```markdown
:::note
Important information that users should notice.
:::

:::tip
Helpful advice for the reader.
:::

:::info
Neutral informational content.
:::

:::caution
Cautionary advice about potential issues.
:::

:::danger
Critical warnings about dangerous actions.
:::
```

### Tables

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
```

### Images

```markdown
![Alt text](./image.png)
```

Place images in the `/static/img` folder and reference them with `/img/image.png`.

## Git Workflow in VS Code

### 1. Create a Branch (Optional)

For significant changes, create a branch:

```bash
git checkout -b docs/my-documentation-update
```

### 2. Stage Changes

- Click the **Source Control** icon in VS Code sidebar (or press `Cmd+Shift+G`)
- Review changed files
- Click the `+` icon next to files to stage them

### 3. Commit Changes

- Enter a descriptive commit message in the text box:
  ```
  docs: add contribution guide for documentation
  ```
- Click the checkmark icon or press `Cmd+Enter` (Mac) or `Ctrl+Enter` (Windows/Linux)

### 4. Push Changes

- Click `...` (more actions) in Source Control panel
- Select **Push** to send changes to GitHub
- Or use the command line:
  ```bash
  git push
  ```

### 5. Create Pull Request (If Using a Branch)

- Visit [https://github.com/learninghubz/lhz.docs](https://github.com/learninghubz/lhz.docs)
- Click **Compare & pull request**
- Add description and submit

## Testing Before Committing

### 1. Build the Site

Stop the development server (`Ctrl+C`) and run:

```bash
npm run build
```

This checks for:
- Broken links
- Syntax errors
- Build issues

If successful, you'll see: `[SUCCESS] Generated static files in "build".`

### 2. Preview the Production Build

```bash
npm run serve
```

Opens the production build at `http://localhost:3000` for final verification.

## Best Practices

### Writing Style

- ✅ Use clear, concise language
- ✅ Write in present tense
- ✅ Use active voice
- ✅ Define acronyms on first use
- ✅ Include code examples where helpful
- ❌ Avoid jargon without explanation
- ❌ Don't assume too much prior knowledge

### Code Examples

- Include complete, runnable examples
- Add comments to explain complex logic
- Use realistic variable names
- Test all code snippets

### Links

- Use relative links for internal pages: `[Page Title](../folder/page.md)`
- Always test links before committing
- Use descriptive link text (not "click here")

### Images

- Use descriptive alt text for accessibility
- Keep file sizes reasonable (< 500KB)
- Use PNG for screenshots, SVG for diagrams
- Name files descriptively: `cosmos-db-hierarchy.png`

## Sidebar Configuration

The sidebar is configured in `/sidebars.ts`. Most pages appear automatically, but you can customize:

```typescript
const sidebars = {
  tutorialSidebar: [
    {
      type: 'autogenerated',
      dirName: '.',
    },
    {
      type: 'category',
      label: 'Resources',
      items: [
        {
          type: 'link',
          label: 'Main Repository',
          href: 'https://github.com/learninghubz/learninghubz2..0',
        },
      ],
    },
  ],
};
```

## Troubleshooting

### Port Already in Use

If `npm start` fails with "port already in use":

```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm start -- --port 3001
```

### Build Errors

If you see broken link errors:
1. Check all `[text](link)` syntax in your changes
2. Verify file paths are correct
3. Ensure referenced files exist

### Changes Not Appearing

- Verify the file is saved
- Check the browser console for errors
- Restart the dev server: `Ctrl+C`, then `npm start`

## Getting Help

- **Documentation Issues**: [GitHub Issues](https://github.com/learninghubz/lhz.docs/issues)
- **Docusaurus Help**: [Docusaurus Documentation](https://docusaurus.io/docs)
- **Markdown Guide**: [Markdown Guide](https://www.markdownguide.org/)

## Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `npm start` |
| Build for production | `npm run build` |
| Serve production build | `npm run serve` |
| Format code | `npm run format` (if configured) |
| Check for errors | `npm run build` |

---

Thank you for contributing to Learning HubZ documentation! 🎉
