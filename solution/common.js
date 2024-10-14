const sortByDate = (a, b) => a.log.date - b.log.date;

function constructLogSourceMap(logSources) {
  let logSourceMap = {};

  for (let i=0; i < logSources.length; i++) {
    logSourceMap[i] = logSources[i];
  }

  return logSourceMap;
}

function printNextEntry(sortingList, printer) {
  let {log, index} = sortingList.shift();
  printer.print(log);

  return index;
}

module.exports = {
  sortByDate,
  constructLogSourceMap,
  printNextEntry,
};

