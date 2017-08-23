// グローバル変数定義
var svg;
var xScale;
var yScale;
var div;
var data_set_pos;
var data_set_neg;
var data_set_neu;
var title_max_length = 100;
var news_list_max = 20;

function conv_date( date_str ) {
    return moment( date_str, "YYYY/MM/DD").unix();
}

function format_unixtime( unixtime ) {
    return unixtime;
}

function clear_urls(headline) {
    var element = document.getElementById("url_area");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    var t = document.createTextNode(headline);
    element.appendChild(t);
    element.appendChild(document.createElement('br'));
}

function call_discovery_query( data, success, error ) {
// 決め打ちのenvironment_id,collection_id をパラメータに追加)
    Object.assign(data, {environment_id: 'system', collection_id: 'news'});
// API呼出し
    $.ajax({
        type: "GET", 
        url:  "/query", 
        data: data,
        success: success,
        error: error
        });
}

function get_sentiment_callback(msg) {
    console.log(msg);
    var list = msg.aggregations[0].results;
    var dataset = [];
    $.each(list,function(index,val){
        var key = val.key;
        var list2 = val.aggregations[0].results;
        var data_set2=[];
        $.each(list2,function(index2,val2){
            var format_date = format_unixtime(val2.key);
            var item2 = { date: format_date, count: val2.matching_results };
                data_set2.push(item2);
        });
        if ( key == "positive" ) {
            data_set_pos = data_set2;
        }
        if ( key == "negative" ) {
            data_set_neg = data_set2;
        }
        if ( key == "neutral" ) {
            data_set_neu = data_set2;
        }
    });
    draw_graph();
}    

function get_filter_str() {
    var start_date_str = $('#query_start_date').val();
    var end_date_str = $('#query_end_date').val();
    var start_date_iso;
    var end_date_iso;
    if ( start_date_str  ) {
        start_date_iso = new Date(start_date_str).toISOString();
    }
    if ( end_date_str  ) {
        end_date_iso = new Date(end_date_str).toISOString();    
    }
    var filter_str = "";
    if ( start_date_str ) {
        if ( end_date_str  ) {
            filter_str = "publication_date>" + start_date_iso + ",publication_date<" + end_date_iso;
        } else {
            filter_str = "publication_date>" + start_date_iso;
        }
    } else { if ( end_date_str ) {
                filter_str = "publication_date<" + end_date_iso;
            }
    }
    console.log( "filter_str: " + filter_str);
    return filter_str; 
}

function query_sentiment() {
    var data = {
        query: $('#query_key').val(),
        count: 0,
        filter: get_filter_str(),
        aggregation: "term(enriched_text.sentiment.document.label).timeslice(publication_date,1day)"
    };
    call_discovery_query( data, 
            get_sentiment_callback, 
            function(XMLHttpRequest,textStatus,errorThrown){alert('error');} );
}

function get_news_callback(msg) {
    var items = msg.results;
    var prev_title = "";
    var counter = 0;
    $.each(items,function(index,val){
        var title = val.title.substr(0, title_max_length);
        console.log( "index: " + index + "  title: " +  title + "  url: " + val.url );
        if ( title == prev_title ) {
            return true;
        }
        counter = counter + 1;
        if ( counter > news_list_max ) {
            return false;
        }
        var x = document.createElement("A");
        var t = document.createTextNode(title);
        prev_title = title;
        x.setAttribute("href", val.url);
        x.appendChild(t);
        document.getElementById("url_area").appendChild(x);
        document.getElementById("url_area").appendChild(document.createElement('br'));
    });
}

function get_news(key, date) {
    var formated_date = moment(date).format("YYYY-MM-DD");
    console.log("key: " + key + "  date: " + formated_date);
    var date1 = new Date(date);
    var date2 = new Date();
    date2.setDate(date1.getDate() + 1);
    var date1ISO = date1.toISOString();
    var date2ISO = date2.toISOString();
    var filter_str = "publication_date>" + date1ISO + ",publication_date<" + date2ISO +
        ",enriched_text.sentiment.document.label:" + key ;
    var headline = "date: " + formated_date + "   sentiment: " + key;
    console.log(filter_str);
    clear_urls(headline);
    var data = {
            query: $('#query_key').val(),
            count: 50,
            filter: filter_str,
            return: "title,url"
    };
    call_discovery_query(data, get_news_callback);
}

function draw_points(data_set, sentiment) {
    svg.selectAll("dot")
        .data(data_set)
        .enter().append("circle")
        .attr("r", 3)
        .attr("cx", function(d) { return xScale(d.date); })
        .attr("cy", function(d) { return yScale(d.count); })
        .on("click", function(d) { get_news(sentiment, d.date); })
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(moment(d.date).format("YY-MM-DD") + "<br/>"  + d.count)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
}

function draw_graph() {
    d3.select("#gr_area").selectAll("svg").remove();
    clear_urls("");
    var margin = {top: 20, right: 100, bottom: 30, left: 100},
    width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    svg = d3.select("#gr_area").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var x_max = d3.max(data_set_pos, function(d){ return d.date; });
    var x_min = d3.min(data_set_pos, function(d){ return d.date; });
    xScale = d3.scale.linear()
        .domain([x_min, x_max])
        .range([0, width]);
        
    var y_max_pos = d3.max(data_set_pos, function(d){ return d.count; });
    var y_max_neg = d3.max(data_set_neg, function(d){ return d.count; });
    var y_max = Math.max( y_max_pos, y_max_neg);
    var y_min = 0;
    yScale = d3.scale.linear()
        .domain([y_min, y_max])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(4)
        .tickFormat( function(d) { return moment(d).format("YYYY-MM-DD"); })

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")

    var line = d3.svg.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.count); });

    div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("y", -5)
        .attr("x", -100)
        .text("query: " + $('#query_key').val() ); 

    svg.append("path")
        .datum(data_set_pos)
        .attr({ class: "line", "d": line, "stroke": "blue"});
    draw_points(data_set_pos, "positive");       

    svg.append("path")
        .datum(data_set_neg)
        .attr({ class: "line", "d": line, "stroke": "red"});        
    draw_points(data_set_neg, "negative");       

    svg.append("path")
        .datum(data_set_neu)
        .attr({ class: "line", "d": line, "stroke": "yellow"});        
    draw_points(data_set_neu, "neutral");       

}
