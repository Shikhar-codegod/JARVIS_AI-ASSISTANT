import json
# import requests

# def ask_ollama(command):
#     response = requests.post(
#         "http://localhost:11434/api/generate",
#         json={
#             "model": "llama3.1",
#             "prompt": command
#         },
#         stream=True
#     )

#     output = ""
#     for line in response.iter_lines():
#         if line:
#             data = json.loads(line.decode("utf-8"))
#             if "response" in data:
#                 print(data["response"], end="", flush=True)  # show immediately
#                 output += data["response"]
                
#     print()  # newline after streaming
#     return output

# c = input("Hey how are you how may I help you today?\n")
# print("Jarvis:", ask_ollama(c))