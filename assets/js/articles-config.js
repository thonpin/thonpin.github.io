// Public Firebase web-app configuration. Fill these values from Firebase Console.
// These values identify the Firebase client app; they are NOT service-account secrets.
// Firestore Security Rules, not JavaScript, enforce publishing authorization.
export const firebaseConfig={
  apiKey:"AIzaSyCXcoXt0LEtRstTHRUjbGhgGKRoSbqJ-kk",
  authDomain:"github-thonpin.firebaseapp.com",
  projectId:"github-thonpin",
  appId:"1:730735677986:web:7272b2e779ba2b79adf07b"
};
export const firebaseConfigured=Boolean(
  firebaseConfig.apiKey&&firebaseConfig.authDomain&&
  firebaseConfig.projectId&&firebaseConfig.appId
);
