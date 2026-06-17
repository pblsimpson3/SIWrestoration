import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';

// Standard Google Drive Scopes
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file'
];

let authInstance: any = null;
let providerInstance: any = null;
let googleAuthTried = false;

// Attempt to load firebase config gracefully
// If firebase-applet-config.json doesn't exist, we will use a simulated mock auth with access token entry
// to keep the app highly resilient and functional.
let firebaseConfig: any = null;

try {
  // We can dynamically try to get firebase config or use process.env
  // If no config, we'll let users input an optional token or simulate
  firebaseConfig = {
    apiKey: ((import.meta as any).env?.VITE_FIREBASE_API_KEY) || "placeholder-api-key",
    authDomain: ((import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN) || "placeholder-auth-domain",
    projectId: "placeholder-project",
    storageBucket: "placeholder-storage-bucket",
    messagingSenderId: "placeholder-sender",
    appId: "placeholder-app-id"
  };

  const app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  providerInstance = new GoogleAuthProvider();
  DRIVE_SCOPES.forEach(scope => providerInstance.addScope(scope));
} catch (error) {
  console.warn("Firebase Auth could not be initialized automatically. Falling back to key-based OAuth.", error);
}

// In-memory token storage
let cachedAccessToken: string | null = null;
let simulatedUser: { name: string; email: string; uid: string } | null = null;

export const initAuth = (
  onAuthSuccess: (user: any, token: string) => void,
  onAuthFailure: () => void
) => {
  if (authInstance) {
    return onAuthStateChanged(authInstance, (user) => {
      if (user && cachedAccessToken) {
        onAuthSuccess(user, cachedAccessToken);
      } else if (simulatedUser && cachedAccessToken) {
        onAuthSuccess(simulatedUser, cachedAccessToken);
      } else {
        onAuthFailure();
      }
    });
  } else {
    // If no client auth, listen locally
    if (simulatedUser && cachedAccessToken) {
      onAuthSuccess(simulatedUser, cachedAccessToken);
    } else {
      onAuthFailure();
    }
    return () => {};
  }
};

export const googleSignIn = async (): Promise<{ user: any; accessToken: string } | null> => {
  if (authInstance && providerInstance && firebaseConfig?.apiKey !== "placeholder-api-key") {
    try {
      const result = await signInWithPopup(authInstance, providerInstance);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        return { user: result.user, accessToken: cachedAccessToken };
      }
    } catch (e) {
      console.error("Popup sign-in failed, trying simulated auth flow: ", e);
    }
  }

  // Resilient fallback: let student authenticate using a token or simple simulated session
  // that saves reports locally and lets them input an access token if they have one.
  const name = prompt("Enter your Name for the student report session:", "Student") || "Student";
  const email = prompt("Enter your Email:", "student@restoration.edu") || "student@restoration.edu";
  
  simulatedUser = {
    name,
    email,
    uid: "simulated_" + Math.random().toString(36).substr(2, 9)
  };
  
  // Ask if they have a Google Access token, otherwise use local persistence
  cachedAccessToken = "local_only";
  return { user: simulatedUser, accessToken: cachedAccessToken };
};

export const setCustomAccessToken = (token: string) => {
  cachedAccessToken = token;
  if (!simulatedUser) {
    simulatedUser = {
      name: "Authenticated Student",
      email: "student@google.com",
      uid: "user_" + Math.random().toString(36).substr(2, 9)
    };
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logout = () => {
  if (authInstance) {
    authInstance.signOut().catch(() => {});
  }
  cachedAccessToken = null;
  simulatedUser = null;
};

/**
 * Uploads a file (text, markdown, html) to Google Drive v3
 */
export const uploadReportToDrive = async (
  filename: string,
  contentStr: string,
  mimeType: string = 'text/markdown',
  convertToGoogleDoc: boolean = false
): Promise<{ success: boolean; url?: string; fileId?: string; error?: string }> => {
  const token = getAccessToken();
  if (!token || token === "local_only") {
    return { 
      success: false, 
      error: "You are in Local Mode. Please provide a Google Drive Access Token or connect your Google Account." 
    };
  }

  try {
    // We do a Multi-part upload to specify file metadata & contents together
    const boundary = 'foo_bar_boundary';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: filename,
      mimeType: convertToGoogleDoc ? 'application/vnd.google-apps.document' : mimeType,
      description: 'Saugus Iron Works Restoration Class Report - Student Assignment'
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
      contentStr +
      closeDelimiter;

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Drive API returned status ${response.status}: ${errText}`);
    }

    const fileData = await response.json();
    return {
      success: true,
      fileId: fileData.id,
      url: `https://drive.google.com/file/d/${fileData.id}/view`
    };
  } catch (err: any) {
    console.error("Error uploading to Google Drive", err);
    return {
      success: false,
      error: err?.message || String(err)
    };
  }
};
