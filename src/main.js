

(function showIndexedDbSize() {
  "use strict";
  var db;
  var storesizes = new Array();
 
  function openDatabase() {
    return new Promise(function(resolve, reject) {
      //prompt for DB name
      var dbname = 'posts-store' //prompt('Please enter your Database Name', '');

      if (dbname !== null) {
        var request = window.indexedDB.open(dbname);
        request.onsuccess = function (event) {
          db = event.target.result;
          resolve(db.objectStoreNames);
        };
      }
      
    });
  }
 
  function getObjectStoreData(storename) {
    return new Promise(function(resolve, reject) {
      var trans = db.transaction(storename, IDBTransaction.READ_ONLY);
      var store = trans.objectStore(storename);
      var items = [];
      trans.oncomplete = function(evt) {
        var szBytes = toSize(items);
        var szMBytes = (szBytes / 1024 / 1024).toFixed(2);
        storesizes.push({'Store Name': storename, 'Items': items.length,  'Size': szMBytes + 'MB (' + szBytes + ' bytes)'});
        resolve();
      };
      var cursorRequest = store.openCursor();
      cursorRequest.onerror = function(error) {
        reject(error);
      };
      cursorRequest.onsuccess = function(evt) {                   
        var cursor = evt.target.result;
        if (cursor) {
            items.push(cursor.value);
            cursor.continue();
        }
      }
    });
  }
 
  function toSize(items) {
    var size = 0;
    for (var i = 0; i < items.length; i++) {
        var objectSize = JSON.stringify(items[i]).length;
        size += objectSize * 2;
    }
    return size;
  }
 
  openDatabase().then(function(stores) {
    var PromiseArray = [];
    for (var i=0; i < stores.length; i++) {
      PromiseArray.push(getObjectStoreData(stores[i]));    
    }
    Promise.all(PromiseArray).then(function() {
       console.table(storesizes);
    });
  });
}());


import Vue from 'vue'
//import ElementUI from 'element-ui';
//import 'element-ui/lib/theme-chalk/index.css';

import App from './App.vue'
import router from './router'
import {store} from './store/store'
import * as config from './assets/js/config.js'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import VueMDCAdapter from 'vue-mdc-adapter';
import Vuex from 'vuex'
import VueFire from 'vuefire'
import 'swiper/dist/css/swiper.css'
import './registerServiceWorker'

require('../public/src/js/promise.js')
require('../public/src/js/fetch.js')
//require('../public/src/js/idb.js')
require('../public/src/js/material.min.js')
require('../public/src/js/utility.js')
//require('./index.js')
//Vue.use(ElementUI);
Vue.use(VueFire)
Vue.use(Vuex)
Vue.use(VueMDCAdapter)
Vue.use(VueAwesomeSwiper, /* { default global options } */ )
Vue.config.productionTip = false
// set firebase/firestore
var $ = require('jquery')
var defaultApp = firebase.initializeApp(config.configFirebase);
 
export const firestore = firebase.firestore()
function storageEstimateWrapper() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    // We've got the real thing! Return its response.
    return navigator.storage.estimate();
  }

  if ('webkitTemporaryStorage' in navigator &&
      'queryUsageAndQuota' in navigator.webkitTemporaryStorage) {
    // Return a promise-based wrapper that will follow the expected interface.
    return new Promise(function(resolve, reject) {
      navigator.webkitTemporaryStorage.queryUsageAndQuota(
        function(usage, quota) {resolve({usage: usage, quota: quota})},
        reject
      );
    });
  }

  // If we can't estimate the values, return a Promise that resolves with NaN.
  return Promise.resolve({usage: NaN, quota: NaN});
}
//storageEstimateWrapper();
import './assets/js/pushnoty.js'
if (navigator.storage && navigator.storage.persist)
  navigator.storage.persist().then(function(persistent) {
    if (persistent)
      console.log("Storage will not be cleared except by explicit user action");
    else
      console.log("Storage may be cleared by the UA under storage pressure.");
  });

