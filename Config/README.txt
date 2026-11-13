Firestore credentials

Set FirebaseProjectId to the intended project. For a deployed service, use
Application Default Credentials or set GOOGLE_APPLICATION_CREDENTIALS to a
credential file supplied by the host. Keep credential files outside the branch.

For local development, the optional Config/serviceAccountKey.json file is
copied to local build output and excluded from publish output. The Firestore
Emulator uses no credentials. See the branch README for startup instructions.
