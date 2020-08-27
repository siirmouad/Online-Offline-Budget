let db;

const dbRequest = indexedDB.open("Online-Offline-Budget", 1);

dbRequest.onupgradeneeded = ({ target }) => {
  const db = target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

dbRequest.onsuccess = ({ target }) => {
  db = target.result;
  //check to see if app is online before reading the database
  if (navigator.onLine) {
    checkDatabase();
  }
};

dbRequest.onerror = function (event) {
  console.log("There was an error" + event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}
//listen for the app to come back
window.addEventListener("online", checkDatabase);
