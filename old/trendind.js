var self = this;
this.resume = resume;
this.tagElement = tagElement;

/**
 * Define the max of different colors to use in the chart
 */
const maxColors = 10;

/**
 * Define the max of tags to use into the graph
 */
const maxTags   = 30;
const colorsPalette = 'mpn65';

/**
 * Search filter. Default is null
 */
search: null;

/**
 * Color sequence function
 */
var colorSeq;

/**
 * Data grouped by tag
 */
var tagTree         = null;

/**
 * Data grouped by year
 */
var yearTree        = null;

/**
 * Data with all the extra
 * necessary information
 */
var flatData        = null;

/**
 * Fake Constructor. load Data
 */
this.construct = function () {
  this.colorSeq = palette(
    colorsPalette,
    Math.min( this.maxTags, this.maxColors  )
  );
}

this.getColor = function( value ) {
    return this.colorSeq[ value % this.maxColors ];
}

this.setSearch = function( value ) {
  this.search = value;
}

this.renderGraph = function() {
  // loadTagTree();
  // loadYearTree();
  // loadYears();
  // loadDataToChart();
  // loadFlatData();
  // loadTagTreeScore();
  this.loadFilteredDataToChart().forEach(
    (d) => renderLineChart( [d], 'Trending use of ' + d.label )
  )
}

this.loadTagTree = function () {
  if( tagTree != null ) {
    return tagTree;
  }

  var allEvents = Resume.getPath( this.resume.jsonData, "work", []
  ).concat(
    Resume.getPath( this.resume.jsonData, "education", [] )
  ).concat(
    Resume.getPath( this.resume.jsonData, "papers", [] )
  ).concat(
    Resume.getPath( this.resume.jsonData, "awards", [] )
  ).concat(
    Resume.getPath( this.resume.jsonData, "publications", [] )
  ).concat(
    Resume.getPath( this.resume.jsonData, "volunteer", [] )
  ).reduce(
    function( accumulator, node ) {
      if( node.startDate !== undefined ) {
        accumulator.push( node );
        return accumulator;
      }
      if( node.releaseDate !== undefined ) {
        node.startDate = node.releaseDate;
        accumulator.push( node );
        return accumulator;
      }
      if( node.date !== undefined ) {
        node.startDate = node.date;
        accumulator.push( node );
        return accumulator;
      }
      /* Elements with no date will not
       * be usefully and can be removed in
       * the first step
       */
      return accumulator;
    }, []
  );


  tagTree = allEvents.map(
    function(n) {
      return Array.
      asArray( n.keywords ).
      map(
        function( t ) {
          var endDate = null;

          if (
            n.endDate !== undefined && n.endDate.year !== undefined
          ) {
            endDate = new Date( n.endDate ).getFullYear();
          }

          if( n.present === true ) {
            endDate = new Date().getFullYear();
          }

          var startDate = new Date( n.startDate );
          var startDateYear = startDate.getFullYear();

          if( endDate === null ) {
            return {
              tag: t,
              year: startDateYear
            };
          }

          return Array.range( startDateYear, endDate + 1 ).map(
            function( year ) {
              return {
                tag: t,
                year: year
              }
            }
          )
        }
      )
    }
  ).
  flatRecursive();

  return tagTree;
}

this.loadYearTree = function () {
  if( yearTree != null ) {
    return yearTree;
  }

  yearTree = this.loadTagTree().filter(
    function(x) {
      if (  this.resume.searchTerm == "" ||
            this.resume.searchTerm === undefined ||
            this.resume.searchTerm === null
      ) {
        return true;
      }
    }
  ).
  groupByFunction( (x) => x.year ).
  sort( (a,b) => a.key - b.key );

  return yearTree;
}

this.loadYears = function () {
  return {
    dataYears:      this.loadYearTree().map( y => y.key ),
    dataYearsCount: this.loadYearTree().map( y => y.value.length )
  }
}

var flatdata = null;

this.loadFlatData = function () {
  if( flatData != null ) {
    return flatData;
  }
  flatData = this.loadYearTree().map(
    function( nodeYear ) {
      return nodeYear.value.
      map( t => t.tag ).
      countByValues().
      map(
        function ( nodeTag ) {
          return {
            year: nodeYear.key,
            tag: nodeTag.key,
            value: Math.round( 100 * nodeTag.value / nodeYear.value.length )
          }
        }
      )
    }
  ).
  flatRecursive();

  return flatData;
}

var tagTreeScore = null;

this.loadTagTreeScore = function () {
  if( tagTreeScore != null ) {
    return tagTreeScore;
  }

  tagTreeScore = this.loadFlatData().groupByFunction(
    (x) => x.tag
  ).map(
    function (nodeTag) {
      return {
        tag: nodeTag.key,
        value: nodeTag.value.map(
          function (nodeValue) {
            return {
              year: nodeValue.year,
              value: nodeValue.value
            }
          }
        ).sort(
          (a,b) => a.year - b.year
        )
      }
    }
  ).sort(
    (a,b) => b.value.length - a.value.length
  ).head(maxTags);

  return tagTreeScore;
}

var dataToChart = null;

this.loadDataToChart = function () {
  if( dataToChart != null ) {
    return dataToChart;
  }
  dataToChart = this.loadTagTreeScore().map(
    function( nodeTag, index ) {
      return {
        label: nodeTag.tag,
        backgroundColor: '#' + self.getColor(index),
        borderColor:'#' + self.getColor(index),
        data: self.loadYears().dataYears.overlaps(
          nodeTag.value,
          (year,node) => node.year == year,
          (node) => node.value
        ),
        fill: false
      }
    }
  );
  return dataToChart;
}

this.loadFilteredDataToChart = function () {
  return this.loadDataToChart().
  filter(
    function( d ) {
      if( tags.length == 0 ) {
        return true;
      }
      return ( tags.indexOf( d.label) > -1 );
    }
  )
}
