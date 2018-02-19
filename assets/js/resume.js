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
function TrendingTagsGraph( resume, tagElementInput ) {

  var self = this;

  self.resume = resume;

  self.tagElement = tagElementInput;

  self.chartData = null;

  /**
   * Define the max of different colors to use in the chart
   */
  self.maxColors = 10;

  /**
   * Defines the color pallete
   */
  self.colorsPalette = 'mpn65';

  /**
   * Define the max of tags to use into the graph
   */
  self.maxTags   = 30;


  construct = function() {
    self.definePallete();
    self.loadChartData();
  }

  self.colorSeq = null;

  self.definePallete = function() {
    self.colorSeq = palette(
      self.colorsPalette,
      self.maxColors
    );
  }

  self.getColor = function( value ) {
      return "#" + self.colorSeq[ value % self.maxColors ];
  }

  self.loadNodesTagAndYear = function() {


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


    return allEvents.map(
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
  }

  self.loadChartData = function() {
    var nodeYearWithTags = this.loadNodesTagAndYear().reduce(
      function( accYearWithTags, element ) {
        var year = element.year;
        var tag  = element.tag;
        if( accYearWithTags[ year ] === undefined ) {
          accYearWithTags.years.push( year );
          accYearWithTags[ year ] = {
            total: 0,
            tags: []
          };
        }
        if( accYearWithTags[ year][ tag ] === undefined ) {
          accYearWithTags[ year ][ tag ] = 1;
          accYearWithTags[ year ].tags.push( tag );
        } else {
          accYearWithTags[ year ][ tag ]++;
        }
        accYearWithTags[ year ].total++;
        return accYearWithTags;
      },
      {
        years: []
      }
    );

    var normalizedYearTag = [];
    nodeYearWithTags.years.forEach(
      function (year) {
        var nodeYearTag = nodeYearWithTags[ year ];
        var tags = nodeYearTag.tags;
        tags.forEach(
          function (tag) {
            var countTagOnYear = nodeYearTag[ tag ];
            normalizedYearTag.push({
              year: year,
              tag: tag,
              score: Math.round( 100 * countTagOnYear / nodeYearTag.total )
            })
          }
        )
      }
    );

    self.yearsRange = Array.range(
      nodeYearWithTags.years.min(),
      nodeYearWithTags.years.max() + 1
    );

    self.chartData  = normalizedYearTag.groupByFunction(
      (node) => node.tag
    ).
    map(
      function( node ) {
        node.totalScore = node.value.map(
           node => node.score
        ).sum();
        return node;
      }
    ).
    sort(
      (a, b) => b.totalScore - a.totalScore
    ).
    head(10).
    map(
      function(node) {
        var scores = self.yearsRange.overlaps(
          node.value,
          function searchNode( year, node ) {
            return node.year == year;
          },
          function getNode( node ) {
            return node.score;
          },
          null
        );
        return {
          tag: node.key,
          years: self.yearsRange,
          scores: scores,
          totalScore: node.totalScore
        }
      }
    );
  }

  self.renderGraph = function() {
    self.chartData.forEach(
      function( dataChartElement, key ) {
        console.log(dataChartElement);
        self.renderLineChart(
          [
            {
              "label": dataChartElement.tag,
              backgroundColor: self.getColor(key),
              borderColor: self.getColor(key),
              data: dataChartElement.scores,
              fill: false
            }
          ],
          dataChartElement.tag + " trend"
        );
      }
    )
  }


  this.renderLineChart = function ( dataToChart, title ) {

    var years = Array.range(self.yearsRange.min(),self.yearsRange.max() + 1);

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
    self.tagElement.append(tagCanvas);
    var ctx = tagCanvas.getContext("2d");
    new Chart(ctx, config);
  }

  construct();
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

  this.getBasicData = function() {
    return {
      name:    Resume.getPath( this.resume.jsonData, "basics.name" ),
      picture: Resume.getPath( this.resume.jsonData, "basics.picture", null ),
      label:   Resume.getPath( this.resume.jsonData, "basics.label", null ),
      summary: Resume.getPath( this.resume.jsonData, "basics.summary" ),
      email:   Resume.getPath( this.resume.jsonData, "basics.email" ),
      phone:   Resume.getPath( this.resume.jsonData, "basics.phone" ),
      jsonresume: this.resume.getDatabase()
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
      elements: Resume.getPath( this.resume.jsonData, "work", [] ).map(
        function( jsonWork ) {
          return {
            relevance:      Resume.getPath( jsonWork, "relevance", 1 ),
            title:          Resume.getPath( jsonWork, "position"),
            icon:           Resume.getPath( jsonWork, "media.icon"),
            company:        Resume.getPath( jsonWork, "company"),
            website:        Resume.getPath( jsonWork, "website"),
            startDate:      Resume.getPath( jsonWork, "startDate"),
            endDate:        Resume.getPath( jsonWork, "endDate", null ),
            present:        Resume.getPath( jsonWork, "present", false ),
            description:    Resume.getPath( jsonWork, "summary"),
            tags:           Resume.getPath( jsonWork, "keywords", [] ).map(
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
      elements: Resume.getPath( this.resume.jsonData, "education", [] ).filter(
        function( jsonEducation ) {
          return Resume.getPath( jsonEducation, "studyType", "course" ) != "course";
        }
      ).map(
        function( jsonEducation ) {
          return {
            relevance:      Resume.getPath( jsonEducation, "relevance", 1 ),
            title:          Resume.getPath( jsonEducation, "studyType") +
                            " in " +
                            Resume.getPath( jsonEducation, "area") ,
            icon:           Resume.getPath( jsonEducation, "media.icon"),
            company:        Resume.getPath( jsonEducation, "institution"),
            website:        Resume.getPath( jsonEducation, "website", null),
            startDate:      Resume.getPath( jsonEducation, "startDate"),
            endDate:        Resume.getPath( jsonEducation, "endDate", null ),
            present:        Resume.getPath( jsonEducation, "present", false ),
            description:    Resume.getPath( jsonEducation, "summary", null ),
            tags:           Resume.getPath( jsonEducation, "keywords", [] ).map(
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
      elements: Resume.getPath( this.resume.jsonData, "education", [] ).filter(
        function( jsonEducation ) {
          return Resume.getPath( jsonEducation, "studyType", "course" ) == "course";
        }
      ).map(
        function( jsonEducation ) {
          return {
            relevance:      Resume.getPath( jsonEducation, "relevance", 1 ),
            title:          Resume.getPath( jsonEducation, "title"),
            icon:           Resume.getPath( jsonEducation, "media.icon"),
            company:        Resume.getPath( jsonEducation, "institution"),
            website:        Resume.getPath( jsonEducation, "website", null),
            certificate:    Resume.getPath( jsonEducation, "certificate", null),
            startDate:      Resume.getPath( jsonEducation, "startDate"),
            endDate:        Resume.getPath( jsonEducation, "endDate", null ),
            present:        Resume.getPath( jsonEducation, "present", false ),
            description:    Resume.getPath( jsonEducation, "summary", null ),
            tags:           Resume.getPath( jsonEducation, "keywords", [] ).map(
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

  this.loadPapersHistory = function() {
    if( this.jsonPaperHistory !== undefined ) {
      return this.jsonPaperHistory;
    }
    return this.jsonPaperHistory = {
      categoryAnchor:            "scientific-papers",
      categoryTitle:             "Scientific Papers",
      elementsTitle:             "papers",
      elements: Resume.getPath( this.resume.jsonData, "papers", [] ).map(
        function( jsonPaper ) {
          return {
            relevance:      Resume.getPath( jsonPaper, "relevance", 1 ),
            title:          Resume.getPath( jsonPaper, "title"),
            icon:           Resume.getPath( jsonPaper, "media.icon", null ),
            abbreviation:   Resume.getPath( jsonPaper, "event.abbreviation",
                              Resume.getPath( jsonPaper, "repository.name")
                            ),
            company:        Resume.getPath( jsonPaper, "event.name",
                              Resume.getPath( jsonPaper, "repository.institution")
                            ),
            website:        Resume.getPath( jsonPaper, "event.website", null),
            "see-more":     Resume.getPath( jsonPaper, "website", null),
            startDate:      Resume.getPath( jsonPaper, "releaseDate"),
            endDate:        null,
            present:        false,
            description:    Resume.getPath( jsonPaper, "summary", null ),
            authors:        Resume.getPath( jsonPaper, "authors", null ),
            tags:           Resume.getPath( jsonPaper, "keywords", [] ).map(
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

  this.loadAwardsHistory = function() {
    if( this.jsonAwardsHistory !== undefined ) {
      return this.jsonAwardsHistory;
    }
    return this.jsonAwardsHistory = {
      categoryAnchor:            "awards",
      categoryTitle:             "Awards",
      elementsTitle:             "awards",
      elements: Resume.getPath( this.resume.jsonData, "awards", [] ).map(
        function( jsonAwards ) {
          return {
            relevance:      Resume.getPath( jsonAwards, "relevance", 1 ),
            title:          Resume.getPath( jsonAwards, "title"),
            icon:           Resume.getPath( jsonAwards, "media.icon", null ),
            // abbreviation:   Resume.getPath( jsonAwards, "event.abbreviation",
            //                   Resume.getPath( jsonAwards, "repository.name")
            //                 ),
            company:        Resume.getPath( jsonAwards, "awarder"),
            //                   Resume.getPath( jsonAwards, "repository.institution")
            //                 ),
            // website:        Resume.getPath( jsonAwards, "event.website", null),
            // "see-more":     Resume.getPath( jsonAwards, "website", null),
            // startDate:      Resume.getPath( jsonAwards, "releaseDate"),
            // endDate:        null,
            // present:        false,
            description:    Resume.getPath( jsonAwards, "summary", null ),
            // authors:        Resume.getPath( jsonAwards, "authors", null ),
            tags:           Resume.getPath( jsonAwards, "keywords", [] ).map(
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
    return resumeTemplate.filterExperienceNode( fullNode );
  }

  this.getAcademicHistory = function() {
    var fullNode     = resumeTemplate.loadAcademicHistory();
    return resumeTemplate.filterExperienceNode( fullNode );
  }

  this.getCoursesHistory = function() {
    var fullNode     = resumeTemplate.loadCoursesHistory();
    return resumeTemplate.filterExperienceNode( fullNode );
  }

  this.getPapersHistory = function() {
    var fullNode     = resumeTemplate.loadPapersHistory();
    return resumeTemplate.filterExperienceNode( fullNode );
  }

  this.getAwardsHistory = function() {
    var fullNode     = resumeTemplate.loadAwardsHistory();
    return resumeTemplate.filterExperienceNode( fullNode );
  }

  this.getSocialNetworks = function() {
    return {
      socialNetworks: Resume.getPath( this.resume.jsonData, "basics.profiles", [] ).map(
        function( profile ) {
          return {
            name: Resume.getPath( profile, "network"),
            icon: Resume.getPath( profile, "network").toLowerCase(),
            link: Resume.getPath( profile, "url" )
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
          var contextVar = ( resumeTemplate[ contextFunction] );
          if( contextVar === undefined ) {
            throw new Error("invalid context ", contextFunction );
          }
          if( contextVar instanceof Function ) {
            contextData = contextVar();
          } else {
            contextData = contextVar;
          }
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

    Handlebars.registerHelper('ifArraySize', function(v1, v2, options) {
      if(v1.length === v2) {
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
  this.getDatabase = function(){
    return database;
  }

  const graphElement = $("#canvas-box");

  this.jsonData = null;
  this.resumeTemplate = null;
  this.trendingTagsGraph = null;

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
    this.trendingTagsGraph = new TrendingTagsGraph( resume, graphElement );
    this.trendingTagsGraph.renderGraph();
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
    this.trendingTagsGraph.renderGraph();
  }

  this.clearFilter = function() {
    this.isActiveFilterByDate      = false;
    this.isActiveFilterByRelevance = false
    this.searchTerm                = "";
    this.resumeTemplate.update();
  }

  this.construct();
}

Resume.getPath = function( objElement, strPath, notFoundValue ) {
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


$( document ).ready(
  function() {
      window.resume = new Resume();
  }
)
