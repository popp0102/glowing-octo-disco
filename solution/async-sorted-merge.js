"use strict";

const Bluebird = require("bluebird");
const { sortByDate, printNextEntry, DEBUG } = require('./common');

// Print all entries, across all of the *async* sources, in chronological order.

module.exports = (logSources, printer) => {
  const BATCH = 100;

  function constructLogSourceMap(logSources) {
    let logSourceMap = {};

    for (let i=0; i < logSources.length; i++) {
      logSourceMap[i] = { logSource: logSources[i], local: 0, drained: false };
    }

    return logSourceMap;
  }

  function popLogSourceAsync(logSourceMap, index, sortingList) {
    if (!logSourceMap[index]) {
      return;
    }

    let logEntryPromise = logSourceMap[index].logSource.popAsync();

    logEntryPromise.then(log => {
      if (!log) {
        logSourceMap[index].drained = true;
      } else {
        sortingList.push({ log, index });
        logSourceMap[index].local += 1;
        logSourceMap[index].drained = false;
      }
    }).catch(error => console.log(`Error: ${error}! Handle it some way!`));

    return logEntryPromise;
  }

  async function populateSortingList(sortingList, logSourceMap) {
    let promiseList = [];
    for (let j = 0; j < BATCH; j++) {
      for (let i = 0; i < Object.keys(logSourceMap).length; i++) {
        if (!logSourceMap[i] || logSourceMap[i].local >= BATCH || logSourceMap[i].drained) {
          continue;
        }

        let logEntryPromise = popLogSourceAsync(logSourceMap, i, sortingList);
        if (logEntryPromise) {
          promiseList.push(logEntryPromise);
        }
      }

      await Bluebird.all(promiseList);
    }
  }

  return new Promise(async (resolve, reject) => {
    try {
      let logSourceMap = constructLogSourceMap(logSources);
      let sortingList  = [];

      await populateSortingList(sortingList, logSourceMap);
      sortingList.sort(sortByDate);

      while(Object.keys(logSourceMap).length > 0) {
        for (let i = 0; i < BATCH; i++) {
          let index = printNextEntry(sortingList, printer);
          if (index === -1) {
            continue
          }

          logSourceMap[index].local -= 1;
          if (logSourceMap[index].drained && logSourceMap[index].local <= 0) {
            delete logSourceMap[index];
          }
        }

        await populateSortingList(sortingList, logSourceMap);
        sortingList.sort(sortByDate);
        if (DEBUG) {
          console.log("SortingList Size: " + sortingList.length);
        }
      }

      printer.done();
      resolve(console.log("Async sort complete."));
    } catch (error) {
      throw error;
      reject(error);
    }
  })
};

