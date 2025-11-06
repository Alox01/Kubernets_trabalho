# Define a imagem base
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de definição do projeto
COPY package*.json ./

# Executa o comando 'npm install' para baixar as dependências
RUN npm install

# Copia o resto do código-fonte para dentro do container
COPY . . 

# Informa ao Docker que este container expõe a porta 3123
EXPOSE 3123

# Define o comando que será executado quando o container iniciar
CMD ["npm", "start"]