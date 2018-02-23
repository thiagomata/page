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
              n.endDate !== undefined
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
          0
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
    self.tagElement.innerHTML = "";
    self.chartData.
    filter(
      (node) => {
        if( self.resume.activeTags.length == 0 ) {
          return true;
        }
        return self.resume.activeTags.indexOf( node.tag ) > -1;
      }
    ).
    filter(
      (node) => {
        if( this.resume.searchTerm == "" ) {
          return true;
        }

        return  self.resume.searchTerm.indexOf( node.tag ) > -1 ||
                node.tag.indexOf( self.resume.searchTerm ) > -1;
      }
    ).
    head(self.maxTags).
    forEach(
      function( dataChartElement, key ) {
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

    var tagCanvasContainer = document.createElement("div");
    tagCanvasContainer.setAttribute("class","canvas-container");
    var tagCanvas = document.createElement("canvas");
    self.tagElement.append(tagCanvasContainer);
    tagCanvas.setAttribute("height",tagCanvas.clientHeight);
    tagCanvasContainer.append(tagCanvas);
    var ctx = tagCanvas.getContext("2d");
    new Chart(ctx, config);
  }

  construct();
}

function ResumeTemplate( resume ) {

  const headerTemplate     = "#template-row-me";
  const headerTarget       = "#template-row-me-out";

  const pageTitleTemplate     = "#template-page-title";
  const pageMetaDescTemplate  = "#template-meta-description";

  var templates = {};
  var resumeTemplate = this;
  var self = this;

  self.filterRelevanceMax = 10;
  self.filterDateMax = 10;

  if( ! resume instanceof Resume ) {
    throw new Error("invalid resume in the resume template" );
  }
  self.resume = resume;

  var jsonToTemplate = null;

  self.getJsonToTemplate = function () {
    return {
      basic: {
        name: self.resume.jsonData.text.name,
        label: "Software Engineer",
        picture: self.resume.jsondata.picture
      }
    }
  }

  self.getBasicData = function() {
    return {
      name:    Resume.getPath( self.resume.jsonData, "basics.name" ),
      picture: Resume.getPath( self.resume.jsonData, "basics.picture", null ),
      label:   Resume.getPath( self.resume.jsonData, "basics.label", null ),
      summary: Resume.getPath( self.resume.jsonData, "basics.summary" ),
      email:   Resume.getPath( self.resume.jsonData, "basics.email" ),
      phone:   Resume.getPath( self.resume.jsonData, "basics.phone" ),
      jsonresume: self.resume.getDatabase()
    }
  }

  self.renderPageTitle = function() {
    var source = $(pageMetaDescTemplate).html();
    var template = Handlebars.compile(source);
    var context  = self.getBasicData();
    var html = template(context);
    var titleSelector = $("title");
    if( titleSelector.size() ) {
      titleTag = titleSelector[0];
      titleTag.textContent = html;
    } else {
      titleTag = document.createElement("title");
      titleTag.textContent = html;
      document.body.appendChild(titleTag);
    }
    document.title = html;
  }

  self.renderMetaDescription = function() {
    var source = $(pageMetaDescTemplate).html();
    var template = Handlebars.compile(source);
    var context  = self.getBasicData();
    var html = template(context);
    $("meta[name=description]").attr("content", html);
  }

  self.renderAnalytics = function() {
    var analytics = Resume.getPath( self.resume.jsonData, "meta.analytics.google.link", null );
    if( analytics !== null ) {
      var $script = $(document.createElement("script"));
      $script.attr("async","");
      $script.attr("src", analytics );
      $(document.body).append( $script );
    }

    var analyticsId = Resume.getPath(self.resume.jsonData, "meta.analytics.google.id", null );
    if( analyticsId !== null ) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', analyticsId);
    }
  }

  self.filterByTag = function( experienceNode ) {
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

  self.filterByDate = function( experienceNode ) {
    if( ! resumeTemplate.resume.isActiveFilterByDate ) {
      return experienceNode;
    }
    experienceNode.elements = experienceNode.elements.
    sort(
      function ( a, b ) {
        return new Date(b.startDate) - new Date( a.startDate );
      }
    ).head(self.filterDateMax);
    return experienceNode;
  }

  self.filterByRelevance = function( experienceNode ) {
    if( ! resumeTemplate.resume.isActiveFilterByRelevance ) {
      return experienceNode;
    }
    experienceNode.elements = experienceNode.elements.
    sort(
      function (a,b) {
          return b.relevance - a.relevance;
      }
    ).head(self.filterRelevanceMax).
    sort(
      function ( elementA, elementB ) {
        return  new Date( elementB.startDate ) - new Date( elementA.startDate );
      }
    );
    return experienceNode;
  }

  self.filterBySearchTerm = function( experienceNode ) {
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

  self.datesDiff = function ( dateA, dateB ) {

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

  self.jsonWorkExperiences;

  self.loadWorkExperiences = function() {
    if( self.jsonWorkExperiences !== undefined ) {
      return self.jsonWorkExperiences;
    }
    return self.jsonWorkExperiences = {
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
                  id: tag,
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

  self.jsonAcademicHistory;

  self.loadAcademicHistory = function() {
    if( self.jsonAcademicHistory !== undefined ) {
      return self.jsonAcademicHistory;
    }
    return self.jsonAcademicHistory = {
      categoryAnchor:            "academic",
      categoryTitle:             "Academic History",
      elementsTitle:             "academic histories",
      elements: Resume.getPath( self.resume.jsonData, "education", [] ).filter(
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
                  id: tag,
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

  self.jsonAcademicHistory;

  self.loadCoursesHistory = function() {
    if( self.jsonCourseHistory !== undefined ) {
      return self.jsonCourseHistory;
    }
    return self.jsonCourseHistory = {
      categoryAnchor:            "courses",
      categoryTitle:             "Courses History",
      elementsTitle:             "courses histories",
      elements: Resume.getPath( self.resume.jsonData, "education", [] ).filter(
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
                  id: tag,
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

  self.loadPapersHistory = function() {
    if( self.jsonPaperHistory !== undefined ) {
      return self.jsonPaperHistory;
    }
    return self.jsonPaperHistory = {
      categoryAnchor:            "scientific-papers",
      categoryTitle:             "Scientific Papers",
      elementsTitle:             "papers",
      elements: Resume.getPath( self.resume.jsonData, "papers", [] ).map(
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
                  id: tag,
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

  self.loadAwardsHistory = function() {
    if( self.jsonAwardsHistory !== undefined ) {
      return self.jsonAwardsHistory;
    }
    return self.jsonAwardsHistory = {
      categoryAnchor:            "awards",
      categoryTitle:             "Awards",
      elementsTitle:             "awards",
      elements: Resume.getPath( self.resume.jsonData, "awards", [] ).map(
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
                  id: tag,
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

  self.filterExperienceNode = function( fullNode ) {
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
    resumeTemplate.filterBySearchTerm( filteredNode );
    resumeTemplate.filterByRelevance( filteredNode );
    resumeTemplate.filterByDate( filteredNode );

    filteredNode.searchFilter        = self.getSearchFilter();
    filteredNode.hasElements         = fullNode.elements.length     > 0;
    filteredNode.hasVisibileElements = filteredNode.elements.length > 0;
    filteredNode.hasHiddenElements   =
      filteredNode.elements.length < fullNode.elements.length;
    filteredNode.countHidden         =
      fullNode.elements.length - filteredNode.elements.length;

    return filteredNode;
  }

  self.getWorkExperiences = function() {
    var fullNode     = resumeTemplate.loadWorkExperiences();
    return resumeTemplate.filterExperienceNode( fullNode );
  }

  self.getAcademicHistory = function() {
    var fullNode     = resumeTemplate.loadAcademicHistory();
    return resumeTemplate.filterExperienceNode( fullNode );
  }

  self.getCoursesHistory = function() {
    var fullNode     = resumeTemplate.loadCoursesHistory();
    return resumeTemplate.filterExperienceNode( fullNode );
  }

  self.getPapersHistory = function() {
    var fullNode     = resumeTemplate.loadPapersHistory();
    return resumeTemplate.filterExperienceNode( fullNode );
  }

  self.getAwardsHistory = function() {
    var fullNode     = resumeTemplate.loadAwardsHistory();
    return resumeTemplate.filterExperienceNode( fullNode );
  }

  self.getSocialNetworks = function() {
    return {
      socialNetworks: Resume.getPath( self.resume.jsonData, "basics.profiles", [] ).map(
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

  self.getTemplateBySourceId = function( sourceId ) {
    if( templates[ sourceId ] !== undefined ) {
      return template[ sourceId ];
    }
    var source = $(sourceId).html();
    var template = Handlebars.compile( source );
    template[ sourceId ] = template;
    return template;
  }

  self.getActiveTags = function() {
    return {
      tags: self.resume.activeTags
    };
  }

  self.getSearchFilter = function() {
    if( self.resume.isActiveFilterByDate ) {
      return self.resume.getFilterByDateValue();
    }
    if( self.resume.isActiveFilterByRelevance ) {
      return self.resume.getFilterByRelevanceValue();
    }
    return self.resume.getNoFilterValue();
  }

  self.isActiveFilterByRelevance = function() {
    return self.resume.isActiveFilterByDate;
  }

  self.renderTemplates = function( booOnUpdate ) {
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

  self.render = function () {
    self.renderPageTitle();
    self.renderMetaDescription();
    self.renderTemplates( false );
    self.renderAnalytics();
  }

  self.update = function() {
    self.renderTemplates( true );
  }

  self.construct = function () {
    Handlebars.registerHelper('ifCond', function(v1, v2, options) {
      if(v1 === v2) {
        return options.fn(self);
      }
      return options.inverse(self);
    });

    Handlebars.registerHelper('ifArraySize', function(v1, v2, options) {
      if(v1.length === v2) {
        return options.fn(self);
      }
      return options.inverse(self);
    });

    self.render();
  }

  self.construct();
}

function Resume() {

  var self = this;

  const database = "./assets/json/resume.json";
  self.getDatabase = function(){
    return database;
  }

  const graphElement = $("#canvas-box").get(0);

  self.jsonData = null;
  self.resumeTemplate = null;
  self.trendingTagsGraph = null;
  self.totalTagsOnMetaByScore = 5;
  self.totalTagsOnMetaLastYear = 5;

  self.loadJson = function () {
    $.getJSON(
      database,
      function( data ) {
        self.applyTemplate( data )
      }
    )
  }

  self.applyTemplate = function ( data ) {
    self.jsonData = data;
    self.trendingTagsGraph = new TrendingTagsGraph( resume, graphElement );
    self.trendingTagsGraph.renderGraph();
    self.drawKeywords();
    self.resumeTemplate = new ResumeTemplate( this );
  }

  self.drawKeywords = function() {
    $("meta[name=keywords]").attr("content",
      $("meta[name=keywords]").attr("content") + " " +
      this.trendingTagsGraph.chartData.slice(0).sort(
        (a, b) => b.totalScore - a.totalScore
      ).head( self.totalTagsOnMetaByScore ).map(
        node => node.tag
      ).concat(
        this.trendingTagsGraph.chartData.slice(0).sort(
          (a, b) => b.years.max() - a.years.max()
        ).reverse().head( self.totalTagsOnMetaLastYear ).map(
          node => node.tag
        )
      ).unique().join(" ")
    );
  }

  self.construct = function () {
    self.searchTerm = Resume.getUrlParameter( "q", "" );
    self.loadJson();
  }

  self.activeTags = [];

  self.searchTerm = "";

  /**
   * Filter the experiences to just shows
   * the most relevant ones
   */
  self.isActiveFilterByRelevance = true;

  /**
   * Filter the experiences to just shows
   * the most recent ones
   */
  self.isActiveFilterByDate = false;

  const filterByRelevanceValue = "relevants";
  self.getFilterByRelevanceValue = () => filterByRelevanceValue

  const filterByDateValue = "last";
  self.getFilterByDateValue = () => filterByDateValue

  const noFilterValue = "all";
  self.getNoFilterValue = () => noFilterValue


  /**
   * If some sort filter is being applied,
   * how many results should return max
   */
  self.filterPageSize = 5;

  self.onSelectFilterChange = function( selectElement ) {
    switch( selectElement.value ) {
      case noFilterValue:
        self.isActiveFilterByDate      = false;
        self.isActiveFilterByRelevance = false;
        break;
      case filterByDateValue:
        self.isActiveFilterByDate      = true;
        self.isActiveFilterByRelevance = false;
        break;
      case filterByRelevanceValue:
        self.isActiveFilterByDate      = false;
        self.isActiveFilterByRelevance = true;
        break;
      default:
        throw Error("Unknow selectElement.value " + selectElement.value );
    }
    self.resumeTemplate.update();
  }

  self.updateSearchTerm = function( searchElement ) {
    self.searchTerm = searchElement.value;
    self.resumeTemplate.update();
    self.trendingTagsGraph.renderGraph();
  }

  self.clickTag = function( tagId ) {
    var pos = self.activeTags.indexOf( tagId );
    if( pos != -1 ) {
      self.activeTags.splice( pos, 1 );
    } else {
      self.activeTags.push( tagId );
    }
    self.resumeTemplate.update();
    self.trendingTagsGraph.renderGraph();
  }

  self.clearFilter = function() {
    self.isActiveFilterByDate      = false;
    self.isActiveFilterByRelevance = false
    self.searchTerm                = "";
    self.resumeTemplate.update();
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

Resume.getUrlParameter = function ( sParam, notFoundValue ) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1));
  var sURLVariables = sPageURL.split('&');

  if( notFoundValue === undefined ) {
    notFoundValue = null;
  }

  var sParameterName;
  var i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
  return notFoundValue;
};

$( document ).ready(
  function() {
      window.resume = new Resume();
  }
)
