var x_acidentes;
var acidentesRua, acidentesNatureza, acidentesHoraDia;
var acidentesPorRua, acidentesPorNatureza, acidentesPorHoraDia;
var heatMap, pie, layerGroup = L.layerGroup();
var days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]

function iniciarCrossfilter(){
    x_acidentes = crossfilter(acidentes);
    criarDimensoes();
    x_acidentes.onChange(onAcidentesChange);
}

function criarDimensoes(){
    tp = d3.timeParse('%Y-%m-%d-%H:%M');
    acidentesRua = x_acidentes.dimension( d => d.endereco);
    acidentesNatureza = x_acidentes.dimension( d => d.natureza);
    acidentesHoraDia = x_acidentes.dimension(function(d){
        dia =  tp(d.data+"-"+d.hora);
        dia = dia ? dia : tp('07-01-90-05:00');
        return [dia.getDay(), dia.getHours()];
    });
    
    criarFiltros();
}

function criarFiltros(){
    acidentesPorRua = acidentesRua.group().reduceSum(d => 1);

    acidentesPorHoraDia = acidentesHoraDia.group().reduceSum( d => 1);

    acidentesPorNatureza = acidentesNatureza.group().reduceSum( d => 1);

    criarGraficos();
}

function criarGraficos(){
    pie = dc.pieChart('#top4');
    pie.radius(100).width(350).height(250).cx(250).cy(100)
        .dimension(acidentesNatureza)
        .group(acidentesPorNatureza)
        .legend(dc.legend());
    heatMap = dc.heatMap("#test");
    heatMap
    .width(20 * 24 + 80)
    .height(20 * 7 + 40)
    .dimension(acidentesHoraDia)
    .group(acidentesPorHoraDia)    
    .keyAccessor(function(d) { return + d.key[1]; })
    .valueAccessor(function(d) { return + d.key[0]; })
    .colorAccessor(function(d) { return +d.value; })
    .title(function(d) {
        return "Dia:   " + days[d.key[0]] + "\n" +
               "Hora:  " + d.key[1] + "\n" +
               "Acidentes: " + ( d.value) ;})
    .colors(['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'])
    .calculateColorDomain();

    

    dc.renderAll();
    desenharMapa();
}

function onAcidentesChange(){
    heatMap.calculateColorDomain();
    desenharMapa();
}

function desenharMapa(){
    var cs = heatMap.colors();

    layerGroup.eachLayer( d=> mymap.removeLayer(d));
    mymap.removeLayer(layerGroup);
    layerGroup.clearLayers();
    acidentesPorRua.all().forEach(function(d){
        var tmp = dict_ruas[d.key];
        if(tmp){
            var feature = L.geoJSON(tmp.geometry, { style: {color: cs(d.value)}});
            feature.bindPopup('<p>' + tmp.properties.logradouro_nome + '<br/> Acidentes: ' + d.value + '</p>');
            layerGroup.addLayer(feature);
        }        
    });
    layerGroup.addTo(mymap);
}

