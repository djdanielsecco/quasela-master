// declaracoes globais

var fireb = require('firebase/app');
require("firebase/firestore");
 window.firebase = fireb;
export const configFirebase = {
     apiKey: "AIzaSyCvkTHRRLN1U1rFRWQ6p23D8G7IWEbI8jw",
    authDomain: "ativador-anubz.firebaseapp.com",
    databaseURL: "https://ativador-anubz.firebaseio.com",
    projectId: "ativador-anubz",
    storageBucket: "ativador-anubz.appspot.com",
    messagingSenderId: "1026783959484"};


export const  urlTree = 'https://ativador-anubz.firebaseio.com/trees.json';
export const url2 = 'https://ativador-anubz.firebaseio.com/posts.json';

export const pushTokem = "BJmuGYfDEYEAUF1AACebp739z1oyBEM_z6EWBgT95-nYaqqtHgRgo_dIveHpOF5JUZbMzriOTP68AsL0uFTbcmI";

export const dataData = [];
export function noty(z, x, w) {
    var x,
        z,
        w;
    var newdata = {
        type: z,
        title: x,
        message: w
    };
    dataData.push(newdata);
    console.log(dataData);
    return dataData;
};