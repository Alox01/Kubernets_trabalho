// Importa a biblioteca Express que é usada para criar servidores web
const express = require('express');

// Importa a biblioteca prom-client que é a ferramenta para criar métricas do Prometheus
const client = require('prom-client');

// Inicia a aplicação Express
const app = express();

// Pega a função de coletar métricas padrão
const collectDefaultMetrics = client.collectDefaultMetrics;

// Executa a função para que as métricas padrão comecem a ser coletadas
collectDefaultMetrics();

// --- MÉTRICAS CUSTOMIZADAS ---

// Métrica 1 (da aula)
// counter, (Contador): É uma métrica que só pode aumentar ou ser resetada para 0
const counter = new client.Counter({
  name: 'app_requests_total', // O nome da métrica, como o Grafana vai encontrá-la
  help: 'contador de requesições recebidas' // Descrição da métrica
});

// Métrica 2 (fim de teste e para a nota do trabalho)
// Gauge, (Medidor): É uma métrica que pode aumentar ou diminuir
const gauge = new client.Gauge({
  name: 'app_random_gauge',
  help: 'Um medidor com um valor aleatório'
});

// Métrica 3 (HISTOGRAMA)
// Histogram, (Histograma): Mede a distribuição de valores em "baldes" (buckets)
const histogram = new client.Histogram({
  name: 'app_response_size_bytes',
  help: 'Histograma do tamanho das respostas da rota /data em bytes',
  // Define os "baldes" em bytes.
  // Medições <50 bytes, <100, <250, <500, <750, <1000
  buckets: [50, 100, 250, 500, 750, 1000]
});


// ROTAS DA APLICAÇÃO

// Define a rota principal '/' 
app.get('/', (req, res) => {
  counter.inc(); // Incrementa o contador 'app_requests_total' em +1 a cada visita
  
  // Resposta em HTML simples para incluir links para as outras rotas
  res.send(`
    <h1>Prometheus+Grafana+kubernetes!!!</h1>
    <p>Página principal acessada. O 'app_requests_total' foi incrementado.</p>
    
    <h3>Teste as Métricas:</h3>
    <ul>
      <li>
        <p><b>Métrica 3 (Histograma):</b></p>
        <p>Acesse <a href="/data">/data</a> para gerar dados de tamanho variável.</p>
        <p>(Atualize a rota /data várias vezes para popular o histograma com tamanhos diferentes)</p>
      </li>
    </ul>
  `);
});

// Define a NOVA ROTA '/data' (para o Histograma)
app.get('/data', (req, res) => {
  
  // 1. Gera um payload (texto) com tamanho aleatório (entre 1 e 1000 caracteres)
  const randomLength = Math.floor(Math.random() * 1000) + 1;
  const responsePayload = 'D'.repeat(randomLength); // Repete a letra 'D' N vezes
  
  // 2. Calcula o tamanho real desse payload em bytes
  const responseSizeInBytes = Buffer.from(responsePayload).length;
  
  // 3. Registra esse tamanho no histograma
  histogram.observe(responseSizeInBytes);
  
  // 4. Envia a resposta
  res.send(`Payload enviado com ${responseSizeInBytes} bytes.`);
});


// Define a rota '/metrics', que o Prometheus vai acessar para coletar os dados
app.get('/metrics', async (req, res) => {
  // Define o tipo de conteúdo da resposta
  res.set('Content-Type', client.register.contentType);
  // Envia todas as métricas registradas (default, counter, gauge e histogram) como resposta
  res.end(await client.register.metrics());
});

// Inicia o servidor e o faz "escutar" por conexões na porta 3123
app.listen(3123, () => {
    console.log('App rodando na porta 3123');
});

// Explicação da Métrica 2 (Gauge)
// 'setInterval' é uma função do JavaScript que executa um código repetidamente a cada n milissegundos.
setInterval(() => {
  // Gera um número aleatório entre 0 e 99
  const randomValue = Math.floor(Math.random() * 100);
  // Define o valor do 'gauge' para esse número aleatório
  gauge.set(randomValue);
}, 2000); // executa a cada 2 segundos