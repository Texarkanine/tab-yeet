# Chrome Web Store — First-Time Setup

This guide walks through the one-time setup required for the CI/CD pipeline to publish Tab Yeet to the Chrome Web Store automatically.

## 1. Chrome Web Store Developer Account

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/).
2. Sign in with a Google account and pay the one-time **$5 registration fee**.
3. Accept the developer agreement.

## 2. Google Cloud Project & API

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or use an existing one).
3. Navigate to **APIs & Services → Library** and enable the **Chrome Web Store API**.

## 3. OAuth2 Credentials

The CWS API requires an OAuth2 access token. You'll create a desktop OAuth client and perform a one-time consent flow to obtain a long-lived refresh token.

### Create OAuth2 Client

1. In the Google Cloud Console, go to **APIs & Services → Credentials**.
2. Click **Create Credentials → OAuth client ID**.
3. Select **Desktop app** as the application type.
4. Note the **Client ID** and **Client Secret**.

### Obtain a Refresh Token

Run the consent flow to get a refresh token with the `chromewebstore` scope. Google removed the OOB redirect flow in January 2023, so this uses a loopback redirect instead.

1. Open this URL in your browser (replace `YOUR_CLIENT_ID`):

   ```
   https://accounts.google.com/o/oauth2/v2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost&access_type=offline
   ```

2. Authorize the application. The browser will redirect to `http://localhost?code=...` (the page won't load — that's expected). Copy the `code` parameter value from the URL bar.

3. Exchange the code for tokens:

   ```bash
   curl -s -X POST https://oauth2.googleapis.com/token \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "code=YOUR_AUTH_CODE" \
     -d "grant_type=authorization_code" \
     -d "redirect_uri=http://localhost"
   ```

4. The response contains `access_token` and **`refresh_token`**. Save the refresh token — it does not expire unless revoked.

## 4. First Manual Publish

The CWS API requires the extension to already exist on the store before API uploads work. You must publish the first version manually:

1. Go to the [Developer Dashboard](https://chrome.google.com/webstore/devconsole/).
2. Click **New Item** and upload the Chrome `.zip` (build locally with `npm run build:chrome`).
3. Fill in the required store listing fields (description, screenshots, categories, etc.).
4. Submit for review.
5. Note the **Extension ID** from the dashboard URL (a 32-character string).

After this initial publish, the CI/CD pipeline handles all subsequent version uploads automatically.

## 5. Repository Secrets

Add the following secrets to the GitHub repository (**Settings → Secrets and variables → Actions → New repository secret**):

| Secret               | Value                                              |
| -------------------- | -------------------------------------------------- |
| `CWS_EXTENSION_ID`  | 32-character extension ID from the CWS dashboard   |
| `CWS_CLIENT_ID`     | OAuth2 client ID from step 3                       |
| `CWS_CLIENT_SECRET` | OAuth2 client secret from step 3                   |
| `CWS_REFRESH_TOKEN` | Refresh token obtained in step 3                   |

Once these secrets are configured, the `cws-publish` job in the release workflow will activate automatically on the next release.

## Troubleshooting

- **Upload fails with "version already exists"**: release-please bumps the version before creating the release, so this shouldn't happen. If it does, check that the `version` in `manifest.json` was bumped by the release PR.
- **Upload succeeds but publish is "PENDING_REVIEW"**: CWS may queue extensions for manual review. The CI job will succeed — the published version appears on the store once the review completes.
- **OAuth token exchange fails**: Verify the refresh token hasn't been revoked. Re-run the consent flow from step 3 if needed and update the `CWS_REFRESH_TOKEN` secret.
