# Import required FastAPI components for building the API
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
# Import Pydantic for data validation and settings management
from pydantic import BaseModel
# Import OpenAI client for interacting with OpenAI's API
from openai import OpenAI
import os
from typing import Optional, List
import uuid
import tempfile
import shutil
from pathlib import Path

# Import aimakerspace components
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from aimakerspace.text_utils import PDFLoader, CharacterTextSplitter
from aimakerspace.vectordatabase import VectorDatabase
from aimakerspace.openai_utils.embedding import EmbeddingModel

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

# Global variables for RAG system
vector_db = None
pdf_chunks = []
pdf_filename = None

# Define the data model for chat requests using Pydantic
class ChatRequest(BaseModel):
    message: str
    use_rag: bool = False

# Define the main chat endpoint that handles POST requests
@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
        if not OPENAI_API_KEY:
            raise HTTPException(status_code=500, detail="OpenAI API key not set in environment variables.")
        client = OpenAI(api_key=OPENAI_API_KEY)
        
        # Prepare system message
        system_content = (
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
        
        # If RAG is enabled and we have a vector database, use it
        if request.use_rag and vector_db and pdf_chunks:
            # Search for relevant chunks
            relevant_chunks = vector_db.search_by_text(request.message, k=3, return_as_text=True)
            
            if relevant_chunks:
                # Add context to system message
                context = "\n\n".join(relevant_chunks)
                system_content += f"\n\nUse the following context from the uploaded PDF to answer the user's question:\n\n{context}\n\nIf the context doesn't contain relevant information to answer the question, you can use your general knowledge, but mention that the specific information wasn't found in the uploaded document."
        
        # Create a chat completion request
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {
                    "role": "system",
                    "content": system_content
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

# PDF upload endpoint
@app.post("/api/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    global vector_db, pdf_chunks, pdf_filename
    
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name
        
        try:
            # Load and process PDF
            pdf_loader = PDFLoader(temp_path)
            documents = pdf_loader.load_documents()
            
            if not documents:
                raise HTTPException(status_code=400, detail="Could not extract text from PDF")
            
            # Split text into chunks
            splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            pdf_chunks = splitter.split_texts(documents)
            
            # Initialize vector database and build embeddings
            embedding_model = EmbeddingModel()
            vector_db = VectorDatabase(embedding_model)
            await vector_db.abuild_from_list(pdf_chunks)
            
            pdf_filename = file.filename
            
            return {
                "message": f"PDF '{file.filename}' uploaded and indexed successfully! Found {len(pdf_chunks)} text chunks.",
                "filename": file.filename,
                "chunks_count": len(pdf_chunks)
            }
            
        finally:
            # Clean up temporary file
            os.unlink(temp_path)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

# Get current PDF status
@app.get("/api/pdf-status")
async def get_pdf_status():
    return {
        "has_pdf": vector_db is not None,
        "filename": pdf_filename,
        "chunks_count": len(pdf_chunks) if pdf_chunks else 0
    }

# Clear PDF data
@app.delete("/api/clear-pdf")
async def clear_pdf():
    global vector_db, pdf_chunks, pdf_filename
    vector_db = None
    pdf_chunks = []
    pdf_filename = None
    return {"message": "PDF data cleared successfully"}

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
