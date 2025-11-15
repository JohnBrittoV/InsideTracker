   
    // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
    
    import { 
        getAuth, 
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

    import{
        getDatabase,
        ref as dbRef,
        set,
        get
    } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBIZbtZoamQ6WFcQIjJZmN8Gu1uE_JIbJU",
        authDomain: "inside-demo-1e9bf.firebaseapp.com",
        databaseURL: "https://inside-demo-1e9bf-default-rtdb.firebaseio.com/",
        projectId: "inside-demo-1e9bf",
        storageBucket: "inside-demo-1e9bf.firebasestorage.app",
        messagingSenderId: "265991866294",
        appId: "1:265991866294:web:40df812467fd900ecb2317"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    const auth = getAuth();
    const database = getDatabase(app);

    export{
        auth,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        database,
        dbRef,
        set,
        get
    };

    console.log("Firebase initialized successfully");







       
    