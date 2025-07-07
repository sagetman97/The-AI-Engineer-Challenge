<p align = "center" draggable=”false” ><img src="https://github.com/AI-Maker-Space/LLM-Dev-101/assets/37101144/d1343317-fa2f-41e1-8af1-1dbb18399719" 
     width="200px"
     height="auto"/>
</p>


## <h1 align="center" id="heading"> 👋 Welcome to the AI Engineer Challenge</h1>

## 🤖 Your First Vibe Coding LLM Application

> If you need an introduction to `git`, or information on how to set up API keys for the tools we'll be using in this repository - check out our [Interactive Dev Environment for LLM Development](https://github.com/AI-Maker-Space/Interactive-Dev-Environment-for-AI-Engineers) which has everything you'd need to get started in this repository!

In this repository, we'll walk you through the steps to create a LLM (Large Language Model) powered application with a vibe-coded frontend!

Are you ready? Let's get started!

<details>
  <summary>🖥️ Accessing "gpt-4.1-mini" (ChatGPT) like a developer</summary>

1. Head to [this notebook](https://colab.research.google.com/drive/1sT7rzY_Lb1_wS0ELI1JJfff0NUEcSD72?usp=sharing) and follow along with the instructions!

2. Complete the notebook and try out your own system/assistant messages!

That's it! Head to the next step and start building your application!

</details>


<details>
  <summary>🏗️ Forking & Cloning This Repository</summary>

1. Fork [this](https://github.com/AI-Maker-Space/The-AI-Engineer-Challenge) repo!

     ![image](https://i.imgur.com/bhjySNh.png)

1. Clone your newly created repo.

     ``` bash
     git clone git@github.com:<YOUR GITHUB USERNAME>/The-AI-Engineer-Challenge.git
     ```

2. Open the freshly cloned repository inside Cursor!

     ```bash
     cd The-AI-Engineering-Challenge
     cursor .
     ```

3. Check out the existing backend code found in `/api/app.py`

</details>

<details>
  <summary>🔥Setting Up for Vibe Coding Success </summary>

While it is a bit counter-intuitive to set things up before jumping into vibe-coding - it's important to remember that there exists a gradient betweeen AI-Assisted Development and Vibe-Coding. We're only reaching *slightly* into AI-Assisted Development for this challenge, but it's worth it!

1. Check out the rules in `.cursor/rules/` and add theme-ing information like colour schemes in `frontend-rule.mdc`! You can be as expressive as you'd like in these rules!
2. We're going to index some docs to make our application more likely to succeed. To do this - we're going to start with `CTRL+SHIFT+P` (or `CMD+SHIFT+P` on Mac) and we're going to type "custom doc" into the search bar. 

     ![image](https://i.imgur.com/ILx3hZu.png)
3. We're then going to copy and paste `https://nextjs.org/docs` into the prompt.

     ![image](https://i.imgur.com/psBjpQd.png)

4. We're then going to use the default configs to add these docs to our available and indexed documents.

     ![image](https://i.imgur.com/LULLeaF.png)

5. After that - you will do the same with Vercel's documentation. After which you should see:

     ![image](https://i.imgur.com/hjyXhhC.png) 

</details>

<details>
  <summary>😎 Vibe Coding a Front End for the FastAPI Backend</summary>

1. Use `Command-L` or `CTRL-L` to open the Cursor chat console. 

2. Set the chat settings to the following:

     ![image](https://i.imgur.com/LSgRSgF.png)

3. Ask Cursor to create a frontend for your application. Iterate as much as you like!

4. Run the frontend using the instructions Cursor provided. 

> NOTE: If you run into any errors, copy and paste them back into the Cursor chat window - and ask Cursor to fix them!

> NOTE: You have been provided with a backend in the `/api` folder - please ensure your Front End integrates with it!

</details>

<details>
  <summary>🚀 Deploying Your First LLM-powered Application with Vercel</summary>

1. Ensure you have signed into [Vercel](https://vercel.com/) with your GitHub account.

2. Ensure you have `npm` (this may have been installed in the previous vibe-coding step!) - if you need help with that, ask Cursor!

3. Run the command:

     ```bash
     npm install -g vercel
     ```

4. Run the command:

     ```bash
     vercel
     ```

5. Follow the in-terminal instructions. (Below is an example of what you will see!)

     ![image](https://i.imgur.com/D1iKGCq.png)

6. Once the build is completed - head to the provided link and try out your app!

> NOTE: Remember, if you run into any errors - ask Cursor to help you fix them!

</details>

### 🎉 Congratulations! 

You just deployed your first LLM-powered application! 🚀🚀🚀 Get on linkedin and post your results and experience! Make sure to tag us at @AIMakerspace!

Here's a template to get your post started!

```
🚀🎉 Exciting News! 🎉🚀

🏗️ Today, I'm thrilled to announce that I've successfully built and shipped my first-ever LLM using the powerful combination of , and the OpenAI API! 🖥️

Check it out 👇
[LINK TO APP]

A big shoutout to the @AI Makerspace for all making this possible. Couldn't have done it without the incredible community there. 🤗🙏

Looking forward to building with the community! 🙌✨ Here's to many more creations ahead! 🥂🎉

Who else is diving into the world of AI? Let's connect! 🌐💡

#FirstLLMApp 
```

# Retro Neon Todo App

A full-stack todo application with a retro neon theme, built with Next.js and FastAPI.

## Project Structure

```
.
├── api/               # FastAPI backend
│   ├── app.py        # Main FastAPI application
│   └── requirements.txt
└── frontend/         # Next.js frontend
    ├── app/         
    ├── types/
    └── package.json
```

## Setup and Running

### Backend (FastAPI)

1. Create a Python virtual environment:
```bash
cd api
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the backend server:
```bash
uvicorn app:app --reload --port 8000
```

The API will be available at http://localhost:8000

### Frontend (Next.js)

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Features

- Create, read, update, and delete todos
- Mark todos as complete/incomplete
- Retro neon theme with modern UI/UX
- Responsive design
- Real-time updates

## Tech Stack

- Frontend:
  - Next.js 14
  - React 18
  - TypeScript
  - Tailwind CSS
  - Axios

- Backend:
  - FastAPI
  - Pydantic
  - uvicorn

# AIMakerSpace AI Engineering Bootcamp Assistant

A RAG-powered chatbot specifically designed for the AIMakerSpace AI Engineering Bootcamp. Upload your bootcamp materials (PDF, DOCX, TXT) and chat with an AI tutor that understands your course content.

## 🚀 Features

- **Multi-file Upload**: Support for PDF, DOCX, and TXT files
- **RAG Integration**: Chat with your uploaded bootcamp materials
- **Neon Aesthetic**: Retro cyberpunk UI design
- **Real-time Chat**: Interactive AI tutoring experience
- **File Management**: Toggle RAG inclusion and remove files

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: FastAPI with Python 3.11
- **AI**: OpenAI GPT-4.1-mini with embeddings
- **Vector Database**: Custom implementation with cosine similarity
- **File Processing**: PyPDF2, python-docx, and text processing

## 📁 Project Structure

```
The-AI-Engineer-Challenge/
├── frontend/                 # Next.js frontend
│   ├── app/
│   │   ├── components/       # React components
│   │   └── chat/            # Chat page
│   └── package.json
├── api/                     # FastAPI backend
│   └── app.py              # Main API file
├── aimakerspace/           # Custom AI library
│   ├── text_utils.py       # File processing
│   ├── vectordatabase.py   # Vector search
│   └── openai_utils/       # OpenAI integration
├── requirements.txt        # Python dependencies
├── pyproject.toml         # Python project config
├── runtime.txt            # Python version for Render
└── vercel.json           # Vercel deployment config
```

## 🚀 Deployment

### **Render (Backend)**
1. **Connect your GitHub repository** to Render
2. **Create a new Web Service**
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn api.app:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `PYTHONPATH`: `.`
6. **Python Version**: 3.11.8 (specified in `runtime.txt`)

### **Vercel (Frontend)**
1. **Connect your GitHub repository** to Vercel
2. **Framework Preset**: Next.js
3. **Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `.next`
6. **Environment Variables**:
   - `NEXT_PUBLIC_API_BASE_URL`: Your Render backend URL

### **Dependencies**

#### **Backend Dependencies** (`requirements.txt`)
- `fastapi>=0.115.12` - Web framework
- `uvicorn>=0.34.2` - ASGI server
- `openai>=1.0.0` - OpenAI API client
- `pydantic>=2.11.4` - Data validation
- `PyPDF2>=3.0.0` - PDF processing
- `python-docx>=1.1.0` - DOCX processing
- `numpy>=1.24.0` - Numerical computing
- `python-dotenv>=1.0.0` - Environment variables
- `python-multipart>=0.0.6` - File uploads
- `aiofiles>=23.0.0` - Async file operations

#### **Frontend Dependencies** (`frontend/package.json`)
- `next>=14.2.29` - React framework
- `react>=18.2.0` - UI library
- `axios>=1.6.7` - HTTP client
- `react-markdown>=8.0.7` - Markdown rendering
- `react-syntax-highlighter>=15.6.1` - Code highlighting
- `react-icons>=5.5.0` - Icon library
- `tailwindcss>=3.4.17` - CSS framework

## 🛠️ Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API key

### Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn api.app:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables (Local)
Create `.env.local` in the frontend directory:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 🔧 API Endpoints

- `POST /api/chat` - Chat with the AI assistant
- `POST /api/upload-files` - Upload and process files
- `GET /api/files-status` - Get current file status
- `DELETE /api/clear-files` - Clear all uploaded files
- `GET /api/health` - Health check endpoint

## 🎨 UI Features

- **Neon Theme**: Pink and blue neon colors with glowing effects
- **Responsive Design**: Works on desktop and mobile
- **File Upload**: Drag-and-drop or click to upload
- **RAG Toggle**: Enable/disable RAG for specific conversations
- **Real-time Chat**: Live typing indicators and message status
- **Code Highlighting**: Syntax highlighting for code blocks
- **Emoji Reactions**: React to messages with emojis

## 🔒 Security

- CORS configured for specific domains
- File type validation (PDF, DOCX, TXT only)
- Environment variable protection
- Input sanitization and validation

## 🐛 Troubleshooting

### Common Issues

1. **ModuleNotFoundError: No module named 'PyPDF2'**
   - Ensure requirements.txt is properly installed
   - Check Python version compatibility

2. **CORS errors**
   - Verify CORS origins in api/app.py
   - Check environment variables

3. **File upload failures**
   - Ensure file types are supported
   - Check file size limits
   - Verify temporary file permissions

### Render Deployment Issues

1. **Build failures**
   - Check Python version in runtime.txt
   - Verify all dependencies in requirements.txt
   - Ensure PYTHONPATH is set to "."

2. **Runtime errors**
   - Check environment variables
   - Verify OpenAI API key is valid
   - Check application logs in Render dashboard

## 📝 License

This project is part of the AIMakerSpace AI Engineering Bootcamp.

## 🤝 Contributing

This is a bootcamp project. For questions or issues, please refer to the bootcamp materials or contact your instructor.
