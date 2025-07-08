# Merging `feature/todo-integration-ai-chat` to `main`

This document explains how to merge the `feature/todo-integration-ai-chat` branch back into `main` using both the GitHub Pull Request (PR) workflow and the GitHub CLI.

---

## 1. Merge via GitHub Pull Request (PR)

1. **Push your branch to GitHub (if not already pushed):**
   ```bash
git push origin feature/todo-integration-ai-chat
   ```
2. **Go to your repository on GitHub.**
3. **Click "Compare & pull request"** for the `feature/todo-integration-ai-chat` branch.
4. **Review the changes** and add a descriptive PR title and summary.
5. **Request reviews** if needed.
6. **Click "Merge pull request"** once approved.
7. **Delete the feature branch** on GitHub if desired.

---

## 2. Merge via GitHub CLI

1. **Push your branch to GitHub (if not already pushed):**
   ```bash
git push origin feature/todo-integration-ai-chat
   ```
2. **Create a pull request from the CLI:**
   ```bash
gh pr create --base main --head feature/todo-integration-ai-chat --title "Integrate AI chat with todo list" --body "Adds groundwork for AI chat to todo integration."
   ```
3. **(Optional) View and review the PR:**
   ```bash
gh pr view --web
   ```
4. **Merge the PR from the CLI:**
   ```bash
gh pr merge --merge
   ```
5. **Delete the feature branch locally and remotely:**
   ```bash
git branch -d feature/todo-integration-ai-chat
git push origin --delete feature/todo-integration-ai-chat
   ```

---

**Always review the PR for conflicts and test the main branch after merging!** 