/**
 * @author Thiago Mata
 *
 * This page aims to make nice and easy to show a cv / resume
 * adapting it to filters and level of details required by the user.
 *
 * To do so we read a json file and present that Information
 * into some different forms.
 *
 */

/**
 * Create the Trending Tags Graphs based on the experiences tag data
 */
function TrendingTagsGraph( resume ) {

  this.resume = resume;

  /**
   * Define the max of different colors to use in the chart
   */
  const maxColors = 10;

  /**
   * Define the max of tags to use into the graph
   */
  const maxTags   = 30;
  const palette   = 'mpn65';

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
      this.palette,
      Math.min( this.maxTags, this.maxColors  )
    );
  }

  this.getColor = function( value ) {
      return this.colorSeq[ value % this.maxColors ];
  }

  this.setSearch = function( value ) {
    this.search = value;
  }

  this.renderGraph = function( tagPlace ) {
    // loadTagTree();
    // loadYearTree();
    // loadYears();
    // loadDataToChart();
    // loadFlatData();
    // loadTagTreeScore();
    this.loadFilteredDataToChart().forEach(
      (d) => renderLineChart( [d], 'Trending use of ' + d.label, tagPlace )
    )
  }

  this.loadTagTree = function () {
    if( this.tagTree != null ) {
      return this.tagTree;
    }

    this.tagTree = this.resume.jsonData.events.map(
      function(n) {
        return Array.
        asArray( n.tags ).
        map(
          function( t ) {
            var endDate = null;

            if (
              n.end_date !== undefined && n.end_date.year !== undefined
            ) {
              endDate = n.end_date.year;
            }

            if( n.present === true ) {
              endDate = new Date().getFullYear();
            }

            if( endDate === null ) {
              return {
                tag: t,
                year: n.start_date.year
              };
            }

            return Array.range( n.start_date.year, endDate + 1 ).map(
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
        if (  searchTerm == "" ||
              searchTerm === undefined ||
              searchTerm === null
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

  this.loadFlatData = function () {
    if( flatData != null ) {
      return flatData;
    }
    flatData = this.loadYears().map(
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
    ).head(maxChartTags);

    return tagTreeScore;
  }

  this.loadDataToChart = function () {
    if( dataToChart != null ) {
      return dataToChart;
    }
    var dataToChart = this.loadTagTreeScore().map(
      function( nodeTag, index ) {
        return {
          label: nodeTag.tag,
          backgroundColor: '#' + seq[index % colors],
          borderColor:'#' + seq[index % colors],
          data: this.loadYears().dataYears.overlaps(
            nodeTag.value,
            (year,node) => node.year == year,
            (node) => node.value
          ),
          fill: false
        }
      }
    );
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

  this.renderLineChart = function ( dataToChart, title, tagPlace ) {

    var years = Array.range(loadYears().min(),loadYears().max() + 1);

    var config = {
      type: 'line',
      data: {
        labels: years,
        datasets:
        dataToChart
      },
      options: {
        responsive: true,
        title:{
          display:true,
          text: title
        },
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Year'
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Value'
            }
          }]
        }
      }
    };

    var tagCanvas = document.createElement("canvas");
    tagPlace.appendChild(tagCanvas);
    var ctx = canvas.getContext("2d");
    new Chart(ctx, config);
  }

  this.construct();
}

function ResumeTemplate( resume ) {

  const headerTemplate     = "#template-row-me";
  const headerTarget       = "#template-row-me-out";
  const pageTitleTemplate  = "#template-page-title";

  var templates = {};
  var resumeTemplate = this;

  if( ! resume instanceof Resume ) {
    throw new Error("invalid resume in the resume template" );
  }
  this.resume = resume;

  var jsonToTemplate = null;

  this.getJsonToTemplate = function () {
    return {
      basic: {
        name: this.resume.jsonData.text.name,
        label: "Software Engineer",
        picture: this.resume.jsondata.picture
      }
    }
  }

  this.getPath = function( objElement, strPath, notFoundValue ) {
    var arrPath = strPath.split(".").reverse();
    var strStep;
    if( notFoundValue === undefined ) {
      notFoundValue = strPath;
    }
    while( strStep = arrPath.pop() ) {
      objElement = objElement[ strStep ];
      if( objElement === undefined ) {
        return notFoundValue;
      }
    }
    return objElement;
  }

  this.getBasicData = function() {
    return {
      name:    resumeTemplate.getPath( this.resume.jsonData, "basics.name" ),
      picture: resumeTemplate.getPath( this.resume.jsonData, "basics.picture", null ),
      label:   resumeTemplate.getPath( this.resume.jsonData, "basics.label", null ),
      summary: resumeTemplate.getPath( this.resume.jsonData, "basics.summary" ),
      email:   resumeTemplate.getPath( this.resume.jsonData, "basics.email" ),
      phone:   resumeTemplate.getPath( this.resume.jsonData, "basics.phone" )
    }
  }

  this.renderPageTitle = function() {
    var source = $(pageTitleTemplate).html();
    var template = Handlebars.compile(source);
    var context  = this.getBasicData();
    var html = template(context);
    document.title = html;
  }

  this.filterByTag = function( experienceNode ) {
    if( resumeTemplate.resume.activeTags.length == 0 ) {
      return experienceNode;
    }
    experienceNode.elements = experienceNode.elements.
    filter(
      element => element.tags.some(
        tag => tag.active
      )
    )
    return experienceNode;
  }

  this.filterByDate = function( experienceNode ) {
    if( ! resumeTemplate.resume.isActiveFilterByDate ) {
      return experienceNode;
    }
    experienceNode.elements = experienceNode.elements.
    sort(
      function ( a, b ) {
        return new Date(b.startDate) - new Date( a.startDate );
      }
    ).head(
      resumeTemplate.filterPageSize
    );
    return experienceNode;
  }

  this.filterByRelevance = function( experienceNode ) {
    if( ! resumeTemplate.resume.isActiveFilterByRelevance ) {
      return experienceNode;
    }
    experienceNode.elements = experienceNode.elements.
    sort(
      function (a,b) {
          return b.relevance - a.relevance;
      }
    ).head(
      resumeTemplate.filterPageSize
    ).sort(
      function ( elementA, elementB ) {
        return  new Date( elementB.startDate ) - new Date( elementA.startDate );
      }
    );
    return experienceNode;
  }

  this.filterBySearchTerm = function( experienceNode ) {
    var searchTerm = resumeTemplate.resume.searchTerm;
    if(  searchTerm == "" || searchTerm === undefined ) {
      return experienceNode;
    }
    experienceNode.elements = experienceNode.elements.
    filter(
      function( element ) {
        return JSON.stringify(element).
          toLowerCase().indexOf(
            searchTerm.toLowerCase()
          ) > -1;
      }
    );

    return experienceNode;
  }

  const SECOND  = 1000;
  const SECONDS = SECOND;
  const MINUTE  = 60  * SECONDS;
  const MINUTES = MINUTE;
  const HOUR    = 60  * MINUTES;
  const HOURS   = HOUR;
  const DAY     = 24  * HOURS;
  const DAYS    = DAY;
  const MONTH   = 30  * DAYS;
  const MONTHS  = MONTH;
  const YEAR    = 365 * DAYS;
  const YEARS   = YEAR;

  this.datesDiff = function ( dateA, dateB ) {

    console.log( dateA , dateB );
    if( dateA === null || dateA === undefined || dateB === null || dateB === undefined ) {
      return null;
    }

    var intDiff = Math.abs( dateA - dateB );

    var intDiffYears = Math.floor( intDiff / YEAR );
    intDiff -= intDiffYears * YEARS;

    var intDiffMonths = Math.floor( intDiff / MONTH );
    intDiff -= intDiffMonths * MONTHS;

    var intDiffDays = Math.floor( intDiff / DAY );
    intDiff -= intDiffDays * DAYS;

    var intDiffHours = Math.floor( intDiff / HOUR );
    intDiff -= intDiffHours * HOURS;

    var intDiffMinutes = Math.floor( intDiff / MINUTE );
    intDiff -= intDiffMinutes * MINUTES;

    var intDiffSeconds = Math.floor( intDiffSeconds / SECOND );
    intDiff -= intDiffSeconds * SECONDS;

    return {
      years:   intDiffYears,
      months:  intDiffMonths,
      days:    intDiffDays,
      hours:   intDiffHours,
      minutes: intDiffMinutes,
      seconds: intDiffSeconds
    }
  }

  this.jsonWorkExperiences;

  this.loadWorkExperiences = function() {
    if( this.jsonWorkExperiences !== undefined ) {
      return this.jsonWorkExperiences;
    }
    return this.jsonWorkExperiences = {
      categoryAnchor:            "professional",
      categoryTitle:             "Professional Experiences",
      elementsTitle:             "professional experiences",
      elements: resumeTemplate.getPath( this.resume.jsonData, "work", [] ).map(
        function( jsonWork ) {
          return {
            relevance:      resumeTemplate.getPath( jsonWork, "relevance", 1 ),
            title:          resumeTemplate.getPath( jsonWork, "position"),
            icon:           resumeTemplate.getPath( jsonWork, "media.icon"),
            company:        resumeTemplate.getPath( jsonWork, "company"),
            website:        resumeTemplate.getPath( jsonWork, "website"),
            startDate:      resumeTemplate.getPath( jsonWork, "startDate"),
            endDate:        resumeTemplate.getPath( jsonWork, "endDate", null ),
            present:        resumeTemplate.getPath( jsonWork, "present", false ),
            description:    resumeTemplate.getPath( jsonWork, "summary"),
            tags:           resumeTemplate.getPath( jsonWork, "keywords", [] ).map(
              function x(tag) {
                return {
                  id: "tag-" + tag,
                  label: tag.
                    split("-").
                    map(
                      function( word ) {
                        return word[0].toUpperCase() + word.substring(1);
                      }
                    ).join(" ")
                }
              }
            )
          }
        }
      ).sort(
        function ( elementA, elementB ) {
          return new Date( elementB.startDate ) - new Date( elementA.startDate );
        }
      ).map(
        function (element,key) {
          element["date-order-position"] = key + 1;
          element.duration = resumeTemplate.datesDiff(
            new Date( element.startDate ),
            element.endDate ? new Date( element.endDate ) : new Date()
          );
          return element;
        }
      )
    }
  }

  this.jsonAcademicHistory;

  this.loadAcademicHistory = function() {
    if( this.jsonAcademicHistory !== undefined ) {
      return this.jsonAcademicHistory;
    }
    return this.jsonAcademicHistory = {
      categoryAnchor:            "academic",
      categoryTitle:             "Academic History",
      elementsTitle:             "academic histories",
      elements: resumeTemplate.getPath( this.resume.jsonData, "education", [] ).filter(
        function( jsonEducation ) {
          return resumeTemplate.getPath( jsonEducation, "studyType", "course" ) != "course";
        }
      ).map(
        function( jsonEducation ) {
          return {
            relevance:      resumeTemplate.getPath( jsonEducation, "relevance", 1 ),
            title:          resumeTemplate.getPath( jsonEducation, "studyType") +
                            " in " +
                            resumeTemplate.getPath( jsonEducation, "area") ,
            icon:           resumeTemplate.getPath( jsonEducation, "media.icon"),
            company:        resumeTemplate.getPath( jsonEducation, "institution"),
            website:        resumeTemplate.getPath( jsonEducation, "website", null),
            startDate:      resumeTemplate.getPath( jsonEducation, "startDate"),
            endDate:        resumeTemplate.getPath( jsonEducation, "endDate", null ),
            present:        resumeTemplate.getPath( jsonEducation, "present", false ),
            description:    resumeTemplate.getPath( jsonEducation, "summary", null ),
            tags:           resumeTemplate.getPath( jsonEducation, "keywords", [] ).map(
              function (tag) {
                return {
                  id: "tag-" + tag,
                  label: tag.
                    split("-").
                    map(
                      function( word ) {
                        return word[0].toUpperCase() + word.substring(1);
                      }
                    ).join(" ")
                }
              }
            )
          }
        }
      ).sort(
        function ( elementA, elementB ) {
          return new Date( elementB.startDate ) - new Date( elementA.startDate );
        }
      ).map(
        function (element,key) {
          element["date-order-position"] = key + 1;
          element.duration = resumeTemplate.datesDiff(
            new Date( element.startDate ),
            element.endDate ? new Date( element.endDate ) : new Date()
          );
          return element;
        }
      )
    }
  }

  this.jsonAcademicHistory;

  this.loadCoursesHistory = function() {
    if( this.jsonCourseHistory !== undefined ) {
      return this.jsonCourseHistory;
    }
    return this.jsonCourseHistory = {
      categoryAnchor:            "courses",
      categoryTitle:             "Courses History",
      elementsTitle:             "courses histories",
      elements: resumeTemplate.getPath( this.resume.jsonData, "education", [] ).filter(
        function( jsonEducation ) {
          return resumeTemplate.getPath( jsonEducation, "studyType", "course" ) == "course";
        }
      ).map(
        function( jsonEducation ) {
          return {
            relevance:      resumeTemplate.getPath( jsonEducation, "relevance", 1 ),
            title:          resumeTemplate.getPath( jsonEducation, "title"),
            icon:           resumeTemplate.getPath( jsonEducation, "media.icon"),
            company:        resumeTemplate.getPath( jsonEducation, "institution"),
            website:        resumeTemplate.getPath( jsonEducation, "website", null),
            certificate:    resumeTemplate.getPath( jsonEducation, "certificate", null),
            startDate:      resumeTemplate.getPath( jsonEducation, "startDate"),
            endDate:        resumeTemplate.getPath( jsonEducation, "endDate", null ),
            present:        resumeTemplate.getPath( jsonEducation, "present", false ),
            description:    resumeTemplate.getPath( jsonEducation, "summary", null ),
            tags:           resumeTemplate.getPath( jsonEducation, "keywords", [] ).map(
              function (tag) {
                return {
                  id: "tag-" + tag,
                  label: tag.
                    split("-").
                    map(
                      function( word ) {
                        return word[0].toUpperCase() + word.substring(1);
                      }
                    ).join(" ")
                }
              }
            )
          }
        }
      ).sort(
        function ( elementA, elementB ) {
          return new Date( elementB.startDate ) - new Date( elementA.startDate );
        }
      ).map(
        function (element,key) {
          element["date-order-position"] = key + 1;
          if( element.endDate != null ) {
            element.duration = resumeTemplate.datesDiff(
              new Date( element.startDate ),
              element.endDate
            );
          } else {
            element.duration = null;
          }
          return element;
        }
      )
    }
  }

  this.filterExperienceNode = function( fullNode ) {
    var filteredNode = JSON.parse( JSON.stringify( fullNode ) );
    filteredNode.isActiveFilterByDate = this.resume.isActiveFilterByDate;
    filteredNode.isActiveFilterByRelevance = this.resume.isActiveFilterByRelevance;
    filteredNode.elements = filteredNode.elements.map(
      function (element) {
        element.tags = element.tags.map(
          function (tag) {
            tag.active = this.resume.activeTags.indexOf( tag.id ) > -1;
            return tag;
          }
        );
        return element;
      }
    );

    resumeTemplate.filterByTag( filteredNode );
    resumeTemplate.filterByRelevance( filteredNode );
    resumeTemplate.filterByDate( filteredNode );
    resumeTemplate.filterBySearchTerm( filteredNode );

    filteredNode.searchFilter        =this.getSearchFilter();
    filteredNode.hasElements         = fullNode.elements.length     > 0;
    filteredNode.hasVisibileElements = filteredNode.elements.length > 0;
    filteredNode.hasHiddenElements   =
      filteredNode.elements.length < fullNode.elements.length;
    filteredNode.countHidden         =
      fullNode.elements.length - filteredNode.elements.length;

    return filteredNode;
  }

  this.getWorkExperiences = function() {
    var fullNode     = resumeTemplate.loadWorkExperiences();
    return this.filterExperienceNode( fullNode );
  }

  this.getAcademicHistory = function() {
    var fullNode     = resumeTemplate.loadAcademicHistory();
    return this.filterExperienceNode( fullNode );
  }

  this.getCoursesHistory = function() {
    var fullNode     = resumeTemplate.loadCoursesHistory();
    return this.filterExperienceNode( fullNode );
  }

  this.getSocialNetworks = function() {
    return {
      socialNetworks: resumeTemplate.getPath( this.resume.jsonData, "basics.profiles", [] ).map(
        function( profile ) {
          return {
            name: resumeTemplate.getPath( profile, "network"),
            icon: resumeTemplate.getPath( profile, "network").toLowerCase(),
            link: resumeTemplate.getPath( profile, "url" )
          }
        }
      )
    }
  }

  this.getTemplateBySourceId = function( sourceId ) {
    if( templates[ sourceId ] !== undefined ) {
      return template[ sourceId ];
    }
    var source = $(sourceId).html();
    var template = Handlebars.compile( source );
    template[ sourceId ] = template;
    return template;
  }

  this.getActiveTags = function() {
    return {
      tags: this.resume.activeTags
    };
  }

  this.getSearchFilter = function() {
    if( this.resume.isActiveFilterByDate ) {
      return this.resume.getFilterByDateValue();
    }
    if( this.resume.isActiveFilterByRelevance ) {
      return this.resume.getFilterByRelevanceValue();
    }
    return this.resume.getNoFilterValue();
  }

  this.isActiveFilterByRelevance = function() {
    return this.resume.isActiveFilterByDate;
  }

  this.renderTemplates = function( booOnUpdate ) {
    $("[data-template-source]").filter(
      function( key, element ) {
        var $element = $(element);
        if( ! booOnUpdate ) {
          return true;
        }

        var renderOnUpdate = $element.data("render-on-update");
        if( renderOnUpdate === undefined ) {
          return true;
        }
        return renderOnUpdate;
      }
    ).each(
      function( key, element ) {
        var $element = $(element);
        var contextFunction = $element.data("template-context");
        var contextData;
        if( contextFunction === undefined ) {
          contextData = resumeTemplate.resume;
        } else {
          contextData = resumeTemplate[ contextFunction ]();
        }

        var templateId = $element.data("template-source");
        var template = resumeTemplate.getTemplateBySourceId( templateId );
        var html = template(contextData);
        $element.html(html);
      }
    )
  }

  this.render = function () {
    this.renderPageTitle();
    this.renderTemplates( false );
  }

  this.update = function() {
    this.renderTemplates( true );
  }

  this.construct = function () {
    Handlebars.registerHelper('ifCond', function(v1, v2, options) {
      if(v1 === v2) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    this.render();
  }

  this.construct();
}

function Resume() {

  const database = "./assets/json/resume.json";

  const graphElement = $("#canvas-box");

  this.jsonData = null;
  this.resumeTemplate = null;

  this.loadJson = function () {
    var _this = this;
    $.getJSON(
      database,
      function( data ) {
        _this.applyTemplate( data )
      }
    )
  }

  this.applyTemplate = function ( data ) {
    this.jsonData = data;
    // this.trendingTagsGraph = new TrendingTagsGraph( resume );
    // this.trendingTagsGraph.renderGraph( graphElement );
    this.resumeTemplate = new ResumeTemplate( this );
  }

  this.construct = function () {
    this.loadJson();
  }

  this.activeTags = [];

  this.searchTerm = "";

  /**
   * Filter the experiences to just shows
   * the most relevant ones
   */
  this.isActiveFilterByRelevance = true;

  /**
   * Filter the experiences to just shows
   * the most recent ones
   */
  this.isActiveFilterByDate = false;

  const filterByRelevanceValue = "relevants";
  this.getFilterByRelevanceValue = () => filterByRelevanceValue

  const filterByDateValue = "last";
  this.getFilterByDateValue = () => filterByDateValue

  const noFilterValue = "all";
  this.getNoFilterValue = () => noFilterValue


  /**
   * If some sort filter is being applied,
   * how many results should return max
   */
  this.filterPageSize = 5;

  this.onSelectFilterChange = function( selectElement ) {
    switch( selectElement.value ) {
      case noFilterValue:
        this.isActiveFilterByDate      = false;
        this.isActiveFilterByRelevance = false;
        break;
      case filterByDateValue:
        this.isActiveFilterByDate      = true;
        this.isActiveFilterByRelevance = false;
        break;
      case filterByRelevanceValue:
        this.isActiveFilterByDate      = false;
        this.isActiveFilterByRelevance = true;
        break;
      default:
        throw Error("Unknow selectElement.value " + selectElement.value );
    }
    this.resumeTemplate.update();
  }

  this.updateSearchTerm = function( searchElement ) {
    this.searchTerm = searchElement.value;
    this.resumeTemplate.update();
  }

  this.clickTag = function( tagId ) {
    var pos = this.activeTags.indexOf( tagId );
    if( pos != -1 ) {
      this.activeTags.splice( pos, 1 );
    } else {
      this.activeTags.push( tagId );
    }
    this.resumeTemplate.update();
      // renderExperiences( 'work-panel' );
      // renderExperiences( 'scholar-panel' );
      // renderExperiences( 'course-panel' );
      // renderGraph();
  }

  this.clearFilter = function() {
    this.isActiveFilterByDate      = false;
    this.isActiveFilterByRelevance = false
    this.searchTerm                = "";
    this.resumeTemplate.update();
  }

  this.construct();
}

$( document ).ready(
  function() {
      window.resume = new Resume();
  }
)
