function toCSV() {
  var data = dtable;
  var csvData = [];
  var tmpArr = [];
  var tmpStr = '';
  for (var i = 0; i < data.getNumberOfColumns(); i++) {
    // replace double-quotes with double-double quotes for CSV compatibility
    tmpStr = data.getColumnLabel(i).replace(/"/g, '""');
    tmpArr.push('"' + tmpStr + '"');
  }
  csvData.push(tmpArr);
  for (var i = 0; i < data.getNumberOfRows(); i++) {
    tmpArr = [];
    for (var j = 0; j < data.getNumberOfColumns(); j++) {
      switch(data.getColumnType(j)) {
        case 'string':
          // replace double-quotes with double-double quotes for CSV compat
          tmpStr = data.getValue(i, j).replace(/"/g, '""');
          tmpArr.push('"' + tmpStr + '"');
          break;
        case 'number':
          tmpArr.push(data.getValue(i, j));
          break;
        case 'boolean':
          tmpArr.push((data.getValue(i, j)) ? 'True' : 'False');
          break;
        case 'date':
          // decide what to do here, as there is no universal date format
          break;
        case 'datetime':
          // decide what to do here, as there is no universal date format
          break;
        case 'timeofday':
          // decide what to do here, as there is no universal date format
          break;
        default:
          // should never trigger
      }
    }
    csvData.push(tmpArr.join(','));
  }
  var output = csvData.join('\n');
  var uri = 'data:application/csv;charset=UTF-8,' + encodeURIComponent(output);
  window.open(uri);
}