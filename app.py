import os
import asyncio
import uvicorn
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from smolagents import CodeAgent, ChatMessage, DuckDuckGoSearchTool, HfApiModel

app = FastAPI()

token = os.getenv("HF_API_TOKEN")
if not token:
    raise ValueError("Environment variable 'HF_API_TOKEN' must be set")

model = HfApiModel(token=token)
agent = CodeAgent(tools=[DuckDuckGoSearchTool()], model=model)


async def generate_response(prompt: str):
    #     response = agent.run("How many seconds would it take for a leopard at full speed to run through Pont des Arts?")
    #     yield response
    message = ChatMessage(role="user", content=prompt)

    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(None, agent.step, message)  # Run in thread

    for chunk in response.content.split():
        yield chunk + " "  # Yield word-by-word


@app.get("/chat")
async def chat(prompt: str):
    return StreamingResponse(generate_response(prompt), media_type="text/plain")


@app.get("/")
async def root():
    return {"message": "Hello World, Updated!"}


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
