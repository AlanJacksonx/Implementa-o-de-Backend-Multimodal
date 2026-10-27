Write-Host "Criando estrutura de diretórios..."
New-Item -ItemType Directory -Force -Path "treinamento/dataset" | Out-Null
New-Item -ItemType Directory -Force -Path "treinamento/output/adapter" | Out-Null
New-Item -ItemType Directory -Force -Path "treinamento/output/merged" | Out-Null

Write-Host "Atualizando .gitignore..."
Add-Content -Path .gitignore -Value @"

# Arquivos de Treinamento IA
treinamento/output/
treinamento/.cache/
"@

Write-Host "Criando dataset de treino (treinamento/dataset/treino.jsonl)..."
@"
{"messages":[{"role":"system","content":"Classifique chamados. Responda com CATEGORIA e JUSTIFICATIVA curta."},{"role":"user","content":"Meu usuário foi bloqueado após várias tentativas."},{"role":"assistant","content":"CATEGORIA: ACESSO\nJUSTIFICATIVA: bloqueio de credenciais."}]}
{"messages":[{"role":"system","content":"Classifique chamados. Responda com CATEGORIA e JUSTIFICATIVA curta."},{"role":"user","content":"O boleto deste mês veio com valor incorreto."},{"role":"assistant","content":"CATEGORIA: FINANCEIRO\nJUSTIFICATIVA: divergência em cobrança."}]}
{"messages":[{"role":"system","content":"Classifique chamados. Responda com CATEGORIA e JUSTIFICATIVA curta."},{"role":"user","content":"Preciso de uma declaração de matrícula."},{"role":"assistant","content":"CATEGORIA: DOCUMENTOS\nJUSTIFICATIVA: solicitação de documento acadêmico."}]}
{"messages":[{"role":"system","content":"Classifique chamados. Responda com CATEGORIA e JUSTIFICATIVA curta."},{"role":"user","content":"O portal fecha quando envio o formulário."},{"role":"assistant","content":"CATEGORIA: SISTEMA\nJUSTIFICATIVA: falha durante operação do portal."}]}
"@ | Out-File -FilePath "treinamento/dataset/treino.jsonl" -Encoding utf8

Write-Host "Criando dataset de validação (treinamento/dataset/validacao.jsonl)..."
@"
{"messages":[{"role":"system","content":"Classifique chamados. Responda com CATEGORIA e JUSTIFICATIVA curta."},{"role":"user","content":"A recuperação de senha não envia o código."},{"role":"assistant","content":"CATEGORIA: ACESSO\nJUSTIFICATIVA: problema na recuperação de credenciais."}]}
{"messages":[{"role":"system","content":"Classifique chamados. Responda com CATEGORIA e JUSTIFICATIVA curta."},{"role":"user","content":"Não consigo abrir a página de notas."},{"role":"assistant","content":"CATEGORIA: SISTEMA\nJUSTIFICATIVA: indisponibilidade de funcionalidade do portal."}]}
"@ | Out-File -FilePath "treinamento/dataset/validacao.jsonl" -Encoding utf8

Write-Host "Criando requirements.txt..."
@"
transformers>=4.45,<5
datasets>=3,<5
peft>=0.13,<1
trl>=0.15,<1
accelerate>=1,<2
safetensors>=0.4,<1
sentencepiece>=0.2,<1
"@ | Out-File -FilePath "treinamento/requirements.txt" -Encoding utf8

Write-Host "Criando Dockerfile..."
@"
FROM python:3.11-slim

WORKDIR /workspace

COPY requirements.txt .
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "train.py"]
"@ | Out-File -FilePath "treinamento/Dockerfile" -Encoding utf8

Write-Host "Criando script de treinamento (train.py)..."
@"
import os
import torch
from datasets import load_dataset
from peft import LoraConfig
from transformers import AutoModelForCausalLM, AutoTokenizer
from trl import SFTConfig, SFTTrainer

MODEL_ID = os.getenv(
    "BASE_MODEL",
    "meta-llama/Llama-3.2-1B-Instruct",
)
TOKEN = os.environ["HF_TOKEN"]

dataset = load_dataset(
    "json",
    data_files={
        "train": "/workspace/dataset/treino.jsonl",
        "validation": "/workspace/dataset/validacao.jsonl",
    },
)

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, token=TOKEN)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    token=TOKEN,
    torch_dtype=torch.float32,
    device_map="cpu",
    low_cpu_mem_usage=True,
)
model.config.use_cache = False

lora = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=["q_proj", "v_proj"],
)

config = SFTConfig(
    output_dir="/workspace/output/checkpoints",
    num_train_epochs=3,
    per_device_train_batch_size=1,
    per_device_eval_batch_size=1,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    eval_strategy="epoch",
    save_strategy="epoch",
    logging_steps=1,
    max_length=256,
    use_cpu=True,
    bf16=False,
    fp16=False,
    dataloader_pin_memory=False,
    report_to="none",
    seed=42,
)

trainer = SFTTrainer(
    model=model,
    args=config,
    train_dataset=dataset["train"],
    eval_dataset=dataset["validation"],
    processing_class=tokenizer,
    peft_config=lora,
)

trainer.train()
trainer.model.save_pretrained("/workspace/output/adapter")
tokenizer.save_pretrained("/workspace/output/adapter")
"@ | Out-File -FilePath "treinamento/train.py" -Encoding utf8

Write-Host "Criando script de mesclagem (merge.py)..."
@"
import os
import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_ID = os.getenv(
    "BASE_MODEL",
    "meta-llama/Llama-3.2-1B-Instruct",
)
TOKEN = os.environ["HF_TOKEN"]

base = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    token=TOKEN,
    torch_dtype=torch.float32,
    device_map="cpu",
    low_cpu_mem_usage=True,
)

model = PeftModel.from_pretrained(
    base,
    "/workspace/output/adapter",
)
model = model.merge_and_unload()

model.save_pretrained(
    "/workspace/output/merged",
    safe_serialization=True,
    max_shard_size="2GB",
)

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, token=TOKEN)
tokenizer.save_pretrained("/workspace/output/merged")
"@ | Out-File -FilePath "treinamento/merge.py" -Encoding utf8

Write-Host "Criando Modelfile para o Ollama..."
@"
FROM /models/llama32-suporte

PARAMETER temperature 0.2
PARAMETER num_ctx 4096

SYSTEM """
Você classifica chamados de suporte.
Use somente: ACESSO, FINANCEIRO, DOCUMENTOS ou SISTEMA.
Responda com CATEGORIA e JUSTIFICATIVA curta.
"""
"@ | Out-File -FilePath "treinamento/Modelfile" -Encoding utf8

Write-Host "✅ Estrutura criada com sucesso!"