# Proposta do projeto
## Motivação e idéia
Todo grupo participou ou participa de um projeto anterior com intuito de melhorar a mobilidade dos ciclistas. A ideia no projeto da cadeira é criar uma visualização que relacione os acidentes de trânsito envolvendo ciclistas, com a existência de ciclovias ou ciclofaixas e a velocidade média dos veículos na via. Desta forma poderíamos inferir vias com potêncial para receber ciclofaixas e afins.

## Datasets usados
Para obtermos os dados necessários para esta visualização, seria necessário cruzar as informações contidas nos quatro datasets abaixo:

* Geojson com dados das ciclovias e ciclofaixas da cidade do recife: http://dados.recife.pe.gov.br/dataset/ciclovias-ciclofaixas-estacoes-de-aluguel-de-bikes-e-rotas
* Dados de acidentes de trânsito com ou sem vítimas, detalhando se havia ciclista envolvido: http://dados.recife.pe.gov.br/dataset/acidentes-de-transito-com-e-sem-vitimas/resource/1eed10b9-fe8a-4e5a-86cf-ad0353f05682
* Dados de quantidade de veículos por faixa de velocidade na via, por hora: 
http://dados.recife.pe.gov.br/dataset/fluxo-de-veiculo-por-hora
* Dados geográficos de localização dos semáforos, utilizado para localizar as vias do dataset anterior: http://dados.recife.pe.gov.br/dataset/localizacao-dos-semaforos
