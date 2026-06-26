import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD01Q4jdsdx9EICQpU2oR3QkAoSUt6VyWA",
  authDomain: "evident-theme-cv8b6.firebaseapp.com",
  projectId: "evident-theme-cv8b6",
  storageBucket: "evident-theme-cv8b6.firebasestorage.app",
  messagingSenderId: "907793273477",
  appId: "1:907793273477:web:beae1ea0555b5588cc0fec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the specific database ID
export const db = getFirestore(app, "ai-studio-91610a5a-736c-4c66-987b-29486fc22b9b");
export const auth = getAuth(app);

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore
async function testConnection() {
  try {
    // Attempt to read a non-existent connection test document from server
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firestore connection test successfully contacted the server.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration. Client is offline.");
    } else {
      console.log("Firestore connection tested (expected error if document missing, but server was reached).");
    }
  }
}

testConnection();

