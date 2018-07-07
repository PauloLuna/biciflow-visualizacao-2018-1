var geo_ruas, acidentes, monitoramento;

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
            rua.properties.acidentes = 0;
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
            var nome = fixInconsistencies(acidente.endereco)
            index = geo_ruas.findIndex(function(logradouro){
                return logradouro.properties.logradouro_nome === nome;
            });
            
            if(index != -1){
                acidente.idx_rua = index;
                //console.log(index);
                if(parseInt(acidente.ciclista)){
                    geo_ruas[index].properties.acidentes += parseInt(acidente.ciclista);
                }                
            }

        });
        console.log("carregou");
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

carregarMonitoramento();