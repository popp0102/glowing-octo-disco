"use strict";

const { sortByDate, printNextEntry } = require('./common');

// Print all entries, across all of the sources, in chronological order.

module.exports = (logSources, printer) => {
  function popLogSource(logSourceMap, index) {
    let logSource = logSources[index];
    let logEntry  = logSource.pop();

    if (!logEntry) {
      delete logSourceMap[index];
    }

    return logEntry;
  }

  function constructLogSourceMap(logSources) {
    let logSourceMap = {};

    for (let i=0; i < logSources.length; i++) {
      logSourceMap[i] = logSources[i];
    }

    return logSourceMap;
  }

  function populateSortingList(logSourceMap) {
    let numLogSources = Object.keys(logSourceMap).length;
    let sortingList = []
    for (let i = 0; i < numLogSources; i++) {
      let log = popLogSource(logSourceMap, i);

      if (log) {
        sortingList.push({ log: log, index: i });
      }
    }

    sortingList.sort(sortByDate);
    return sortingList;
  }

  function printSorted() {
    let logSourceMap = constructLogSourceMap(logSources);
    let sortingList  = populateSortingList(logSourceMap);

    while(Object.keys(logSourceMap).length > 0) {
      let index = printNextEntry(sortingList, printer);

      let nextLog = popLogSource(logSourceMap, index);
      if (nextLog) {
        sortingList.push({ log: nextLog, index: index });
        sortingList.sort(sortByDate);
      }
    }
  }

  printSorted();
  printer.done();
  return console.log("Sync sort complete.");
};