/*navigator.storage.estimate().then(function(estimate) {
  document.getElementById("percent").innerHTML =
      (estimate.usage / estimate.quota).toFixed(2);
});*/

 if ('storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then(function(result) {
   console.log( 'navigator.storage.estimate()');
   console.log(result.usage);
   console.log(result.quota);
		document.getElementById("percent").innerHTML =
      (result.usage / result.quota).toFixed(2);
    });
  } else if ('webkitTemporaryStorage' in navigator && 'queryUsageAndQuota' in navigator.webkitTemporaryStorage) {
    navigator.webkitTemporaryStorage.queryUsageAndQuota(function(usage, quota) {
   console.log( 'navigator.webkitTemporaryStorage.queryUsageAndQuota()');
   console.log(usage);
   console.log(quota);
		document.getElementById("percent").innerHTML =
      (usage / quota).toFixed(2);
    });
  } else {
 console.log( 'none');
 console.log(NaN);
 console.log(NaN);
  }
/** Check if storage is persisted already.
  @returns {Promise<boolean>} Promise resolved with true if current origin is
  using persistent storage, false if not, and undefined if the API is not
  present.
*/
async function isStoragePersisted() {
  return await navigator.storage && navigator.storage.persisted ?
    navigator.storage.persisted() :
    undefined;
}

/** Tries to convert to persisted storage.
  @returns {Promise<boolean>} Promise resolved with true if successfully
  persisted the storage, false if not, and undefined if the API is not present.
*/
async function persist() {
  return await navigator.storage && navigator.storage.persist ?
    navigator.storage.persist() :
    undefined;
}

/** Queries available disk quota.
  @see https://developer.mozilla.org/en-US/docs/Web/API/StorageEstimate
  @returns {Promise<{quota: number, usage: number}>} Promise resolved with
  {quota: number, usage: number} or undefined.
*/
async function showEstimatedQuota() {
  return await navigator.storage && navigator.storage.estimate ?
    navigator.storage.estimate() :
    undefined;
}

/** Tries to persist storage without ever prompting user.
  @returns {Promise<string>}
    "never" In case persisting is not ever possible. Caller don't bother
      asking user for permission.
    "prompt" In case persisting would be possible if prompting user first.
    "persisted" In case this call successfully silently persisted the storage,
      or if it was already persisted.
*/
async function tryPersistWithoutPromtingUser() {
  if (!navigator.storage || !navigator.storage.persisted) {
    return "never";
  }
  let persisted = await navigator.storage.persisted();
  if (persisted) {
    return "persisted";
  }
  if (!navigator.permissions || !navigator.permissions.query) {
    return "prompt"; // It MAY be successful to prompt. Don't know.
  }
  const permission = await navigator.permissions.query({
    name: "persistent-storage"
  });
  if (permission.status === "granted") {
    persisted = await navigator.storage.persist();
    if (persisted) {
      return "persisted";
    } else {
      throw new Error("Failed to persist");
    }
  }
  if (permission.status === "prompt") {
    return "prompt";
  }
  return "never";
}
async function initStoragePersistence() {
  const persist = await tryPersistWithoutPromtingUser();
  switch (persist) {
    case "never":
      console.log("Not possible to persist storage");
      break;
    case "persisted":
      console.log("Successfully persisted storage silently");
      break;
    case "prompt":
      console.log("Not persisted, but we may prompt user when we want to.");
      break;
  }
}
initStoragePersistence();
/*navigator.webkitPersistentStorage().then(function(estimate) {
  document.getElementById("percent").innerHTML =
      (estimate.usage / estimate.quota).toFixed(2);
});*/

/*let geo = new GeolocationSensor({ frequency: 1 });
geo.start();

geo.onreading = () => console.log(`lat: ${geo.latitude}, long: ${geo.longitude}`);

geo.onerror = event => console.error(event.error.name, event.error.message);*/


