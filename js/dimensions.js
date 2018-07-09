var x_acidentes;
var acidentesRua, acidentesDiaDaSemana, acidentesHoraDoDia, acidentesNatureza, acidentesDate;
var acidentesCiclistaPorRua, acidentesPorNatureza, acidentesPorTime;

function iniciarCrossfilter(){
    x_acidentes = crossfilter(acidentes);
    
    criarDimensoes();
}

function criarDimensoes(){
    tp = d3.timeParse('%Y-%m-%d-%H:%M');
    acidentesRua = x_acidentes.dimension( d => d.endereco);
    acidentesDiaDaSemana = x_acidentes.dimension(function(d){
        dia =  tp(d.data+"-"+d.hora)
        return dia ? dia.getDay() : 8;
    });
    acidentesHoraDoDia = x_acidentes.dimension(function(d){
        dia =  tp(d.data+"-"+d.hora)
        return dia ? dia.getHours() : 0;
    });
    acidentesNatureza = x_acidentes.dimension( d => d.natureza);
    acidentesDate = x_acidentes.dimension(function(d){
        dia =  tp(d.data+"-"+d.hora);
        console.log(dia);
        dia = dia ? dia : tp('07-01-90-05:00');
        return [dia.getDay(), dia.getHours()];
    });
    
    criarFiltros();
}

function criarFiltros(){
    acidentesCiclistaPorRua = acidentesRua.group().reduceSum(function(d){
        if(parseInt(d.ciclista)){
            return parseInt(d.ciclista);
        } else {
            return 0;
        }
    });

    acidentesCiclistaPorTime = acidentesDate.group().reduceSum( d => 1);

    acidentesPorNatureza = acidentesNatureza.group().reduceSum( d => 1);

    criarGraficos();
}

function criarGraficos(){
    var top4 = dc.pieChart('#top4');
    top4.radius(200).width(400).height(400).dimension(acidentesNatureza).group(acidentesPorNatureza);
    var heatMap = dc.heatMap("#test");
    heatMap
    .width(45 * 20 + 80)
    .height(45 * 5 + 40)
    .dimension(acidentesDate)
    .group(acidentesCiclistaPorTime)    
    .keyAccessor(function(d) { return +d.key[1]; })
    .valueAccessor(function(d) { return +d.key[0]; })
    .colorAccessor(function(d) { return +d.value; })
    .title(function(d) {
        return "Dia:   " + d.key[0] + "\n" +
               "Hora:  " + d.key[1] + "\n" +
               "Acidentes: " + ( d.value) ;})
    .colors(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"])
    .calculateColorDomain();

    dc.renderAll();
}