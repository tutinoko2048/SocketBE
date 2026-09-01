# For maintainers

## リリース手順

- `package.json` の `version` を更新してコミット

- タグを作成して一緒にpushする

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin main --tags
```

タグをpushするとGitHub Actionsがnpmへ公開し、GitHub Releaseをdraftで作成します。内容を確認してからpublishしてください。
