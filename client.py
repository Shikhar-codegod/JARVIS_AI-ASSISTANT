# //////////////////////********Tried with OPENAI*****************//////////////////////////
# from openai import OpenAI
# client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

# # client = OpenAI()

# completion = client.chat.completions.create(
#     model = "gpt-3.5-turbo",
#     messages= [
#         {"role": "system" , "content": "you are a virtual assistant , named jarvis, skilled in all the general tasks"},
#         {"role" : "user" , "content": "compose a poem"}
#     ]
# )

# print(completion.choices[0].message)

# //////////////////////********Tried with OLLAMA*****************//////////////////////////
# import json
# import requests

# def ask_ollama(command):
#     """
#     Send a command to the local Ollama model and return the response.
#     """
#     response = requests.post(
#         "http://localhost:11434/api/generate",
#         json={
#             "model": "llama3.1",
#             "prompt": command   # changed from "command" to "prompt"
#         },
#         stream=True
#     )

#     output = ""
#     for line in response.iter_lines():
#         if line:
#             data = json.loads(line.decode("utf-8"))
#             if "response" in data:
#                 output += data["response"]  # += to collect full stream
#     return output

# # # Example usage
# # if __name__ == "__main__":
# #     command = "hello"
# #     reply = ask_ollama(command)
# #     print("Jarvis:", reply)

# c = input("Hey how are you how may i help you today?\n")
# print(ask_ollama(c))

# //////////////////////********Tried with OLLAMA (TYPING EFFECT)*****************//////////////////////////
import json
import requests

def identity_answer(command):
    normalized = command.lower().translate(str.maketrans("", "", "?!.,")).strip()
    if "what is your name" in normalized or "whats your name" in normalized or "what's your name" in command.lower():
        return "JARVIS"
    if "who developed you" in normalized or "who created you" in normalized:
        return "Shikhar Goyal"
    return None

def ask_ollama(command):
    identity = identity_answer(command)
    if identity:
        print(identity)
        return identity

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3.1",
            # "prompt": command
            "prompt": f"Your name is JARVIS. You are a virtual assistant. You are designed to help with various tasks. You are programmed to provide helpful and accurate information. You are designed by Shikhar Goyal.Answer briefly in 1–2 sentences: {command}"

        },
        stream=True
    )

    output = ""
    for line in response.iter_lines():
        if line:
            data = json.loads(line.decode("utf-8"))
            if "response" in data:
                print(data["response"], end="", flush=True)  # show immediately
                output += data["response"]
                
    print()  # newline after streaming
    return output

c = input("Hey how are you how may I help you today?\n")
print("Jarvis:", ask_ollama(c))

# //////////////////////********Tried with OLLAMA(FASTER RESPONSE AT ONCE)(NO USE FALTU)*****************//////////////////////////

# import json
# import requests

# def ask_ollama(command):
#     response = requests.post(
#         "http://localhost:11434/api/generate",
#         json={
#             "model": "llama3.1",
#             "prompt": command,
#             "stream": False   # 🚀 disable streaming
#         }
#     )
#     data = response.json()
#     return data["response"]

# c = input("Hey how are you how may I help you today?\n")
# print("Jarvis:", ask_ollama(c))

# ///////////////////Tried to speak ////////////////

# import json
# import requests
# import threading
# import queue
# import win32com.client  # SAPI TTS

# # Initialize SAPI voice
# engine = win32com.client.Dispatch("SAPI.SpVoice")
# speech_queue = queue.Queue()

# def speech_worker():
#     while True:
#         text = speech_queue.get()
#         if text is None:  # exit signal
#             break
#         if text.strip():
#             engine.Speak(text)
#         speech_queue.task_done()

# # Start speech thread
# speech_thread = threading.Thread(target=speech_worker, daemon=True)
# speech_thread.start()

# def speak(text):
#     speech_queue.put(text)

# def ask_ollama(command):
#     response = requests.post(
#         "http://localhost:11434/api/generate",
#         json={"model": "llama3.1", "prompt": command},
#         stream=True
#     )

#     output = ""
#     buffer = ""
#     for line in response.iter_lines():
#         if line:
#             data = json.loads(line.decode("utf-8"))
#             if "response" in data:
#                 chunk = data["response"]
#                 print(chunk, end="", flush=True)
#                 buffer += chunk
#                 # Speak after punctuation or newline
#                 if buffer.endswith((". ", "? ", "! ", "\n")):
#                     speak(buffer.strip())
#                     buffer = ""
#                 output += chunk

#     # Speak leftover buffer
#     if buffer:
#         speak(buffer.strip())

#     print()
#     return output

# if __name__ == "__main__":
#     c = input("Hey how are you, how may I help you today?\n")
#     print("Jarvis:", ask_ollama(c))

#     # Stop speech thread
#     speech_queue.put(None)
#     speech_thread.join()
