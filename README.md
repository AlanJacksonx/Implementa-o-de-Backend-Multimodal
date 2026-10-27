# 🧠 Implementação de Backend Multimodal (NestJS + Docker + Ollama)

Este projeto é uma API Backend desenvolvida em **NestJS** que integra capacidades de Inteligência Artificial Multimodal utilizando o **Ollama**. A aplicação é capaz de processar e analisar tanto documentos de texto (txt) quanto imagens (png, jpeg, webp) localmente, além de incluir uma infraestrutura completa para o **treinamento e ajuste fino (fine-tuning)** de modelos locais para tarefas específicas.

## 🚀 Tecnologias Utilizadas

* **[NestJS](https://nestjs.com/)**: Framework Node.js para construção de backends eficientes e escaláveis.
* **[Docker & Docker Compose](https://www.docker.com/)**: Para orquestração dos contentores da aplicação, motor de IA e ambiente de treinamento.
* **[Ollama](https://ollama.com/)**: Plataforma para correr grandes modelos de linguagem (LLMs) localmente.
* **Hugging Face / PyTorch**: Utilizados no ambiente de treinamento para baixar o modelo-base e aplicar a técnica LoRA.
* **Modelos IA**: `llava` (para visão e análise de imagens), `llama3.2:1b` (para processamento de texto original) e `llama3.2-suporte` (modelo ajustado sob medida).
* **TypeScript & Python**: Linguagens principais do projeto (Backend e Scripts de Treino).

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de que tem as seguintes ferramentas instaladas na sua máquina:

* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (com o motor Docker a correr)
* [Git](https://git-scm.com/)
* Conta no **Hugging Face** com acesso concedido ao modelo `meta-llama/Llama-3.2-1B-Instruct` e um Token de Acesso (Read).

---

## ⚙️ Instalação e Configuração

**1. Clone o repositório:**

```bash
git clone https://github.com/AlanJacksonx/Implementa-o-de-Backend-Multimodal.git
cd Implementa-o-de-Backend-Multimodal

```

**2. Instale as dependências do NestJS:**

```bash
npm install

```

**3. Configure as Variáveis de Ambiente:**
Crie um ficheiro chamado `.env` na raiz do projeto e adicione as seguintes configurações (substitua o token pelo seu gerado no Hugging Face):

```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llava
OLLAMA_TIMEOUT_MS=120000
HF_TOKEN=hf_seu_token_do_hugging_face_aqui

```

---

## 🏃 Como Executar o Projeto Principal

A inicialização do projeto é simplificada através de um script de arranque.

**1. Levante a infraestrutura:**
No terminal da raiz do projeto, execute:

```bash
node iniciar.js

```

*(Isto irá criar e iniciar os contentores do Backend, Frontend e do Ollama em segundo plano).*

**2. Descarregue o modelo de Inteligência Artificial:**
Para o processamento de imagens (Multimodal), descarregue o modelo visual:

```bash
docker compose exec ollama ollama pull llava

```

---

## 🏋️ Treinamento de IA Customizada (Fine-Tuning)

O projeto inclui uma arquitetura isolada para realizar o fine-tuning (ajuste fino) do modelo Llama 3.2 1B diretamente na CPU usando Docker. O objetivo é especializar a IA para classificar chamados de suporte técnico automaticamente nas categorias: **ACESSO, FINANCEIRO, DOCUMENTOS ou SISTEMA**.

**Passo a passo para treinar o seu próprio modelo:**

1. **Construa o ambiente de treinamento (PyTorch):**
```bash
docker compose --profile training build trainer

```


2. **Execute o ajuste fino (treina o adaptador LoRA baseado nos seus datasets em `.jsonl`):**
```bash
docker compose --profile training run --rm trainer python train.py

```


3. **Mescle o adaptador treinado com o modelo-base:**
```bash
docker compose --profile training run --rm trainer python merge.py

```


4. **Importe o novo modelo para o motor do Ollama:**
```bash
docker compose up -d --force-recreate ollama
docker compose exec ollama ollama create llama3.2-suporte -f /models/Modelfile

```



**Como usar o modelo treinado no backend:**
Após a criação, basta ir ao seu arquivo `.env`, alterar a variável `OLLAMA_MODEL` para `llama3.2-suporte` e reiniciar o backend (`docker compose restart backend`).

---

## 🧪 Testando a API

A aplicação expõe o endpoint `POST /ia/analisar-arquivo` que aceita requisições do tipo `multipart/form-data`.

### Opção 1: Teste automatizado via Script (Texto)

O projeto inclui um script que cria automaticamente um ficheiro `chamado.txt` e o envia para a IA categorizar:

```bash
node testar.js

```

### Opção 2: Teste Multimodal via Thunder Client / Postman (Imagens)

Para testar a capacidade de visão da IA, crie uma nova requisição na sua ferramenta de testes de API:

1. **Método:** `POST`
2. **URL:** `http://localhost:3000/ia/analisar-arquivo`
3. **Body:** Selecione `Form-data`.
4. **Campos:**
* `prompt` (Texto): *Insira a sua pergunta, ex: "O que você vê nesta imagem?"*
* `arquivo` (Ficheiro): *Selecione uma imagem (.jpg, .png, .webp) do seu computador.*


5. **Enviar!**

A API irá devolver um JSON detalhado com a descrição gerada pela IA, o modelo utilizado e a contagem de tokens de entrada/saída.

---

## 🏗️ Estrutura da Arquitetura de IA

O sistema de IA foi desenhado utilizando o padrão **Provider**, permitindo trocar o motor de inferência no futuro sem alterar a lógica de negócio:

* `ModeloProvider`: Classe abstrata que define os contratos de geração de resposta e análise de ficheiros.
* `OllamaProvider`: Implementação concreta que comunica com o contentor local do Ollama.
* `IaService`: Serviço central que valida os ficheiros recebidos (`Multer`) e orquestra a comunicação.
* `/treinamento`: Diretório isolado contendo scripts Python, datasets e configurações Docker específicas para a esteira de fine-tuning.

---

## 👨‍💻 Autoria

Desenvolvido por **Alan Jackson Silva de Medeiros** e **Daniel Augusto Silva de Goes** durante o programa de especialização e integração de arquiteturas backend com Inteligência Artificial.
