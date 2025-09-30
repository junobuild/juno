# Contributing to Juno

Thank you for your interest in contributing to **Juno**! We welcome all contributions—whether it's code, documentation, bug reports, feature ideas, or feedback.

## How to Start?

If you’re unsure where to begin:

- Check out the ["Good First Issues"](https://github.com/junobuild/juno/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) (if available).
- Ask for guidance on [Discord](https://discord.com/invite/wHZ57Z2RAG) or [Twitter](https://x.com/junobuild).
- Submit an issue, and a maintainer will help!

---

## 🚀 How to Contribute

### 1. **Report Bugs or Suggest Features**

- Search [existing issues](https://github.com/junobuild/juno/issues) to avoid duplicates.
- Open an **Issue** for bugs or **Discussion** for ideas.

### 2. **Set Up Your Environment**

Follow [HACKING.md](https://github.com/junobuild/juno/blob/main/HACKING.md) for setup instructions.

### 3. **Make Your Changes**

#### 🔹 **Git Commands for Branch Workflow**

```bash
# Step 1: Sync your local main branch
git checkout main
git pull upstream main  # Assuming 'upstream' points to junobuild/juno

# Step 2: Create a new branch (use descriptive names)
git checkout -b fix/login-bug      # For bug fixes
git checkout -b feat/add-dark-mode # For new features

# Step 3: Make changes, then commit
git add .
git commit -m "fix: resolve login timeout issue"

# Step 4: Push to your fork (replace 'origin' with your fork)
git push -u origin fix/login-bug
```

### 4. **Test Your Changes**

- Run tests locally (see `HACKING.md`).
- Verify functionality.

### 5. **Run Checks**

Before pushing your branch and creating a PR, ensure your code passes
formatting, linting, and type checks by running:

```bash
npm run check:all
```

### 6. **Submit a Pull Request (PR)**

1. Go to [Juno’s Pull Requests](https://github.com/junobuild/juno/pulls) and click "New PR".
2. Select **your fork/branch** as the source.
3. Follow the PR template (if any) and:
   - Link related issues (e.g., `Closes #123`).
   - Add screenshots for UI changes.

---

## ❓ Need Help?

- **Discord**: [Join chat](https://discord.com/invite/wHZ57Z2RAG)
- **Twitter/X**: [@junobuild](https://x.com/junobuild)
- **Email**: [hello@junobuild.ch](hello@junobuild.ch)
