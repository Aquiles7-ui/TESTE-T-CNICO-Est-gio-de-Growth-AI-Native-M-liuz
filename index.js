require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1. Configura a conexão com a API do Gemini usando a chave do seu arquivo .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Captura o nome do arquivo que você vai digitar no terminal
const filePath = process.argv[2];

if (!filePath) {
    console.error("Erro: Indique o arquivo CSV. Exemplo: node index.js dataset_01_parceiroA.csv");
    process.exit(1);
}

async function analisarTesteAB() {
    try {
        console.log(`Lendo o arquivo: ${filePath}...`);
        
        // Lê o conteúdo do CSV que foi passado no terminal
        const csvContent = fs.readFileSync(path.resolve(filePath), 'utf-8');

        console.log("Enviando dados para a IA analisar. Aguarde...");
        
        // Inicializa o modelo de IA
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // 3. O Prompt: A instrução rigorosa para a IA analisar os dados
        const prompt = `
        Você é um Analista de Dados Sênior. Analise o dataset de teste A/B de cashback em CSV abaixo.
        Responda à pergunta: "Dado esse teste A/B, qual variante de cashback devemos escalar pra 100% do tráfego?".
        Compare as taxas de conversão (compradores / grupos de usuários, etc) e os lucros.
        
        Retorne a resposta EXATAMENTE neste formato JSON, sem formatação markdown ou textos adicionais:
        {
          "nome_do_teste": "Teste ${path.basename(filePath)}",
          "descricao": "Resumo do que foi testado e os grupos",
          "resultado": "Principais métricas observadas e qual variante venceu",
          "decisao_tomada": "Sua recomendação clara do que fazer com o tráfego"
        }
        
        Dataset:
        ${csvContent}
        `;

        // Envia o prompt e aguarda a resposta
        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();
        
        // Limpa possíveis formatações markdown (```json) que a IA possa enviar por engano
        if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        // Converte o texto JSON que a IA devolveu em um objeto JavaScript real
        const analise = JSON.parse(responseText);

        console.log("✔ Análise concluída com sucesso!");
        
        // 4. Manda os dados para a função que vai salvar no arquivo consolidado
        salvarNoPlanilhaCSV(analise);

    } catch (error) {
        console.error("Ocorreu um erro durante o processamento:", error);
    }
}

// 5. Função para criar e atualizar a planilha final
function salvarNoPlanilhaCSV(dados) {
    const outputFilePath = 'resultados_consolidados.csv';
    const fileExists = fs.existsSync(outputFilePath);

    // Se o arquivo não existir ainda, cria ele e coloca o cabeçalho
    if (!fileExists) {
        fs.writeFileSync(outputFilePath, "Nome do Teste;Descricao;Resultado;Decisao Tomada\n");
    }

    // Formata a nova linha. Usamos replace para evitar que vírgulas no texto quebrem as colunas do CSV
    const linha = `${dados.nome_do_teste};"${dados.descricao.replace(/"/g, '""')}";"${dados.resultado.replace(/"/g, '""')}";"${dados.decisao_tomada.replace(/"/g, '""')}"\n`;

    // Adiciona a linha no final do arquivo sem apagar o que já tem lá
    fs.appendFileSync(outputFilePath, linha);
    console.log(`✔ Resultado registrado na planilha: ${outputFilePath}\n`);
}

// Executa o script
analisarTesteAB();