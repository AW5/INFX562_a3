

/*var margin = { top: 50, right: 0, bottom: 100, left: 230 },
    width = 84 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

var svg = d3.select("#chart").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");*/
var dataset
var dataset_backup
var dataset_temp

var text= d3.select("#story").append("div")
    .attr("class","text")
    .attr("cy",5)
    .style("font-size","16px")
    .style("fill","steel blue");

console.log(document.getElementById("testPanel1"));

var parcoords = d3.parcoords()("#example")
  .alpha(0.1)
  .mode("queue") // progressive rendering
  .height(310)
  .margin({
    top: 36,
    left: 0,
    right: 0,
    bottom: 36
  })
  ;

// load csv file and create the chart
d3.csv('data/database_re.csv', function(data) {
//process time
//var parseTimeM = d3.time.format("%B").parse; 
//var formatDate = d3.time.format("%b-%Y");

  data.forEach(function(d,i){
     // d.Month_a=formatDate(parseTimeM(d.Month));
      delete d["Victim Count"];
      delete d["Perpetrator Count"];
      if(d["Victim Age"]=="998"){d["Victim Age"]=="0"};
  })
//Get the dataset out of this function
  dataset=data;
  dataset_backup=data;
  dataset_temp=data;

//max of different variables for sliders
  var maxYear = d3.max(dataset.map(function(d) {return d.Year;}));
  var minYear = d3.min(dataset_temp.map(function(d) {return d.Year;}));

//Create handler                 
  var maxAssists=maxYear;
  var minAssists=minYear;

  $(function() {
  $( "#assists" ).slider({
  range: true,
  min: 1950,
  max: maxAssists,
  values: [ 1950, maxAssists ],
  slide: function( event, ui ) {
  $( "#assistamount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
  filterAssists(ui.values);
  } //end slide function
  }); //end slider
  $( "#assistamount" ).val( $( "#assists" ).slider( "values", 0 ) +
  " - " + $( "#assists" ).slider( "values", 1 ) );
}); //end function

 // drawVis(data);

});

// Dropdown List
var patt = new RegExp("All");
//For Victim Race
function filterType(mtype) {
  
  var res = patt.test(mtype);
  if(res){ dataset = dataset;
}else{
  
  dataset = dataset.filter(function(d) {
  return d['Victim Race'] == mtype;
  });

  }
}
//Filter For Agency Type
function filterAgencyType(mtype) {
  
  var res = patt.test(mtype);
  if(res){ dataset = dataset;
}else{
  
  dataset = dataset.filter(function(d) {
  return d['Agency Type'] == mtype;
  });

  }
}

//Filter For Gender
function filterGender(mtype) {
  
  var res = patt.test(mtype);
  if(res){ dataset = dataset;
}else{
  
  dataset = dataset.filter(function(d) {
  return d['Victim Sex'] == mtype;
  });

}
console.log(mtype);
}

// Function to be called to generate vis
function drawFinalVis(){
  
  drawVis(dataset);
  
}

// Function to be called to generate color vis
function drawFinalRecolorVis(){
  
  recolorVis(dataset);
  
}

//Creating assisting bar
function filterAssists(values){
  
  var toVisualize = dataset.filter(function(d) {
  return d['Year'] >= values[0] && d['Year'] < values[1]
  });


  updateVis(toVisualize);

}

var dataset_new;
//Update Function
function updateVis(dataset){
  
//Check if "All" is chosed here
  var mytype=document.getElementById("myselectform").value;
  var mytype2=document.getElementById("myselectform2").value;
  var mytype3=document.getElementById("myselectform3").value;
  if(mytype=="All"){
    drawVis(dataset);}else{
    dataset_new=dataset.filter(function(d){
    return d['Victim Race']==mytype;
  });
    drawVis(dataset_new);
  }
 
}

//Recolor Vis

function recolorVis(data){

   //Draw the coordinates
  parcoords
    .data(data)
    .hideAxis(["State","City","Victim Race","Victim Sex","Perpetrator Sex","Perpetrator Race","Agency Type"])
    .render()
    .reorderable()
    .brushMode("1D-axes")
    .color(function(d) {
        // d corresponds to the individual data object
        if (d["Victim Sex"] == "Male"){return "green";}
            
        else{if(d["Victim Sex"] == "Female"){
          return "red";
        }else{
          return "Grey";
        }
      }
            
    });
   slik(data); 

}

//For the grid

function drawVis(data){
  //Draw the coordinates
    

  parcoords
    .data(data)
    .hideAxis(["State","City","Victim Race","Victim Sex","Perpetrator Sex","Perpetrator Race","Agency Type"])
    .render()
    .reorderable()
    .brushMode("1D-axes")
    .color("#069")
    ;


    slik(data);
   data_temp=dataset;
   dataset=dataset_backup;


}

// Call by button to reset
function reset(){

  dataset=dataset_backup;
  console.log(dataset_backup);
}

//Grid data
function slik(data){
  // slickgrid needs each data element to have an id
  data.forEach(function(d,i) { d.id = d.id || i; });
  
  // setting up grid
  var column_keys = d3.keys(data[0]);
  var columns = column_keys.map(function(key,i) {
    return {
      id: key,
      name: key,
      field: key,
      sortable: true
    }
  });

  var options = {
    enableCellNavigation: true,
    enableColumnReorder: false,
    multiColumnSort: false
  };

  var dataView = new Slick.Data.DataView();
  var grid = new Slick.Grid("#grid", dataView, columns, options);
  var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));

  // wire up model events to drive the grid
  dataView.onRowCountChanged.subscribe(function (e, args) {
    grid.updateRowCount();
    grid.render();
  });

  dataView.onRowsChanged.subscribe(function (e, args) {
    grid.invalidateRows(args.rows);
    grid.render();
  });

  // column sorting
  var sortcol = column_keys[0];
  var sortdir = 1;

  function comparer(a, b) {
    var x = a[sortcol], y = b[sortcol];
    return (x == y ? 0 : (x > y ? 1 : -1));
  }
  
  // click header to sort grid column
  grid.onSort.subscribe(function (e, args) {
    sortdir = args.sortAsc ? 1 : -1;
    sortcol = args.sortCol.field;

    if ($.browser.msie && $.browser.version <= 8) {
      dataView.fastSort(sortcol, args.sortAsc);
    } else {
      dataView.sort(comparer, args.sortAsc);
    }
  });

  // highlight row in chart
  grid.onMouseEnter.subscribe(function(e,args) {
    var i = grid.getCellFromEvent(e).row;
    var d = parcoords.brushed() || data;
    parcoords.highlight([d[i]]);
    text.html("Story of This Homicide Case: One or more "+d[i]["Victim Sex"]+" were killed by a "+d[i]["Perpetrator Sex"]+" at the age of "+d[i]["Victim Age"]+" with "+d[i]["Weapon"]+" in "+d[i]["Month"]+", "+d[i]["Year"]+" in "+d[i]["State"]);
  });
  grid.onMouseLeave.subscribe(function(e,args) {
    parcoords.unhighlight();
  });

  // fill grid with data
  gridUpdate(data);

  // update grid on brush
  parcoords.on("brush", function(d) {
    gridUpdate(d);
  });

  function gridUpdate(data) {
    dataView.beginUpdate();
    dataView.setItems(data);
    dataView.endUpdate();
  };

  /*function recolor() {
    parcoords.color(function(d) {
    // d corresponds to the individual data object
    if (d["Victime Sex"] == "Male")
        return "red";
    else
        return "green";
});

}*/
}