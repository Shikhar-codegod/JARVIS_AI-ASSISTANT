import speech_recognition as sr
import webbrowser
# import pyttsx3
import win32com.client  # SAPI TTS
import json

import musicLib
import requests

# pip install pocketsphinx

recogniser = sr.Recognizer()
# engine = pyttsx3.init()
engine = win32com.client.Dispatch("SAPI.SpVoice")
newsapi = "b23b5ccdce964d69af4fcc1be1b84649"
# API_KEY = "b23b5ccdce964d69af4fcc1be1b84649"

# def speak(text):
#     engine.say(text)
#     engine.runAndWait()
def speak(text):
    engine.Speak(text)

def ask_ollama(command):
 
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3.1",
            # "prompt": command   # changed from "command" to "prompt"
            "prompt": f"Answer briefly in 1–2 sentences: {command}"

        },
        stream=True
    )

    output = ""
    for line in response.iter_lines():
        if line:
            data = json.loads(line.decode("utf-8"))
            if "response" in data:
                print(data["response"], end="", flush=True)  # show immediately
                # speak(data["response"])
                output += data["response"]
    print()  # newline after streaming
    return output

# Example usagee
# if __name__ == "__main__":
#     command = "what is coding"
#     reply = ask_ollama(command)
#     print("Jarvis:", reply)




def processcommand(c):
    if "open google" in c.lower():
        speak("Opening Google")
        webbrowser.open("https://www.google.com")

    elif  "open facebook" in c.lower():
        speak("Opening facebook")
        webbrowser.open("https://www.facebook.com")  

    elif  "open my linkedin profile" in c.lower():
        speak("Opening your linkedin profile")
        webbrowser.open("https://www.linkedin.com/in/shikhar-goyal-9a9a69344/") 

    elif  "open youtube" in c.lower():
        speak("Opening youtube")
        webbrowser.open("https://www.youtube.com") 

    elif c.lower().startswith("play"):
        song = c.lower().split(" ")[1]
        link =musicLib.music[song]    
        webbrowser.open(link)
    elif "news" in c.lower():
         
        #  r = requests.get("https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey={newsapi}")  
         r= requests.get("https://newsapi.org/v2/top-headlines?country=us&apiKey=b23b5ccdce964d69af4fcc1be1b84649")       

         if r.status_code == 200:
            data = r.json()
            articles = data.get("articles", [])
            for i, article in enumerate(articles, start=1):
                speak(f"{i}. {article['title']}")
         else:
            print("Error:", r.status_code, r.text)
            
    else:
        # let OpenAI handle the rest
        output = ask_ollama(c)
        speak(output)


if __name__ == "__main__":
   speak("   Initialising Jarvis....")
   while True:
    #    listen for the wake word "Jarvis"
    # obtain audio from the microphone
    r = sr.Recognizer()
   
    try:
        with sr.Microphone() as source:
            print("Listening......")
            print("Recognising...")
           
            audio = r.listen(source , timeout = 2, phrase_time_limit=1)

        word = r.recognize_google(audio)
        if "jarvis" in word.lower():
            speak("Ya")
            print("ya")


            # Listen for command
            with sr.Microphone() as source:
                    print("Jarvis Activating......")
                    
                    audio = r.listen(source)
                    command = r.recognize_google(audio)

                    processcommand(command)


    except Exception as e:
            print("Error; {0}".format(e))