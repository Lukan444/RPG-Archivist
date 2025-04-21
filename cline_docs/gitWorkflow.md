# Git Workflow Guidelines

## Single Branch Workflow

This project uses a simplified Git workflow with a single branch (`master`) to avoid branch-related confusion and mistakes.

## Guidelines

### 1. Always Work on Master Branch

- All development work should be done directly on the `master` branch
- Do not create feature branches or other branches
- This simplifies the workflow and avoids merge conflicts

```bash
# Check that you're on master
git branch

# If not on master, checkout master
git checkout master
```

### 2. Pull Before Making Changes

Always pull the latest changes before starting work:

```bash
git pull origin master
```

### 3. Make Small, Frequent Commits

- Commit changes frequently with clear, descriptive messages
- This makes it easier to track progress and revert if needed

```bash
git add .
git commit -m "Clear description of changes"
```

### 4. Push Regularly

Push your changes to the remote repository regularly:

```bash
git push origin master
```

### 5. Handle Conflicts Immediately

If you encounter merge conflicts when pulling:

1. Resolve the conflicts in the affected files
2. Commit the resolved changes
3. Push the resolution

### 6. Avoid Branch Commands

Avoid using these commands as they create or switch branches:

- `git checkout -b <branch-name>`
- `git branch <branch-name>`
- `git switch <branch-name>`

### 7. If You Accidentally Create a Branch

If you accidentally create or switch to a branch:

1. Commit your changes on the current branch
2. Push those changes to master directly:

```bash
git push origin current-branch-name:master
```

3. Switch back to master:

```bash
git checkout master
```

4. Delete the accidental branch:

```bash
# Delete local branch
git branch -D branch-name

# Delete remote branch if it was pushed
git push origin --delete branch-name
```

## Benefits of Single Branch Workflow

- Simplifies the development process
- Eliminates merge conflicts between branches
- Reduces confusion about where code should be committed
- Makes it easier to track project history
- Ensures all team members are working with the latest code
