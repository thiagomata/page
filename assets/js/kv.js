Array.prototype.countByValues = function() {
  var counts = [];
  var vs = [];
  this.forEach(function(v) {
    var p = vs.indexOf(v);
    if (p == -1) {
      vs.push(v);
      counts.push(1);
    } else {
      counts[p]++;
    }
  });

  var range = Array.range(0, vs.length);

  return range.map(function(p) {
    return {
      key: vs[p],
      value: counts[p]
    };
  });
};

Array.prototype.groupByFunction = function( f ) {
  var ks = [];
  var vs = [];
  this.forEach(function(n) {
    var k = f(n);
    var p = ks.indexOf( k );
    if (p == -1) {
      ks.push(k);
      vs.push([n]);
    } else {
      vs[p].push(n);
    }
  });

  var range = Array.range(0, vs.length);

  return range.map(function(p) {
    return {key: ks[p], value: vs[p]};
  });
};

Array.asKV = function(arrKey, arrValue) {
  return arrKey.aggregate(
    arrValue,
    function(k, v) { return {key: k, value: v} },
    function(k) { return {key: k, value: null} }
  );
};

Array.prototype.KVfindIndexKey = function(key) {
  return this.findIndex(kv => kv.key == key);
};

Array.prototype.KVfindKey = function(key) {
  return this.find(kv => kv.key == key);
};

Array.prototype.KVfindValue = function(value) {
  return this.find(kv => kv.value == value);
};

Array.prototype.KVfindIndexValue = function(value) {
  return this.findIndex(kv => kv.value == value);
};

Array.prototype.KVsortByValues = function() {
  return this.sort((kv1, kv2) => kv1.value - kv2.value);
};

Array.prototype.KVsortByKeys = function() {
  return this.sort((kv1, kv2) => kv1.key - kv2.key);
};

Array.prototype.KVgetKeys = function() {
  return this.map(kv => kv.key);
};

Array.prototype.KVgetValues = function() {
  return this.map(kv => kv.value);
};

Array.prototype.KVsumKeys = function() {
  return this.reduce(
    function(x, y) { return {
        key: x.key + y.key,
        value: 0
      }
    }
  ).key;
};

Array.prototype.KVsumValues = function() {
  return this.reduce(
    function (x, y) {
      return {
        key: 0,
        value: x.value + y.value
      }
    }
  ).value;
};

Array.prototype.KVnormalizeValues = function() {
  var total = this.KVsumValues();
  return this.map(
    function (kv) {
      return {
        key: kv.key,
        value: kv.value / total
      }
    }
  );
};

Array.prototype.KVnormalizeKeys = function() {
  var total = this.KVsumKeys();
  return this.map(
    function(kv) {
      return {
        key: kv.key / total,
        value: kv.value
      }
    }
  );
};

Array.prototype.KVaggregate = function(otherKV, aggregateFunction, initialValue ) {
  if (aggregateFunction === undefined) {
    aggregateFunction = (x, y) => x + y;
  }
  if(initialValue === undefined) {
    initialValue = 0;
  }
  var me = this;
  var myKeys = this.KVgetKeys();
  var otherKeys = otherKV.KVgetKeys();
  var fullKeys = myKeys.concat(otherKeys).unique();
  return fullKeys.map(function(k) {
    var myIndex = me.KVfindIndexKey(k);
    var otherIndex = otherKV.KVfindIndexKey(k);
    var myValue = myIndex == -1 ? initialValue : me[myIndex].value;
    var otherValue = otherIndex == -1 ? initialValue : otherKV[otherIndex].value;
    return {key: k, value: aggregateFunction(myValue, otherValue)};
  });
};
