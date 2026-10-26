```markdown
# 🧠 Implementação de Backend Multimodal (NestJS + Docker + Ollama)

Este projeto é uma API Backend desenvolvida em **NestJS** que integra capacidades de Inteligência Artificial Multimodal utilizando o **Ollama**. A aplicação é capaz de processar e analisar tanto documentos de texto (txt) quanto imagens (png, jpeg, webp) localmente, sem depender de APIs externas pagas.

## 🚀 Tecnologias Utilizadas

* **[NestJS](https://nestjs.com/)**: Framework Node.js para construção de backends eficientes e escaláveis.
* **[Docker & Docker Compose](https://www.docker.com/)**: Para orquestração dos contentores da aplicação e do motor de IA.
* **[Ollama](https://ollama.com/)**: Plataforma para correr grandes modelos de linguagem (LLMs) localmente.
* **Modelos IA**: `llava` (para visão e análise de imagens) e `llama3.2:latest` (para processamento de texto).
* **TypeScript**: Linguagem principal do projeto.

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de que tem as seguintes ferramentas instaladas na sua máquina:
* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (com o motor Docker a correr)
* [Git](https://git-scm.com/)

---

## ⚙️ Instalação e Configuração

**1. Clone o repositório:**
```bash
git clone [https://github.com/AlanJacksonx/Implementa-o-de-Backend-Multimodal.git](https://github.com/AlanJacksonx/Implementa-o-de-Backend-Multimodal.git)
cd Implementa-o-de-Backend-Multimodal

```

**2. Instale as dependências do NestJS:**

```bash
npm install

```

**3. Configure as Variáveis de Ambiente:**
Crie um ficheiro chamado `.env` na raiz do projeto e adicione as seguintes configurações:

```env
OLLAMA_BASE_URL=[http://127.0.0.1:11434](http://127.0.0.1:11434)
OLLAMA_MODEL=llava
OLLAMA_TIMEOUT_MS=120000

```

*(Nota: O timeout está configurado para 120 segundos para permitir o carregamento seguro do modelo visual na primeira execução).*

---

## 🏃 Como Executar o Projeto

A inicialização do projeto é simplificada através de um script de arranque que orquestra os contentores Docker.

**1. Levante a infraestrutura:**
No terminal da raiz do projeto, execute:

```bash
node iniciar.js

```

*(Isto irá criar e iniciar os contentores do Backend e do Ollama em segundo plano).*

**2. Descarregue o modelo de Inteligência Artificial:**
Como a aplicação utiliza o modelo **LLaVA** para processamento multimodal (texto e imagem), é necessário descarregá-lo para dentro do contentor do Ollama (este processo só precisa de ser feito uma vez):

```bash
docker compose exec ollama ollama pull llava

```

*(Aguarde até o download atingir 100% e indicar "success").*

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
3. **Body:** Selecione `Form-data` (ou `Form` no Thunder Client).
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
* `IaService`: Serviço central que valida os ficheiros recebidos (`Multer`) e orquestra a comunicação com o provider de IA.

---

## 👨‍💻 Autoria

Desenvolvido por **Alan Jackson Silva de Medeiros** durante o programa de especialização e integração de arquiteturas backend com Inteligência Artificial.

```

Pode copiar este código inteiro (do `#` inicial até à secção de Autoria) e colar dentro de um ficheiro chamado **`README.md`** na raiz do seu projeto. 

Depois disso, basta fazer os mesmos comandos do Git que lhe mostrei antes para enviar este novo ficheiro para o seu repositório:
```bash
git add README.md
git commit -m "docs: adiciona README detalhado do projeto"
git push origin main

```
