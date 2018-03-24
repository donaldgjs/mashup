var n;
var idVideo = new Array(n);
var view = new Array(n);
var likes = new Array(n);
var dislikes = new Array(n);
var comment = new Array(n);
var text = "";
var videos = [];
var contenido = [];
var markers = [];
var map;

function tplawesome(e,t){
  res=e;
  for(var n=0;n<t.length;n++){
    res=res.replace(/\{\{(.*?)\}\}/g,
      function(e,r){
        return t[n][r]
      })
  }
  return res
}

//Funcion que realiza una busqueda a youtube con la palabra insertada
$(function() {
    $("form").on("submit", function(e) {
      text = "";
      videos = [];
      contenido = [];
       e.preventDefault();
       n = encodeURIComponent($("#num").val());
       var request = gapi.client.youtube.search.list({
            part: "id, snippet",
            type: "video",
            //location: "lat:\"19.4323396\",lng: \"-99.1337639\"",
            //locationRadius: "200",
            q: encodeURIComponent($("#search").val()).replace(/%20/g, "+"),
            maxResults: n,
            order: "viewCount",
            //publishedAfter: "2018-03-01T00:00:00Z"
       }); 
       request.execute(function(response) {
          var results = response.result;
          for (var i = 0; i < results.items.length; i++) {
            videos.push(results.items[i]);
          }
          obtenerDatos(results);
          $("#results").html("");
          var cont = 1;
          $.each(results.items, function(index, item) {
            $.get("item.html", function(data) {
              var cont = cont+1;
              if(cont == 10){
//                agregarPaginacion();
                //"title":item.snippet.title,
                $("#results").append(tplawesome(data, [{"videoid":item.id.videoId}]));
              }else{
                $("#results").append(tplawesome(data, [{"videoid":item.id.videoId}]));
              }
            });
          });
          resetVideoHeight();
       });
       $('#boton_graficar').attr('disabled',false);
    });
    $(window).on("resize", resetVideoHeight);
});

function resetVideoHeight() {
    $(".video").css("height", $("#results").width() * 9/10);
}

function init() {
    gapi.client.setApiKey("AIzaSyB02HrC6xUJYSCkBis3TNcIQGlHA5vIyt0");
    gapi.client.load("youtube", "v3", function() {
    });
}

//Obtener los datos de los videos: view, like, dislike, comment
function obtenerDatos(data){
  for (var i = 0; i < n; i++) {
    if(i != 49){
      idVideo[i] = videos[i].id.videoId;
      text += idVideo[i] + ",";
    }else{
      idVideo[i] = videos[i].id.videoId;
      text += idVideo[i];
    }
  }

  var datos = gapi.client.youtube.videos.list({
    part: "statistics, recordingDetails",
    id: text
  });

  datos.execute(function(response) {
    var results = response.result;
      for (var i = 0; i < results.items.length; i++) {
        contenido.push(results.items[i]);
              //console.log("Id Video " + results.items[i].id + " Vistas " + results.items[i].statistics.viewCount 
              //+ " likes " + results.items[i].statistics.likeCount + " Dislikes " + results.items[i].statistics.dislikeCount
              //+ " comentarios " + results.items[i].statistics.commentCount);
      }
      //console.log(contenido);
  });
  obtenerCoordenadas();
}

//librerias para charts
google.charts.load('current', {packages: ['corechart', 'bar']});
google.charts.setOnLoadCallback(drawChart);

//graficar
function drawChart() {
    $("#boton_graficar").click(function () {
      var tipo = encodeURIComponent($("#opt").val());
      var data = new google.visualization.DataTable();
      data.addColumn('string','Video');
      var estadisticas = [];

      if (tipo === "view") {
        data.addColumn('number','Vistas');
        for (var i = 0; i < videos.length; i++) {
          estadisticas[i] = new Array(videos[i].snippet.title,parseInt(contenido[i].statistics.viewCount));
        }
        data.addRows(estadisticas);
      }else
      if (tipo === "likes"){
        data.addColumn('number','Likes');
        for (var i = 0; i < videos.length; i++) {
          estadisticas[i] = new Array(videos[i].snippet.title,parseInt(contenido[i].statistics.likeCount));
        }
        data.addRows(estadisticas);
      }else
      if (tipo === "dislikes") {
        data.addColumn('number','Dislikes');
        for (var i = 0; i < videos.length; i++) {
          estadisticas[i] = new Array(videos[i].snippet.title,parseInt(contenido[i].statistics.dislikeCount));
        }
        data.addRows(estadisticas);
      }else
      if (tipo === "comment") {
        data.addColumn('number','Comment');
        for (var i = 0; i < videos.length; i++) {
          estadisticas[i] = new Array(videos[i].snippet.title,parseInt(contenido[i].statistics.commentCount));
        }
        data.addRows(estadisticas);
      }

      var opciones = {'title':'Estadisticas por Video',
              'width':270,
              'height':200
            };
      var grafica = new google.visualization.BarChart(document.getElementById('grafica'));
      grafica.draw(data,opciones);

      document.getElementById('grafica').style.visibility = "visible";
    });     
}

// Creando el mapa
function initMap(){
      var options = {
          zoom:1,
          center:{lat:18.4668,lng:-99.9495} //{lat:17.0864265,lng:-96.7861078}
        }
      map = new google.maps.Map(document.getElementById('map'), options);
}

//Agregar marcadores al mapa
function obtenerCoordenadas(data){
  for (var i = 0; i < contenido.length; i++) {
    if(contenido[i].recordingDetails.location){
      markers[i].push({
      coords:{lat:contenido[i].recordingDetails.location.latitude, lng:contenido[i].recordingDetails.location.longitude},
      content: '<h1>'+ videos[i].snippet.title +'</h1>'
    });
    }
  }

    //console.log(markers);
  addMarker(markers);
}

function addMarker(props){
        var marker = new google.maps.Marker({
          position:props.coords,
          map:map,
        });

        if(props.content){
          var infoWindow = new google.maps.InfoWindow({
            content:props.content
          });

          marker.addListener('click', function(){
            infoWindow.open(map, marker);
          });

          marker.addListener('click', function() {
            infowindow.close(map, marker);
          });
        }
}