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
from aimakerspace.text_utils import MultiFileLoader, CharacterTextSplitter
from aimakerspace.vectordatabase import VectorDatabase
from aimakerspace.openai_utils.embedding import EmbeddingModel

# Initialize FastAPI application with a title
app = FastAPI(title="AIMakerSpace Bootcamp Assistant")

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
uploaded_files = []  # Track uploaded files

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
        
        # Prepare system message for AIMakerSpace Bootcamp Assistant
        system_content = (
            "You are the AIMakerSpace AI Engineering Bootcamp Assistant, a helpful AI tutor with a retro neon aesthetic. "
            "You help students understand bootcamp materials, assignments, and concepts.\n\n"
            "Keep your responses concise, engaging, and clearly formatted using markdown.\n\n"
            "Respond appropriately to different types of prompts:\n"
            "- **Concept explanations**: Use simple language, analogies, and avoid jargon. Speak as if explaining to a bootcamp student.\n"
            "- **Assignment help**: Provide guidance without giving complete answers. Help students understand the problem.\n"
            "- **Code explanations**: Break down code step-by-step, explain concepts clearly.\n"
            "- **Bootcamp questions**: Answer questions about course structure, deadlines, or requirements.\n"
            "- **Technical questions**: Provide accurate, helpful explanations for AI/ML concepts.\n\n"
            "Use markdown for:\n"
            "- Bullet points\n"
            "- **Bold** and *italic* emphasis\n"
            "- Code blocks when sharing code\n"
            "- Line breaks for readability\n\n"
            "You are knowledgeable about AI engineering, machine learning, and the bootcamp curriculum. "
            "Stay sharp and stylish like a neon-lit arcade genius while being an excellent tutor!"
        )
        
        # If RAG is enabled and we have a vector database, use it
        if request.use_rag and vector_db and pdf_chunks:
            print(f"RAG enabled - Vector DB: {vector_db is not None}, Chunks: {len(pdf_chunks) if pdf_chunks else 0}")
            print(f"User question: {request.message}")
            # Search for relevant chunks
            relevant_chunks = vector_db.search_by_text(request.message, k=3, return_as_text=True)
            print(f"Found {len(relevant_chunks)} relevant chunks")
            
            if relevant_chunks:
                # Debug: Print the actual chunks being used
                print("Relevant chunks content:")
                for i, chunk in enumerate(relevant_chunks):
                    print(f"Chunk {i+1}: {chunk[:200]}...")
                
                # Add context to system message
                context = "\n\n".join(relevant_chunks)
                print(f"Context length: {len(context)} characters")
                print(f"Context preview: {context[:500]}...")
                
                system_content += f"\n\nIMPORTANT: The user has uploaded bootcamp materials. You MUST use the following context from these uploaded materials to answer their question:\n\n{context}\n\nCRITICAL INSTRUCTIONS:\n- ALWAYS reference the uploaded materials when answering questions\n- If the user asks about concepts, assignments, or content that appears in the uploaded materials, use that information first\n- Only fall back to your general knowledge if the specific question is not addressed in the uploaded materials\n- When using information from the uploaded materials, mention that it comes from the uploaded bootcamp materials\n- Do NOT say you don't see uploaded files - the files are clearly uploaded and indexed"
            else:
                print("No relevant chunks found for the query")
        else:
            print(f"RAG not enabled or no data - RAG: {request.use_rag}, Vector DB: {vector_db is not None}, Chunks: {len(pdf_chunks) if pdf_chunks else 0}")
        
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

# Multi-file upload endpoint
@app.post("/api/upload-files")
async def upload_files(files: List[UploadFile] = File(...)):
    global vector_db, pdf_chunks, uploaded_files
    
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")
        
        # Validate file types
        allowed_extensions = {'.pdf', '.docx', '.txt'}
        for file in files:
            if not file.filename:
                raise HTTPException(status_code=400, detail="File must have a filename")
            file_ext = Path(file.filename).suffix.lower()
            if file_ext not in allowed_extensions:
                raise HTTPException(
                    status_code=400, 
                    detail=f"File type {file_ext} not supported. Allowed: {', '.join(allowed_extensions)}"
                )
        
        # Initialize multi-file loader
        multi_loader = MultiFileLoader()
        temp_files = []
        
        try:
            # Process each new file
            for file in files:
                if not file.filename:
                    continue  # Skip files without names
                    
                # Create temporary file
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix)
                temp_files.append(temp_file.name)
                
                # Write file content
                shutil.copyfileobj(file.file, temp_file)
                temp_file.close()
                
                # Load the file
                multi_loader.load_file(temp_file.name, file.filename)
            
            # Get all documents and file info
            documents = multi_loader.load_documents()
            file_info = multi_loader.get_file_info()
            
            print(f"Extracted {len(documents)} documents from {len(file_info)} files")
            for i, (doc, file) in enumerate(zip(documents, file_info)):
                print(f"Document {i+1} from {file}: {len(doc)} characters")
                if len(doc) > 0:
                    print(f"  Preview: {doc[:200]}...")
                else:
                    print(f"  WARNING: Empty document from {file}")
            
            if not documents:
                raise HTTPException(status_code=400, detail="Could not extract text from any files")
            
            # Split text into chunks
            splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            new_chunks = splitter.split_texts(documents)
            print(f"Created {len(new_chunks)} chunks from {len(documents)} documents")
            
            # Combine with existing chunks if any
            if pdf_chunks:
                pdf_chunks.extend(new_chunks)
                print(f"Added {len(new_chunks)} new chunks to existing {len(pdf_chunks) - len(new_chunks)} chunks")
            else:
                pdf_chunks = new_chunks
                print(f"Created new chunk list with {len(pdf_chunks)} chunks")
            
            # Rebuild vector database with all chunks (including existing ones)
            embedding_model = EmbeddingModel()
            vector_db = VectorDatabase(embedding_model)
            await vector_db.abuild_from_list(pdf_chunks)
            
            # Update uploaded files list - add new files to existing ones
            new_files = list(set(file_info))  # Remove duplicates
            if uploaded_files:
                uploaded_files.extend(new_files)
                uploaded_files = list(set(uploaded_files))  # Remove duplicates
            else:
                uploaded_files = new_files
            
            return {
                "message": f"Successfully uploaded and indexed {len(new_files)} new files! Total files: {len(uploaded_files)}, Total chunks: {len(pdf_chunks)}.",
                "files": uploaded_files,
                "chunks_count": len(pdf_chunks)
            }
            
        finally:
            # Clean up temporary files
            for temp_file in temp_files:
                try:
                    os.unlink(temp_file)
                except:
                    pass
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing files: {str(e)}")

# Get current files status
@app.get("/api/files-status")
async def get_files_status():
    return {
        "has_files": vector_db is not None,
        "files": uploaded_files,
        "chunks_count": len(pdf_chunks) if pdf_chunks else 0
    }

# Clear all files data
@app.delete("/api/clear-files")
async def clear_files():
    global vector_db, pdf_chunks, uploaded_files
    vector_db = None
    pdf_chunks = []
    uploaded_files = []
    return {"message": "All files cleared successfully"}

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
