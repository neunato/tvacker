import api from "./api"
import {FirebaseError} from "./error"


let config = {
   apiKey: "AIzaSyAXFYQfaQPXY1M9-SD6Cfe2FS0hRTCgCN8",
   authDomain: "tvacker-89966.firebaseapp.com",
   databaseURL: "https://tvacker-89966.firebaseio.com",
   projectId: "tvacker-89966",
   storageBucket: "tvacker-89966.appspot.com",
   messagingSenderId: "218003059779",
   appId: "1:218003059779:web:4ac744dc164c61f5ac10f6",
   measurementId: "G-183X07EJXH"
}
firebase.initializeApp(config)
firebase.analytics()

let auth = firebase.auth()
let firestore = firebase.firestore()
firestore.enablePersistence({synchronizeTabs: true})

let db = {
   async init () {
      return new Promise((resolve) => auth.onAuthStateChanged(resolve))
   },

   async register (email, password) {
      try {
         await auth.createUserWithEmailAndPassword(email, password)
      }
      catch (e) {
         let code = e.code
         if (code === "auth/network-request-failed")
            throw new FirebaseError("Network error")
         if (code === "auth/email-already-in-use")
            throw new FirebaseError("Email already in use")
         if (code === "auth/invalid-email")
            throw new FirebaseError("Email not valid")
         if (code === "auth/weak-password")
            throw new FirebaseError("Password too weak")
         throw new FirebaseError("Unexpected error")
      }

      try {
         await auth.currentUser.sendEmailVerification()
      }
      catch (e) {
         throw new FirebaseError("Sending email failed")
      }
   },

   async login (email, password) {
      await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)

      try {
         await auth.signInWithEmailAndPassword(email, password)
      }
      catch (e) {
         if (e.code === "auth/network-request-failed")
            throw new FirebaseError("Network error")
         else
            throw new FirebaseError("Invalid email or password")
      }
   },

   async logout () {
      try {
         await auth.signOut()
      }
      catch (e) {
         throw new FirebaseError("Logging out failed")
      }
   },

   async fetch () {
      try {
         let uid = db.getUID()
         let shows = await firestore.collection("shows").where("uid", "==", uid).get()
         shows = shows.docs.map((doc) => doc.data())
         return shows
      }
      catch (e) {
         throw new FirebaseError("Fetching data failed")
      }
   },

   async push (show) {
      try {
         await firestore.collection("shows").doc(String(show.id)).set(show)
      }
      catch (e) {
         throw new FirebaseError("Pushing data failed")
      }
   },

   async delete (id) {
      try {
         await firestore.collection("shows").doc(String(id)).delete()
      }
      catch (e) {
         throw new FirebaseError("Pushing data failed")
      }
   },

   async pushError (error) {
      try {
         await firestore.collection("errors").add(error)
      }
      catch (e) {
         try {
            await firestore.collection("errors").add(error)  // Retry logging the error.
         }
         catch (e) {}
      }
   },

   generateID() {
      return firestore.collection("shows").doc().id
   },

   getUID() {
      return auth.currentUser.uid
   }
}

export default db
