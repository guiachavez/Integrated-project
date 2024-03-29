// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-analytics.js";
  
// const firebaseConfig = {
//     apiKey: "AIzaSyAdLOXJVUxHlv8GCi6G_0j-12e_cCmzGkw",
//     authDomain: "fir-projects-37dfd.firebaseapp.com",
//     projectId: "fir-projects-37dfd",
//     storageBucket: "fir-projects-37dfd.appspot.com",
//     messagingSenderId: "552149961611",
//     appId: "1:552149961611:web:c54ea11939e6da05d57d8e",
//     measurementId: "G-FKNKXH7SJW"
// };

const firebaseConfig = {
    apiKey: "AIzaSyD6bne3RP6w-zcTB8wxV_f2UGjNM21qLkY",
    authDomain: "pawfectmatch-30994.firebaseapp.com",
    projectId: "pawfectmatch-30994",
    storageBucket: "pawfectmatch-30994.appspot.com",
    messagingSenderId: "520179370591",
    appId: "1:520179370591:web:62ebc90dba7ffff32c29ea",
    measurementId: "G-PLZCF8S8J9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app };

// Petfinder
const petfinderAPI = "7NJvkG519gKR29OuC2pPJT8B3lcK3hYLeTlgpsMMSj31b3dS29"
const token = "xyCskdF4PT4wSsvBXXlMdsqrAe3HWuLayJpXmfSn"

export { petfinderAPI, token }

// Tomtom API
const tomtomAPI = "YZ5FH87G1Ft3YEQLSufyNr44ZQRz4wpc"

export { tomtomAPI }
 
