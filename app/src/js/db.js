import api from "./api"

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


let db = {
   async init () {
      return new Promise((resolve) => auth.onAuthStateChanged(resolve))
   },

   async register (email, password) {
      try {
         await auth.createUserWithEmailAndPassword(email, password)
      }
      catch ({code}) {
         if (code === "auth/email-already-in-use")
            throw new Error("Email already in use")
         if (code === "auth/invalid-email")
            throw new Error("Email not valid")
         if (code === "auth/weak-password")
            throw new Error("Password too weak")
         throw new Error("Something went wrong")
      }

      try {
         await auth.currentUser.sendEmailVerification()
      }
      catch (e) {
         throw new Error("Failed to send email")
      }
   },

   async login (email, password) {
      try {
         await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      }
      catch (e) {
         throw new Error("Something went wrong")
      }

      try {
         await auth.signInWithEmailAndPassword(email, password)
      }
      catch (e) {
         throw new Error("Invalid email or password")
      }
   },

   async logout () {
      try {
         await auth.signOut()
      }
      catch (e) {
         throw new Error("Something went wrong")
      }
   },

   async fetch () {
      try {
         let shows = await firestore.collection("shows").where("uid", "==", auth.currentUser.uid).get()
         shows = shows.docs.map((doc) => doc.data())
         return shows
      }
      catch (e) {
         throw new Error("Something went wrong")
      }
   },

   async push (show) {
      try {
         show.uid = auth.currentUser.uid
         await firestore.collection("shows").doc(String(show.id)).set(show)
      }
      catch (e) {
         throw new Error("Something went wrong")
      }
   },

   async delete (id) {
      try {
         await firestore.collection("shows").doc(String(id)).delete()
      }
      catch (e) {
         throw new Error("Something went wrong")
      }
   }
}

export default db