var x_acidentes;
var acidentesRua, acidentesNatureza, acidentesHoraDia, fluxoHoraDia, fluxoRua;
var acidentesPorRua, acidentesPorNatureza, acidentesPorHoraDia, fluxoPorHoraDia;
var heatMap, pie, fluxoHM, layerGroup = L.layerGroup();
var days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
var manter_mapa = false;

function iniciarCrossfilter(){
    x_acidentes = crossfilter(acidentes);
    x_fluxo = crossfilter(fluxoVias);
    criarDimensoes();
    x_acidentes.onChange(onAcidentesChange);
}

function criarDimensoes(){
    var tp = d3.timeParse('%Y-%m-%d-%H:%M');
    var tp2 = d3.timeParse('%Y/%m/%d %H:%M');
    acidentesRua = x_acidentes.dimension( d => d.endereco);
    acidentesNatureza = x_acidentes.dimension( d => d.natureza);
    acidentesHoraDia = x_acidentes.dimension(function(d){
        dia =  tp(d.data+"-"+d.hora);
        dia = dia ? dia : tp('07-01-90-05:00');
        return [dia.getDay(), dia.getHours()];
    });

    fluxoHoraDia = x_fluxo.dimension(function(d){
        dia =  tp2(d.DataHoraRegistro);
        dia = dia ? dia : tp('07-01-90-05:00');
        return [dia.getDay(), dia.getHours()];
    });

    fluxoRua = x_fluxo.dimension( d => d.CodEquipamento)
    
    criarFiltros();
}

function criarFiltros(){
    acidentesPorRua = acidentesRua.group().reduceSum(d => 1);

    acidentesPorHoraDia = acidentesHoraDia.group().reduceSum( d => 1);

    acidentesPorNatureza = acidentesNatureza.group().reduceSum( d => 1);

    fluxoPorHoraDia = fluxoHoraDia.group().reduceSum( d => d.Contagem_15Min);

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
               "Hora:  " + d.key[1] + "hs\n" +
               "Acidentes: " + ( d.value) ;})
    .colors(['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'])
    .calculateColorDomain();

    fluxoHM = dc.heatMap("#fluxo");
    fluxoHM
    .width(20 * 24 + 80)
    .height(20 * 7 + 40)
    .dimension(fluxoHoraDia)
    .group(fluxoPorHoraDia)    
    .keyAccessor(function(d) { return + d.key[1]; })
    .valueAccessor(function(d) { return + d.key[0]; })
    .colorAccessor(function(d) { return +d.value; })
    .title(function(d) {
        return "Dia:   " + days[d.key[0]] + "\n" +
               "Hora:  " + d.key[1] + "hs\n" +
               "Fluxo: " + ( d.value) ;})
    .colors(['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'])
    .calculateColorDomain();

    

    dc.renderAll();
    desenharMapa();
}

function onAcidentesChange(){
    heatMap.calculateColorDomain();
    if(manter_mapa){
        manter_mapa = false;
    } else {
        desenharMapa();        
    }
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
            feature.bindPopup('<p>' + tmp.properties.logradouro_nome + '<br/> Acidentes: ' + d.value + '</p>')
            .on({
                popupopen: function(){
                    console.log(tmp.properties.logradouro_nome+" "+tmp.properties.monitor);
                    manter_mapa = true;
                    acidentesRua.filter(tmp.properties.logradouro_nome);
                    fluxoRua.filter(tmp.properties.monitor);
                    fluxoHM.calculateColorDomain();
                    dc.redrawAll();
                },
                popupclose: function(){
                    //console.log(tmp.properties.logradouro_nome+" "+tmp.properties.monitor);
                    acidentesRua.filterAll();
                    fluxoRua.filterAll();
                    fluxoHM.calculateColorDomain();
                    dc.redrawAll();
                }
            });
            layerGroup.addLayer(feature);
        }        
    });
    layerGroup.addTo(mymap);
}

