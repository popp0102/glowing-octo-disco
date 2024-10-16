const DEBUG = true;
const sortByDate = (a, b) => a.log.date - b.log.date;

function printNextEntry(sortingList, printer) {
  let entry = sortingList.shift();
  let index;

  if (entry) {
    index = entry.index;
    if (!DEBUG) {
      printer.print(entry.log);
    }
  } else {
    index = -1;
  }

  return index;
}

module.exports = {
  sortByDate,
  printNextEntry,
  DEBUG,
};

