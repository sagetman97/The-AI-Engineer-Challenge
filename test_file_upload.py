#!/usr/bin/env python3

import os
import tempfile
from aimakerspace.text_utils import MultiFileLoader, CharacterTextSplitter

def test_file_processing():
    """Test file processing for different file types"""
    
    # Create test files
    test_files = []
    
    # Test TXT file
    txt_content = "This is a test text file.\nIt contains multiple lines.\nThis should be processed correctly."
    txt_file = tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False)
    txt_file.write(txt_content)
    txt_file.close()
    test_files.append(('test.txt', txt_file.name))
    
    # Test DOCX file (we'll create a simple text file for now)
    docx_content = "This is a test document.\nIt has paragraphs.\nThis should work like a DOCX file."
    docx_file = tempfile.NamedTemporaryFile(mode='w', suffix='.docx', delete=False)
    docx_file.write(docx_content)
    docx_file.close()
    test_files.append(('test.docx', docx_file.name))
    
    print("Testing file processing...")
    
    # Test MultiFileLoader
    multi_loader = MultiFileLoader()
    
    for filename, filepath in test_files:
        print(f"\nProcessing {filename} at {filepath}")
        try:
            multi_loader.load_file(filepath, filename)
        except Exception as e:
            print(f"Error processing {filename}: {e}")
    
    # Get results
    documents = multi_loader.load_documents()
    file_info = multi_loader.get_file_info()
    
    print(f"\nResults:")
    print(f"Documents: {len(documents)}")
    print(f"File info: {file_info}")
    
    for i, (doc, file) in enumerate(zip(documents, file_info)):
        print(f"\nDocument {i+1} from {file}:")
        print(f"Length: {len(doc)} characters")
        print(f"Content: {doc[:200]}...")
    
    # Test chunking
    if documents:
        splitter = CharacterTextSplitter(chunk_size=100, chunk_overlap=20)
        chunks = splitter.split_texts(documents)
        print(f"\nChunks created: {len(chunks)}")
        for i, chunk in enumerate(chunks):
            print(f"Chunk {i+1}: {chunk[:100]}...")
    
    # Cleanup
    for _, filepath in test_files:
        try:
            os.unlink(filepath)
        except:
            pass

if __name__ == "__main__":
    test_file_processing() 