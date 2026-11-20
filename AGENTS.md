# Antigravity project instructions

## Conversation history

- Antigravity CLI conversations are saved automatically. Keep using the same workspace directory so prior conversations remain available; use `agy -c` to continue the latest conversation for this workspace or `/resume` to choose one.

## Git publishing

- When a user request changes project code, finish the requested edits, review the diff, and commit and push those task changes to the configured upstream branch before reporting completion.
- Stage only files changed for that request. Do not include unrelated user changes in the commit.
- Do not run tests unless the user asks for verification.
- If this directory is not a Git repository, or has no configured remote/upstream, do not initialize Git, invent a remote, or claim that changes were pushed. Explain what setup is needed and ask for the repository URL or correct project folder.
- If GitHub authentication or branch protection prevents pushing, report the exact issue and leave the local changes intact.
