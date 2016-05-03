// Function to compare float values in an array for sorting 
// a and b are object elements of your array
function valueComparator(a,b) {
  return -(parseFloat(a.value) - parseFloat(b.value));
}

function GetDataArrayFromTable(chartType, seriesInCols ) {
  var $table = $('table');
  
  var $rows = $table.find('tbody tr');
  var $series=[], $serieCells=[], $dataCells, $data = [], dataHeadersCount = 1;
  
  //Get/Set default params
  chartType = chartType == undefined ? 'line' : chartType;
  seriesInCols = seriesInCols == undefined ? true : seriesInCols;
  
  if (seriesInCols) {
    // Count dataheaders: number of th in first data row
    dataHeadersCount = ($table.find('tbody tr:first-child > th').length > 0) ? $table.find('tbody tr:first-child > th').length : 1;
    
    $serieCells = $table.find('thead tr th').slice(dataHeadersCount);
    
    $dataLabels = $table.find('tbody tr > *:nth-child(' + dataHeadersCount + ')');
  } else {
    $serieCells = $table.find('tbody tr th, tbody tr td:first-child');
    $dataLabels = $table.find('thead tr th').not(':first');
  }
  
  //Parse data by looping series
  $serieCells.each(function (i, item) {
    serieName = $.trim($(this).text());
    
    //reset data array
    $data = [];
    var groupId = '', groupLabel = '', groupTotal = 0;
    
    //Get data cells NB nth-child is base 1
    if (seriesInCols) {
      nthChildIndex = dataHeadersCount + i + 1;
      
      $dataCells = $table.find('tbody tr > *:nth-child(' + nthChildIndex + ')');
    } else {
      nthChildIndex = i + 1;
      $dataCells = $table.find('tbody tr:nth-child(' + nthChildIndex + ') > td').not(':nth-child(' + dataHeadersCount + ')');
    }
    
    //console.log($dataCells);
     
    //parse data
    $dataCells.each(function (j, dataCell) {
      dataValue = (parseFloat($(this).text().replace(',', '.')).toString() === 'NaN') ? null: parseFloat($(this).text().replace(',', '.'));
      
      if(dataHeadersCount == 1) {
        dataLabel = $.trim($dataLabels[j].textContent);
        
        $data.push( 
        { 
          name: dataLabel,
          value: dataValue
        });
      } else {
        
        dataLabel = $.trim($(this).siblings('*')[0].textContent);
        // First group??
        if( groupId == '' ) {
            groupId = $($(this).siblings('*')[0]).attr('id');
            groupLabel = dataLabel;
        }
        
        //Push value
        $data.push( 
        { 
          name: groupLabel + ' || ' + $.trim($dataLabels[j].textContent),
          value: dataValue,
          parent: groupId
        });
                        
        if(dataLabel == groupLabel) {
            groupTotal = groupTotal + dataValue;
            
        } else {
            
            //Push group data if available
            //if( groupLabel != '' ){
                $data.push( 
                { 
                  id: groupId,
                  name: groupLabel,
                  value: groupTotal
                });
            //}
            //Set the new group Label and Total
            groupId = $($(this).siblings('*')[0]).attr('id');
            groupLabel = dataLabel;
            groupTotal = dataValue;
        }
      }
    }); // each datacell
    
    //Push last group
    if(dataHeadersCount > 1) {
        $data.push( 
            { id: groupId,
              name: groupLabel,
              value: groupTotal
            });
        }
        
    //console.log($data);
    
    $series.push( 
    {
      name: serieName,
      data: $data 
    });
    console.log($series[$series.length-1]);
    
  });
  
   return $series;
}

$(document).ready( function() {

var $series = GetDataArrayFromTable('treemap', true);

dataArr.sort(valueComparator);

var topCount = 6;
var sumOther = 0;
var treemapItems = [];

$.each(dataArr, function(i,item) {
  if(i < topCount) {
    treemapItems.push(
      { 
        name: item.name,
        value: item.value
      }
    );
  };
  
  if(i >= topCount) {
    sumOther += item.value;
    
    treemapItems.push(
      { 
        name: item.name,
        value: item.value,
        parent: 'Other'
      }
    );
    
  }
  
});

treemapItems.push(
  { 
    id: 'Other',
    name: 'Overig...',
    value: sumOther,
    selected: false
  }
);

 $(function() {
  
  Highcharts.setOptions({
        lang: {
            thousandsSep: '.'
        },
        // orange: '#e17000', '#f6d4b2', '#fbead9'  rgba(225,112,0,1)
        colors: ['rgba(225,112,0,1)', 'rgba(225,112,0,0.9)', 'rgba(225,112,0,0.8)', 'rgba(225,112,0,0.7)', 'rgba(225,112,0,0.6)']
        //'#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4']
    });
    
  $('#container').highcharts({
      //colorAxis: {
      //      minColor: '#ff0000',
      //      maxColor: 'rgba(255,0,0,0.2)' //Highcharts.getOptions().colors[0]
      //  },

    tooltip: {
        pointFormat: '{point.name}: <b>{point.value}</b> kg {point.colorValue}'
    },
    series: [{
      type: "treemap",
      colorByPoint: true,
      allowDrillToNode: true,
      layoutAlgorithm: 'sliceAndDice', //'stripes',
      alternateStartingDirection: true,
      dataLabels: {
          enabled: false
      },
      levelIsConstant: false,
      levels: [{
        level: 1,
        //layoutAlgorithm: 'squarified  ',
        dataLabels: {
          enabled: true,
          align: 'left',
          verticalAlign: 'top',
          style: {
            fontSize: '15px',
            fontWeight: 'normal'
          }
        }
      },
      {
        level: 2,
        //layoutAlgorithm: 'sliceAndDice',
        dataLabels: {
          enabled: false,
          align: 'left',
          verticalAlign: 'top',
          style: {
            fontSize: '12px',
            fontWeight: 'normal'
          }
        }
      }],
      data: $series[0].data
    }],
    title: {
      text: 'Ammoniak uitstoot per subdoelgroep'
    }
  });
});
});