/*(function(globalObject) {
  'use strict';
  if (!('navigator' in globalObject) || !('location' in globalObject))
    return;
  
  // [SecureContext]
  if (globalObject.location.protocol !== 'https:')
    return;
  
  if (!('storage' in globalObject.navigator))
    globalObject.navigator.storage = {};
  
  var storage = globalObject.navigator.storage;
  
  // Promise<boolean> persisted();
  storage.persisted = storage.persisted || function() {
    return Promise.resolve(false);
  };
  
  // [Exposed=Window] Promise<boolean> persist();
  if ('window' in globalObject && globalObject.window === window) {
    storage.persist = storage.persist || function() {
      return Promise.resolve(false);
    }; 
  }*/
  
  
/*

var storageInfo = null;

if(navigator.webkitTemporaryStorage) {
  storageInfo = navigator.webkitTemporaryStorage;
	console.log('persistence ok')
	console.log(storageInfo);
} else if(navigator.webkitPersistentStorage) {
  storageInfo = navigator.webkitPersistentStorage;
	console.log(storageInfo);
} else if (window.webkitStorageInfo) {
  storageInfo = window.webkitStorageInfo;
	console.log(storageInfo);
}
*/

/*navigator.webkitTemporaryStorage.queryUsageAndQuota ( 
    function(usedBytes, grantedBytes) {  
        console.log('we are using ', usedBytes, ' of ', grantedBytes, 'bytes');
    }, 
    function(e) { console.log('Error', e);  }
);*/


firestore.settings({
    timestampsInSnapshots: true
});
firestore.enablePersistence().then(function () {
        console.log('persistence ok')
    })
    .catch(function (err) {
        store.dispatch('setErro', err)
    });
//////////////// promise
var promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
        resolve('This is executed once the timer is done!');
        reject({
            code: 500,
            message: 'An error occurred!'
        });
        //console.log('This is executed once the timer is done!');
    }, 100);
});

if (!window.Promise) {
    window.Promise = promise;
};
///////////////////////interface
function updateUI(data) {
    for (var i = 0; i < data.length; i++) {
        writeData('trees', data[i]);
        //console.log(data);
    }
};
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
});

function updateUI2(data) {
    for (var i = 0; i < data.length; i++) {
        delete data[i].image;
        writeData('posts', data[i]);
    }
};
// header fetch(url,{myInit})
var myInit = {
    method: 'GET',
    headers: {
        'Access-Control-Allow-Origin': '*/*',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    mode: 'cors'
};
//////
var networkDataReceived = false;
fetch(config.urlTree)
    .then(function (response) {
        console.table(response);
        return response.json();
    })
    .then(function (data) {
        networkDataReceived = true;
        window.furlf = data;
        // console.log(data.foto + '<???>' + jhg);
        console.log('From web FETCH 1 >', data);
        var dataArray = [];
        var uio = [];
        for (var key in data) {
            dataArray.push(data[key]);
            uio.push(data[key]);
            // writeData('trees', data[key]);
        }
        updateUI(dataArray);
        //window.ltt = uio[0];
        window.dados1 = uio;
        // console.log(uio.length + '<???>' + jhg);
        return window.dados1, window.furlf;
    }).catch(function (err) {
        console.log(err);
    });
/*networkDataReceived = false;
fetch(config.url2)
    .then(function (res) {
        console.log(res);
        return res.json();
    })
    .then(function (data) {
        networkDataReceived = true;
        // console.log(data.foto + '<???>' + jhg);
        console.log('From web FETCH post fire >', data);
        var dataArray = [];
        $("#imgf").text('');
        for (var key in data) {
            dataArray.push(data[key]);
            $("#imgf").append("<p> " + data[key].data + '----' + data[key].id + '-->' + data[key].hora + "</p><br> ");
        }
        updateUI2(dataArray);
        // console.log(uio.length + '<???>' + jhg);
    }).catch(function (err) {
        console.log(err);
    });*/

export const eventHub = new Vue();
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');


promise.then(function (text) {
    return text;
}).then(function (newText) {
    console.log(newText);
}).catch(function (err) {
    console.log(err.code, err.message);
});


////// push
