"use strict";
//Server requests
function createRequest(requestBody, callback, isUploadInfoNeeded = false) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "https://jscp-diplom.netoserver.ru/");
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  
  console.warn(`REQUEST TO SERVER HAS BEEN SENT!`);
  
  if (isUploadInfoNeeded) {
    xhr.upload.onprogress = function (event) {
      console.log(`Sending data... Sent ${event.loaded} of ${event.total} bytes`);
    };

    xhr.upload.onerror = function () {
      console.log("An error occurred while uploading data to the server!");
    };
  }

  xhr.onload = function () {
    if (xhr.status != 200) {
      alert("Error: " + xhr.status);
      return;
    }

    console.log(`Request status: ${xhr.status} (${xhr.statusText})`);
    callback(xhr.response);
  };

  xhr.onerror = function () {
    alert("Request failed");
  };

  xhr.send(requestBody);
};

// Set the value 'value' in sessionStorage with the key 'key'
function setItem(key, value) {
  try {
    return window.sessionStorage.setItem(key, value);
  } catch (e) {
    console.log(e);
  }
}
// Read the value in sessionStorage with the key 'key'
function getItem(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch (e) {
    console.log(e);
  }
}
// Convert value to JSON and write it to sessionStorage with key 'key'
function setJSON(key, value) {
  try {
    const json = JSON.stringify(value);
    setItem(key, json);
  } catch (e) {
    console.error(e);
  }
}
// Get and convert the value from JSON to object from sessionStorage with key 'key'
function getJSON(key) {
  try {
    const json = getItem(key);
    return JSON.parse(json);
  } catch (e) {
    console.error(e);
  }
}
