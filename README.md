1. Arquitetura da Solução
Para resolver o desafio de forma automatizada e escalável, desenvolvi uma solução baseada em Node.js. A arquitetura segue o modelo de Interface de Linha de Comando (CLI), permitindo o processamento de qualquer dataset de teste A/B sem a necessidade de alterar o código-fonte.

O fluxo de funcionamento é:

Ingestão Dinâmica: O script recebe o caminho do dataset (CSV) via argumento no terminal.

Orquestração: O conteúdo do CSV é lido e enviado via API para um LLM (neste caso, a API do Google Gemini).

Engenharia de Prompt: Desenvolvi um System Prompt que atua como um Analista de Dados. Ele força a IA a processar as métricas de conversão e devolver exclusivamente um objeto JSON contendo a decisão de qual variante escalar e o porquê.

Armazenamento: O script intercepta o JSON gerado e faz o append (adição) automático em um arquivo resultados_consolidados.csv (formato de banco de dados para exportação direta ao Google Sheets).

https://docs.google.com/spreadsheets/d/1_Pfa5ZIoHDdNtARnDvwxgyP_dzVoeONzL18fTTHe42M/edit?usp=sharing
