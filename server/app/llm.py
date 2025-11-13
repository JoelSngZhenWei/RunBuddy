
import os
from app.core.config import settings
from langchain.chat_models import init_chat_model

os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY
model = init_chat_model("gpt-4.1", temperature=0)