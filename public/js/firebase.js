let firebaseConfig = {
    apiKey: "AIzaSyCGfAVqp6M8Ix5-RDfrOI_d2Rzo3XvnIH8",
    authDomain: "eclipse-edb56.firebaseapp.com",
    databaseURL: "https://eclipse-edb56-default-rtdb.firebaseio.com",
    projectId: "eclipse-edb56",
    storageBucket: "eclipse-edb56.appspot.com",
    messagingSenderId: "152175119382",
    appId: "1:152175119382:web:d66ad05052cfbdf7b6f937",
    measurementId: "G-K6GX0WQHC1"
  };

firebase.initializeApp(firebaseConfig);

//--- auth

firebase.auth().createUserWithEmailAndPassword("eclipsedbfirebase@gmail.com", "Eclipsedbfirebase@10")
.then((userCredential) => {
  // Signed in 
  var user = userCredential.user;
  // ...
})
.catch((error) => {
  var errorCode = error.code;
  var errorMessage = error.message;
  // ..
});


// //--- login

firebase.auth().signInWithEmailAndPassword("eclipsedbfirebase@gmail.com", "Eclipsedbfirebase@10")
.then((userCredential) => {
  // Signed in
  var user = userCredential.user;
  // ...
})
.catch((error) => {
  var errorCode = error.code;
  var errorMessage = error.message;
});