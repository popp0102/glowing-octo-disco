"use strict";

const Bluebird = require("bluebird");
const { sortByDate, constructLogSourceMap, printNextEntry } = require('./common');

// Print all entries, across all of the *async* sources, in chronological order.

module.exports = (logSources, printer) => {
  function popLogSourceAsync(logSourceMap, index, sortingList) {
    let logSource       = logSources[index];
    let logEntryPromise = logSource.popAsync();

    logEntryPromise.then(log => {
      if (!log) {
        delete logSourceMap[index];
      } else {
        sortingList.push({ log, index });
      }
    }).catch(error => console.log(`Error: ${error}! Handle it some way!`));

    return logEntryPromise;
  }

  function populateSortingList(sortingList, logSourceMap) {
    let promiseList = [];
    for (let i = 0; i < Object.keys(logSourceMap).length; i++) {
      let logEntryPromise = popLogSourceAsync(logSourceMap, i, sortingList);
      promiseList.push(logEntryPromise);
    }

    return Bluebird.all(promiseList);
  }

  return new Promise(async (resolve, reject) => {
    try {
      let logSourceMap = constructLogSourceMap(logSources);
      let sortingList  = [];

      await populateSortingList(sortingList, logSourceMap);
      sortingList.sort(sortByDate);

      while(Object.keys(logSourceMap).length > 0) {
        let index = printNextEntry(sortingList, printer);
        await popLogSourceAsync(logSourceMap, index, sortingList);
        sortingList.sort(sortByDate);
      }

      printer.done();
      resolve(console.log("Async sort complete."));
    } catch (error) {
      reject(error);
    }
  })
};

