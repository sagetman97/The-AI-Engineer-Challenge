# Import required FastAPI components for building the API
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
# Import Pydantic for data validation and settings management
from pydantic import BaseModel
# Import OpenAI client for interacting with OpenAI's API
from openai import OpenAI
import os
from typing import Optional, List
import uuid

# Initialize FastAPI application with a title
app = FastAPI(title="OpenAI Chat API")

# Configure CORS (Cross-Origin Resource Sharing) middleware
# This allows the API to be accessed from different domains/origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://bootcamp-todo-list.vercel.app",
        "https://bootcamp-todo-list-sebastians-projects-61a584b3.vercel.app",
        "https://bootcamp-todo-list-sagetman97-sebastians-projects-61a584b3.vercel.app",
        "https://bootcamp-todo-list-5y30v20h9-sebastians-projects-61a584b3.vercel.app",
        "https://the-ai-engineer-challenge-nine.vercel.app",
        "https://the-ai-engineer-challenge-sebastians-projects-61a584b3.vercel.app",
        "http://localhost:3000"
    ],
    allow_credentials=True,  # Allows cookies to be included in requests
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers in requests
)

# Define the data model for chat requests using Pydantic
class ChatRequest(BaseModel):
    message: str

# Define the main chat endpoint that handles POST requests
# Define the main chat endpoint that handles POST requests
@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
        if not OPENAI_API_KEY:
            raise HTTPException(status_code=500, detail="OpenAI API key not set in environment variables.")
        client = OpenAI(api_key=OPENAI_API_KEY)
        
        # Create a chat completion request
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful AI assistant with a retro neon aesthetic. Keep your responses concise, engaging, "
                        "and clearly formatted using markdown.\n\n"
                        "Respond appropriately to different types of prompts:\n"
                        "- **Concept explanations**: Use simple language, analogies, and avoid jargon. Speak as if explaining to a curious beginner.\n"
                        "- **Summarization tasks**: Extract only the key points. Avoid copying full sentences. Be concise and clear.\n"
                        "- **Creative writing**: Use vivid but coherent storytelling. Stay within length limits and include a clear beginning, middle, and end.\n"
                        "- **Logical or math questions**: Think step-by-step and explain your reasoning clearly. Provide only one final answer at the end.\n"
                        "- **Rewriting or tone-shifting**: Match the requested tone (e.g., formal, professional, casual). Eliminate slang or filler words when writing professionally.\n\n"
                        "Use markdown for:\n"
                        "- Bullet points\n"
                        "- **Bold** and *italic* emphasis\n"
                        "- Code blocks when sharing code\n"
                        "- Line breaks for readability\n\n"
                        "You are accurate, imaginative, and adaptable — all while staying sharp and stylish like a neon-lit arcade genius."
                    )
                },
                {
                    "role": "user",
                    "content": request.message
                }
            ]
        )
        
        # Return the response
        return {"response": response.choices[0].message.content}
    
    except Exception as e:
        # Handle any errors that occur during processing
        raise HTTPException(status_code=500, detail=str(e))

# Define a health check endpoint to verify API status
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

class Todo(BaseModel):
    id: str
    title: str
    completed: bool

class TodoCreate(BaseModel):
    title: str

# In-memory storage
todos: List[Todo] = []

@app.get("/api/todos", response_model=List[Todo])
async def get_todos():
    return todos

@app.post("/api/todos", response_model=Todo)
async def create_todo(todo: TodoCreate):
    new_todo = Todo(id=str(uuid.uuid4()), title=todo.title, completed=False)
    todos.append(new_todo)
    return new_todo

@app.put("/api/todos/{todo_id}", response_model=Todo)
async def update_todo(todo_id: str, completed: bool):
    for todo in todos:
        if todo.id == todo_id:
            todo.completed = completed
            return todo
    raise HTTPException(status_code=404, detail="Todo not found")

@app.delete("/api/todos/{todo_id}")
async def delete_todo(todo_id: str):
    for i, todo in enumerate(todos):
        if todo.id == todo_id:
            todos.pop(i)
            return {"message": "Todo deleted"}
    raise HTTPException(status_code=404, detail="Todo not found")

# Entry point for running the application directly
if __name__ == "__main__":
    import uvicorn
    # Start the server on all network interfaces (0.0.0.0) on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
