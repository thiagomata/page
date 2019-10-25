Array.range = function(a, b, step) {
  var p = [];
  if (step === undefined) {
    step = 1;
  }
  if (b === undefined) {
    // b = a;
    // a = 0;
    b = 0;
  }
  if (a < b) {
    step = Math.abs(step);
  } else {
    step = Math.abs(step) * -1;
  }

  for (var i = a; i != b; i += step) {
    p.push(i);
  }
  return p;
};

Array.prototype.take = function(n) {
  return this.slice(0, n);
};

Array.prototype.head = function(n) {
  if (n === undefined) {
    n = 10;
  }
  return this.take(n);
};

Array.prototype.tail = function(n) {
  if (n === undefined) {
    n = 10;
  }
  return this.slice(this.length - n);
};

Array.prototype.has = function( f ) {
  return this.findIndex( f ) > -1;
}

Array.prototype.unique = function() {
  if (this.length === 0) {
    return this;
  }
  return this.map(x => [x]).reduce((x, y) =>
    x.concat(y.filter(y1 => x.indexOf(y1) == -1))
  );
};

Array.prototype.max = function() {
  return this.reduce((x, y) => (x > y ? x : y));
};

Array.prototype.min = function() {
  return this.reduce((x, y) => (x < y ? x : y));
};

Array.prototype.sum = function() {
  return this.reduce((x, y) => x + y);
};

Array.prototype.avg = function() {
  return this.sum() / this.length;
};

Array.prototype.normalize = function() {
  var total = this.sum();
  return this.map(x => x / total);
};

Array.prototype.accumulate = function() {
  return this.map(x => [x]).reduce(function(x, y) {
    var s = x.max();
    var yAcc = y.map(v => v + s);
    return x.concat(yAcc);
  });
};

Array.prototype.aggregate = function(
  otherArray,
  aggregateFunction,
  onlyOneFoundFunction
) {
  var size = Math.max(this.length, otherArray.length);
  if (aggregateFunction === undefined) {
    aggregateFunction = (x, y) => x + y;
  }
  if (onlyOneFoundFunction === undefined) {
    onlyOneFoundFunction = x => x;
  }
  var me = this;
  return Array.range(0, size, 1).map(function(k) {
    if (k >= otherArray.length) {
      return onlyOneFoundFunction(me[k]);
    }
    if (k >= me.length) {
      return onlyOneFoundFunction(otherArray[k]);
    }
    return aggregateFunction(me[k], otherArray[k]);
  });
};

Array.prototype.overlaps = function( ys, fSearch, fGet, valueEmpty ) {
  if( fSearch === undefined ) {
    fSearch = (a,b) => a == b
  }
  if( fGet === undefined ) {
    fGet = (a) => a
  }
  if( valueEmpty === undefined ) {
    valueEmpty = null;
  }
  return this.map(
    function ( xv ) {
      var p = ys.findIndex( (yv) => fSearch(xv, yv ) );
      if( p == -1 ) return valueEmpty;
      return fGet( ys[ p ] )
    }
  )
}

Array.prototype.errorComparing = function( otherArray) {
  return this.aggregate(otherArray, (x, y) => Math.round(x - y));
};

Array.prototype.flat = function() {
  return this.map(
    e => e.constructor === Array ? e : [e]
  ).
  reduce(
    (a,b) => a.concat(b)
  )
}

Array.prototype.flatRecursive = function() {
  return this.map(
    e => e.constructor === Array ? e.flatRecursive() : [e]
  ).
  reduce(
    (a,b) => a.concat(b),
    []
  )
}

Array.asArray = function( e ) {
  if( e === undefined ) return [];
  if( e instanceof Array ) return e;
  return [e];
}
