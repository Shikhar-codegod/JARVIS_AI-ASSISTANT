import speech_recognition as sr
import webbrowser
import requests
import musicLib  # your custom music library
import time
import win32com.client  # SAPI TTS

# Initialize SAPI speaker
speaker = win32com.client.Dispatch("SAPI.SpVoice")

newsapi = "b23b5ccdce964d69af4fcc1be1b84649"

def speak(text):
    """
    Speak using Windows SAPI (reliable TTS on Windows)
    """
    speaker.Speak(text)

def processcommand(c):
    c = c.lower()
    if "open google" in c:
        webbrowser.open("https://www.google.com")
    elif "open facebook" in c:
        webbrowser.open("https://www.facebook.com")
    elif "open linkedin" in c:
        webbrowser.open("https://www.linkedin.com")
    elif "open youtube" in c:
        webbrowser.open("https://www.youtube.com")
    elif c.startswith("play"):
        song = c.split(" ")[1]
        link = musicLib.music.get(song)
        if link:
            webbrowser.open(link)
        else:
            speak(f"Sorry, I don't have {song} in my library.")
    elif "news" in c:
        url = f"https://newsapi.org/v2/top-headlines?country=us&apiKey={newsapi}"
        r = requests.get(url)
        if r.status_code == 200:
            data = r.json()
            articles = data.get("articles", [])
            for i, article in enumerate(articles[:5], start=1):  # limit to top 5
                speak(f"{i}. {article['title']}")
        else:
            speak("Sorry, I couldn't fetch the news right now.")
            print("Error:", r.status_code, r.text)

if __name__ == "__main__":
    speak("Initialising Jarvis....")
    recogniser = sr.Recognizer()

    while True:
        try:
            with sr.Microphone() as source:
                recogniser.adjust_for_ambient_noise(source, duration=0.5)
                print("Listening for wake word 'Jarvis'...")
                audio = recogniser.listen(source, timeout=5, phrase_time_limit=4)

            try:
                word = recogniser.recognize_google(audio)
                print("Heard:", word)
            except sr.UnknownValueError:
                continue
            except sr.RequestError as e:
                print("Speech API error:", e)
                continue

            if "jarvis" in word.lower():
                print("Wake word detected!")
                speak("Ya")
                time.sleep(0.3)  # small delay to avoid TTS/mic conflict

                # Listen for command
                with sr.Microphone() as source:
                    recogniser.adjust_for_ambient_noise(source, duration=0.3)
                    print("Jarvis Activating...")
                    audio = recogniser.listen(source, timeout=5, phrase_time_limit=6)

                try:
                    command = recogniser.recognize_google(audio)
                    print("Command:", command)
                    processcommand(command)
                except sr.UnknownValueError:
                    speak("Sorry, I did not understand that.")
                except sr.RequestError as e:
                    speak("Sorry, the speech service is unavailable.")
                    print("Speech API error:", e)

        except KeyboardInterrupt:
            print("Exiting...")
            break
        except Exception as e:
            print("Error:", e)
            time.sleep(0.5)
