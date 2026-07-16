# Processo do Projeto (BizDev e DevOps) — AgroGlobe

Este documento atualiza a descrição do processo apresentada na Entrega 1, refletindo como o processo tem sido executado na prática e incorporando as novas formas de lidar com requisitos e arquitetura adotadas na Entrega 2.

## 1. Modelo de processo

A equipe segue usando Kanban para acompanhar as tarefas e Gitflow para o versionamento, com uma branch por funcionalidade. A diferença é que agora todo o processo acontece dentro do GitHub: o quadro Kanban é o GitHub Project, cada tarefa nasce como uma issue e todo código entra na branch principal por meio de Pull Request, com revisão de um colega e verificação automática antes do merge.

## 2. Requisitos

Na Entrega 1 os requisitos eram tratados de forma informal. Agora eles são elicitados e registrados de maneira rastreável. Usamos as técnicas de Jornada do Usuário e Benchmarking, cujos registros foram versionados no repositório.

Os requisitos são organizados como issues em três níveis: épicos (blocos maiores de valor, como Integração Globo–Planejador e Simulador de Cultura), histórias de usuário (recortes entregáveis, como Recomendação de Cultura e Configuração do Grid) e sub-issues ligadas ao épico correspondente. As issues recebem labels que indicam a qual avaliação pertencem, e a primeira coluna do quadro é ordenada por valor, deixando no topo o que deve ser feito primeiro.

## 3. Arquitetura

Antes a arquitetura estava apenas implícita no código. Na Entrega 2 ela passou a ser documentada. O README ganhou uma seção descrevendo o estilo do sistema (um monólito modular em Next.js, organizado em camadas) e os diagramas C4 de contexto, containers e componentes. Também foi aplicado um padrão de projeto, o Adapter, que unifica o acesso às fontes externas de dados (Open-Meteo, SoilGrids e Nominatim) sob uma única interface, isolando o resto do sistema das diferenças entre essas APIs.

## 4. Fluxo de trabalho

O caminho de um requisito até a entrega ficou assim: o requisito é registrado como issue e priorizado no quadro; ao ser iniciado, cria-se uma branch para ele; o desenvolvimento inclui a identificação de anomalias no código, a refatoração quando necessário e os testes; abre-se um Pull Request ligado à issue; um colega revisa e a verificação automática (lint, build e testes) precisa passar; aprovado, o código é integrado à branch principal e a issue é fechada.

## 5. Atividades fundamentais e guarda-chuva

Atividades fundamentais:

1. Identificação do problema e definição do escopo
2. Definição das funcionalidades principais (globo interativo e cost planner)
3. Desenvolvimento do globo interativo com informações de clima e solo
4. Integração com fontes externas de dados
5. Desenvolvimento do cost planner com entrada de cultura, área e moeda
6. Implementação das etapas de preparação do solo, cultivo e colheita
7. Lógica de cálculo de custos
8. Geração de gráficos
9. Exportação em PDF
10. Recomendação de cultura por solo e clima
11. Integração entre o globo e o planejador
12. Mapa de plantio com grid interativo

Atividades guarda-chuva:

1. Organização das tarefas no Kanban
2. Controle de versão com Gitflow
3. Integração entre frontend e backend
4. Testes das funcionalidades
5. Correção de bugs e ajustes
6. Documentação do projeto, incluindo requisitos e arquitetura
7. Revisão de código e verificação automática a cada Pull Request

## 6. Principais artefatos

Quadro Kanban no GitHub Project, repositório Git com branches por funcionalidade, código-fonte do sistema, as interfaces do globo e do planejador, integração com as APIs de clima e solo, gráficos de custos e PDFs gerados, documentos de elicitação de requisitos, backlog de requisitos em forma de issues, documentação de arquitetura no README e a suíte de testes automatizados.

## 7. Situação atual e próximos passos

Hoje o processo cobre requisitos, arquitetura e um fluxo de integração com revisão, tratamento de anomalias, refatoração e testes automatizados a cada mudança. Entre as anomalias tratadas até agora estão método longo, código duplicado e lista longa de parâmetros. A persistência ainda é feita apenas no navegador, sem autenticação nem banco de dados, e a cobertura de testes é parcial.

Para as próximas entregas, a ideia é fechar os épicos ainda abertos de autenticação e persistência de dados, concluir o simulador com os estágios de crescimento, reaproveitar os adaptadores também na recomendação de cultura, ampliar os testes e manter o código mais organizado por meio de refatorações pontuais.

## 8. Retrospectiva

Levar o processo para dentro do GitHub deu rastreabilidade do requisito até o merge, e a exigência de revisão e verificação automática antes de integrar ajudou a manter a qualidade e evitar regressões. A documentação da arquitetura e o uso do padrão Adapter deixaram o sistema mais fácil de evoluir, e a divisão do trabalho permitiu tocar features, refatoração e documentação em paralelo.

Com a prática de observar anomalias no código e tratá-las antes de fechar as entregas, o processo ficou mais cuidadoso e ajudou a reduzir retrabalho. Nesse caminho, também foram incluídos testes por particionamento em classes de equivalência e por análise de valor limite, aplicados em classifyTexture, suitability e useCropGrid. Por outro lado, alguns itens ficaram abertos ao fim da entrega, o que mostra que o escopo foi um pouco otimista e que precisamos melhorar a estimativa e a priorização. Também faltou padronizar critérios de conclusão das tarefas, e a cobertura de testes ainda é desigual entre as partes do sistema.
