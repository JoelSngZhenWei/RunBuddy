# Google Calendar Integration Setup Guide

This guide will walk you through setting up Google Calendar integration for RunBuddy.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "RunBuddy")
5. Click "Create"

## Step 2: Enable Google Calendar API

1. In the Google Cloud Console, make sure your new project is selected
2. Go to **APIs & Services** > **Library**
3. Search for "Google Calendar API"
4. Click on "Google Calendar API"
5. Click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** as the user type (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: RunBuddy
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On the **Scopes** page:
   - Click "Add or Remove Scopes"
   - Search for "Google Calendar API"
   - Select `.../auth/calendar.readonly` scope
   - Click "Update" then "Save and Continue"
7. On the **Test users** page (if in testing mode):
   - Add your email address as a test user
   - Click "Save and Continue"
8. Review and click "Back to Dashboard"

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click "Create Credentials" > "OAuth client ID"
3. Select **Web application** as the application type
4. Enter a name (e.g., "RunBuddy Web Client")
5. Under **Authorized redirect URIs**, add:
   - For development: `http://localhost:3000/api/google/callback`
   - For production: `https://yourdomain.com/api/google/callback`
6. Click "Create"
7. You'll see a dialog with your **Client ID** and **Client Secret**
8. **Important**: Copy these values - you'll need them for your environment variables

## Step 5: Configure Environment Variables

1. In your `client` directory, create a `.env.local` file (or update your existing one)
2. Add the following environment variables with your actual values:

```bash
# Google Calendar API Configuration
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Base URL (update for production)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   cd client
   npm run dev
   ```

2. Navigate to the **Generate Plan** page (`/plan`)

3. You should see a "Google Calendar Integration" section

4. Click "Connect Google Calendar"

5. Sign in with your Google account and grant calendar permissions

6. Once connected, you can:
   - Toggle "Use my calendar schedule" checkbox
   - Select start and end dates for your training plan
   - The app will automatically fetch your calendar events and consider them when generating plans

## Features

### What the Integration Does

1. **Fetches Calendar Events**: Retrieves all events from your primary Google Calendar within the selected training period

2. **Analyzes Availability**: Calculates how much free time you have each day based on your scheduled events

3. **Identifies Busy Days**: Highlights days with limited availability (less than 4 hours free)

4. **Training Recommendations**: Provides suggestions for scheduling workouts around your commitments

### Data Used

The integration accesses:
- Event titles and times
- Event dates
- Event durations
- All-day event indicators

The integration **does not**:
- Modify or create calendar events
- Access event descriptions or attendees
- Share your calendar data with third parties
- Store calendar data permanently (only used during plan generation)

## Privacy & Security

- Your calendar data is only accessed when you explicitly enable the integration
- Access tokens are stored securely in HTTP-only cookies
- The app only requests read-only access to your calendar
- You can disconnect at any time by clicking "Disconnect Google Calendar"

## Troubleshooting

### "Not authenticated with Google Calendar" Error

**Solution**: 
1. Click "Connect Google Calendar" again
2. Make sure you grant all requested permissions
3. Check that your OAuth credentials are correctly configured

### "Failed to fetch calendar events" Error

**Solution**:
1. Verify that the Google Calendar API is enabled in your Google Cloud project
2. Check that your `.env.local` file has the correct credentials
3. Make sure the redirect URI in Google Cloud Console matches your app URL
4. Try refreshing the calendar events using the "Refresh Calendar Events" button

### "Invalid redirect_uri" Error

**Solution**:
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Click on your OAuth 2.0 Client ID
3. Add the correct redirect URI: `http://localhost:3000/api/google/callback` (for development)
4. Make sure there are no trailing slashes

### Token Expired

**Solution**: The app automatically refreshes expired tokens. If this fails, simply disconnect and reconnect your Google Calendar.

## Production Deployment

When deploying to production:

1. Update the **Authorized redirect URIs** in Google Cloud Console with your production domain:
   ```
   https://yourdomain.com/api/google/callback
   ```

2. Update your environment variables:
   ```bash
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```

3. If your app is in "Testing" mode in Google Cloud Console:
   - Publish your app by going to OAuth consent screen
   - Click "Publish App"
   - Note: You may need to go through Google's verification process for production apps

## API Rate Limits

Google Calendar API has the following quotas (as of 2024):
- 1,000,000 queries per day
- 10 queries per second per user

For typical usage in RunBuddy (fetching events once per training plan generation), these limits should be more than sufficient.

## Support

For issues specific to Google Calendar API:
- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

For issues with the RunBuddy integration:
- Check the browser console for error messages
- Ensure all environment variables are correctly set
- Verify your Google Cloud project configuration

