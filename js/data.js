var geo_ruas, dict_ruas = {}, acidentes, monitoramento, mymap;

function fixInconsistencies (text)
{     
    if(text){
        text = text.toUpperCase();                                                         
        text = text.replace(new RegExp('[ÁÀÂÃ]','gi'), 'A');
        text = text.replace(new RegExp('[ÉÈÊ]','gi'), 'E');
        text = text.replace(new RegExp('[ÍÌÎ]','gi'), 'I');
        text = text.replace(new RegExp('[ÓÒÔÕ]','gi'), 'O');
        text = text.replace(new RegExp('[ÚÙÛ]','gi'), 'U');
        text = text.replace(new RegExp('[Ç]','gi'), 'C');
        text = text.replace("AVENIDA", "AV");
        text = text.replace("CONSELHEIRO", "CONS");
        text = text.replace("CAIS", "C");
        text = text.replace("VIADUTO", "VDO");
        text = text.replace("AV SUL", "AV SUL GOV. CID SAMPAIO");
        text = text.replace("LGO ENCRUZILHADA", "PRC  LARGO DA ENCRUZILHADA");
        text = text.replace("PTE  JOAQUIM CARDOSO", "PTE  JOAQUIM CARDOZO");
        text = text.replace("EST DAS UBAIAS,", "EST DAS UBAIAS");
        text = text.replace("AV NORTE", "AV NORTE MIGUEL ARRAES DE ALENCAR");
        text = text.replace("JOAO CABRAL DE MELO NETO", "JOAO CABRAL DE M. NETO");
        text = text.replace("AV FREI MATIAS TEVIS", "RUA FREI MATIAS TEVIS");
        text = text.replace("RUA AURORA", "RUA DA AURORA");
        text = text.replace("RUA PROFESSOR JOAO MEDEIROS", "AV PROFESSOR JOAO MEDEIROS");
        text = text.replace("RUA SPORT CLUBE DO RECIFE", "AV SPORT CLUBE DO RECIFE");
        text = text.replace("RUA BELMIRO CORREIA", "RUA BELMIRO CORREA");
        text = text.replace(new RegExp('  ','gi'), " ");
    }    
    return text;
}

function fixSpaces(text){
    if(text){
        text = text.replace(new RegExp('  ','gi'), " ");
    }    
    return text;
}



function carregarRuas(){
    console.log("algo passou")
    d3.json("data/trechoslogradouros.geojson")
    .then(function(data){
        geo_ruas = data.features;
        geo_ruas.forEach(function(rua){
            rua.properties.logradouro_nome = fixSpaces(rua.properties.logradouro_nome);
            dict_ruas[rua.properties.logradouro_nome] = rua;
            monitor = monitoramento.find(function(data){
                return data.local === rua.properties.logradouro_nome;
            });
            if(monitor){
                rua.properties.monitor = monitor.CODIGO;
            }
        });
        carregarAcidentes();        
    });
}

function carregarAcidentes(){
    d3.dsv(';',"data/acidentes2017.csv", function(d){
        return d
        
    }).then(function(data){
        acidentes = data;
        acidentes.forEach(function(acidente){
            acidentes.endereco = fixInconsistencies(acidente.endereco);
        });
        console.log("carregou");
        iniciarCrossfilter();
        console.log("crossfilter criado");
        
    });
}


function carregarMonitoramento(){
    console.log("algo passou")
    d3.dsv(';',"data/vias-monitoramento.csv")
    .then(function(data){
        monitoramento = data;
        carregarRuas();        
    });
}

mymap = L.map('mapid').setView([ -8.143124147416117, -34.918079076096383 ], 13);
  
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
}).addTo(mymap);
  
//dc.config.defaultColors(dc.config.newScheme);
carregarMonitoramento();

