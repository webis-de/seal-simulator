exports.log = function(name, attributes = {}) {
  const record = Object.assign({}, attributes);
  record.timestamp = new Date().toISOString();
  record.event = name;
  const keyOrder = ["timestamp", "event"].concat(Object.keys(attributes));
  console.log(JSON.stringify(record, keyOrder));
}
