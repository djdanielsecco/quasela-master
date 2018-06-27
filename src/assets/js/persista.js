
/*
if (navigator.storage && navigator.storage.persist)
  navigator.storage.persisted().then(persistent=>{
    if (persistent)
      console.log("Storage will not be cleared except by explicit user action");
    else
      console.log("Storage may be cleared by the UA under storage pressure.");
  });*/

/*navigator.storage.persist().then(persisted => {
  if (persisted)
    alert('storage is persisted until cleared by user');
  else
    alert('storage is best effort');
});*/
/*
navigator.storage.estimate().then(
  estimate => {
    alert(`using ${Math.round(estimate.usage / estimate.quota * 10000)/100}% of storage`);
  },
  err => {
    alert('storage estimate not available');
  });
navigator.webkitTemporaryStorage.queryUsageAndQuota (
    function(usedBytes, grantedBytes) {
        alert(`using ${Math.round(usedBytes / grantedBytes * 10000)/100}% of storage`);
        console.log('we are using ', usedBytes, ' of ', grantedBytes, 'bytes');
    },
    function(e) { console.log('Error', e);  }
);
*/





(function showIndexedDbSize() {
  "use strict";
  var db;
  window.storesizes = new Array();
 
  function openDatabase() {
    return new Promise(function(resolve, reject) {
      //prompt for DB name
      var dbname =  'posts-store';      // 'firestore/[DEFAULT]/ativador-55a4a/main'; //prompt('Please enter your Database Name', '');

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
        //document.getElementById("percent").innerHTML = storesizes;
    });
  });
}());



async function storageEstimateWrapper() {
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

/* async function showEstimatedQuota() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimation = await navigator.storage.estimate();
    console.log(`Quota: ${estimation.quota}`);
    console.log(`Usage: ${estimation.usage}`);
  } else {
    console.error("StorageManager not found");
  }
}
showEstimatedQuota();*/

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
//initStoragePersistence();

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