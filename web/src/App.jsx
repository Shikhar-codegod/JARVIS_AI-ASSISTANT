import { useEffect, useRef, useState } from "react";

const links = {
  google: "https://www.google.com",
  facebook: "https://www.facebook.com",
  youtube: "https://www.youtube.com",
  linkedin: "https://www.linkedin.com/in/shikhar-goyal-9a9a69344/",
};

const songs = {
  "one dance": "https://www.youtube.com/watch?v=ki0Ocze98U8",
  gangsta: "https://www.youtube.com/watch?v=XmZrCRRxxXE",
  haseen: "https://www.youtube.com/watch?v=IltsOcCj1Ak",
  unstoppable: "https://youtu.be/YaEG2aWJnZ8",
};

function localAction(text) {
  const command = text.toLowerCase().trim();
  for (const [site, url] of Object.entries(links)) {
  if (command.includes(`open ${site}`) || (site === "linkedin" && command.includes("open my linkedin"))) {
    return { message: `Opening ${site}.`, url };
    }
  }
  if (command.startsWith("play ")) {
    const song = command.slice(5).trim();
    const url = songs[song];
    if (url) {
      return { message: `Playing ${song}.`, url };
    }
  }
  return null;
}

function identityAnswer(text) {
  const command = text.toLowerCase().replace(/[?!.,]/g, "").trim();
  if (/\bwhat(?: is|'s|s) your name\b/.test(command)) return "JARVIS";
  if (/\bwho (?:developed|created) you\b/.test(command)) return "Shikhar Goyal";
  return null;
}

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "JARVIS online. How may I help you?" },
  ]);
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState("ollama");
  const [listening, setListening] = useState(false);
  const recognition = useRef(null);
  const voiceMode = useRef("wake");
  const voiceEnabled = useRef(false);
  const commandText = useRef("");
  const silenceTimer = useRef(null);
  const restartTimer = useRef(null);
  const recognitionRunning = useRef(false);
  const startListeningRef = useRef(null);
  const commandTab = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return undefined;
    const listener = new SpeechRecognition();
    listener.lang = "en-US";
    listener.continuous = true;
    listener.interimResults = true;
    listener.onstart = () => {
      recognitionRunning.current = true;
      setListening(true);
    };
    listener.onresult = (event) => {
      let finalText = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        if (event.results[index].isFinal) finalText += `${event.results[index][0].transcript} `;
      }
      if (!finalText.trim()) return;

      if (voiceMode.current === "wake") {
        if (/\bjarvis\b/i.test(finalText)) {
          voiceMode.current = "command";
          commandText.current = "";
          setMessages((old) => [...old, { role: "assistant", content: "Yeah, ready to launch." }]);
          speak("Yeah, ready to launch.", () => {
            if (voiceEnabled.current) {
              startListeningRef.current?.();
            }
          });
          listener.stop();
        }
        return;
      }

      commandText.current = `${commandText.current} ${finalText}`.trim();
      setInput(commandText.current);
      window.clearTimeout(silenceTimer.current);
      silenceTimer.current = window.setTimeout(() => {
        const command = commandText.current;
        commandText.current = "";
        voiceMode.current = "command";
        listener.stop();
        if (command) submit(command);
      }, 1000);
    };
    listener.onend = () => {
      recognitionRunning.current = false;
      if (voiceEnabled.current && voiceMode.current === "wake") {
        startListening();
      } else if (voiceMode.current === "command" && commandText.current) {
        const command = commandText.current;
        commandText.current = "";
        voiceMode.current = "wake";
        window.clearTimeout(silenceTimer.current);
        submit(command);
      } else {
        setListening(false);
      }
    };
    listener.onerror = (event) => {
      recognitionRunning.current = false;
      if (event.error !== "aborted" && voiceEnabled.current) startListening();
      else if (event.error !== "aborted") setListening(false);
    };
    recognition.current = listener;
    startListeningRef.current = startListening;
    return () => {
      voiceEnabled.current = false;
      window.clearTimeout(silenceTimer.current);
      window.clearTimeout(restartTimer.current);
      startListeningRef.current = null;
      listener.abort();
    };

    function startListening() {
      if (!voiceEnabled.current || recognitionRunning.current) return;
      window.clearTimeout(restartTimer.current);
      restartTimer.current = window.setTimeout(() => {
        if (!voiceEnabled.current || recognitionRunning.current) return;
        try {
          listener.start();
        } catch (error) {
          if (error.name !== "InvalidStateError") setListening(false);
        }
      }, 350);
    }
  }, []);

  function toggleVoice() {
    if (!recognition.current) {
      setMessages((old) => [...old, { role: "assistant", content: "Voice input is not supported by this browser." }]);
      return;
    }
    if (listening) {
      voiceEnabled.current = false;
      voiceMode.current = "wake";
      window.clearTimeout(silenceTimer.current);
      window.clearTimeout(restartTimer.current);
      recognition.current.stop();
      return;
    }
    voiceEnabled.current = true;
    voiceMode.current = "wake";
    if (!commandTab.current || commandTab.current.closed) {
      commandTab.current = window.open("about:blank", "jarvis-command");
      window.focus();
    }
    if (!recognitionRunning.current) {
      try {
        recognition.current.start();
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          setListening(false);
          setMessages((old) => [...old, { role: "assistant", content: "Could not start the microphone." }]);
        }
      }
    }
  }

  async function submit(value) {
    const text = value.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((old) => [...old, { role: "user", content: text }]);

    const action = localAction(text);
    if (/^(go to )?sleep[.!]?$/i.test(text) || /go to sleep/i.test(text)) {
      voiceMode.current = "wake";
      const sleepingMessage = "Going to sleep. Say Jarvis when you need me.";
      setMessages((old) => [...old, { role: "assistant", content: sleepingMessage }]);
      speak(sleepingMessage, () => {
        if (voiceEnabled.current) startListeningRef.current?.();
      });
      return;
    }
    if (action) {
      let opened = false;
      if (commandTab.current && !commandTab.current.closed) {
        commandTab.current.location.href = action.url;
        commandTab.current.focus();
        opened = true;
      } else {
        const newTab = window.open(action.url, "_blank");
        if (newTab) {
          commandTab.current = newTab;
          newTab.focus();
          opened = true;
        }
      }
      setMessages((old) => [...old, { role: "assistant", content: action.message, url: action.url }]);
      if (!opened) {
        setMessages((old) => [...old, { role: "assistant", content: "Your browser blocked the new tab. Use the link below.", url: action.url }]);
      }
      speak(action.message, () => {
        if (voiceEnabled.current) {
          voiceMode.current = "command";
          startListeningRef.current?.();
        }
      });
      return;
    }
    const identity = identityAnswer(text);
    if (identity) {
      setMessages((old) => [...old, { role: "assistant", content: identity }]);
      speak(identity, () => {
        if (voiceEnabled.current) {
          voiceMode.current = "command";
          startListeningRef.current?.();
        }
      });
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(provider === "groq" ? "/api/groq" : "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const responseText = await response.text();
      let data;
      if (!responseText) {
        throw new Error(`The server returned an empty response (HTTP ${response.status}).`);
      }
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`The server returned an invalid response (HTTP ${response.status}).`);
      }
      if (!response.ok) throw new Error(data.error || "The assistant could not respond.");
      setMessages((old) => [...old, { role: "assistant", content: data.response }]);
      speak(data.response, () => {
        if (voiceEnabled.current) {
          voiceMode.current = "command";
          startListeningRef.current?.();
        }
      });
    } catch (error) {
      setMessages((old) => [...old, { role: "assistant", content: error.message }]);
      if (voiceEnabled.current) {
        voiceMode.current = "command";
        startListeningRef.current?.();
      }
    } finally {
      setBusy(false);
    }
  }

  function send(event) {
    event.preventDefault();
    submit(input);
  }

  function speak(text, onEnd) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = onEnd;
      window.speechSynthesis.speak(utterance);
    } else if (onEnd) {
      onEnd();
    }
  }

  return (
    <main className="shell">
      <section className="card">
        <header>
          <div className="orb"><img src="/jarvis-core.png" alt="JARVIS core" /></div>
          <div>
            <p className="eyebrow">PERSONAL AI ASSISTANT</p>
            <h1>JARVIS</h1>
            <p className="status"><i /> Online · Ollama connected through secure proxy</p>
          </div>
        </header>
        <div className="messages" aria-live="polite">
          {messages.map((message, index) => (
            <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
              <span>{message.role === "user" ? "YOU" : "JARVIS"}</span>
              <p>{message.content}{message.url && <><br /><a className="open-link" href={message.url} target="_blank" rel="noreferrer">Open in new tab ↗</a></>}</p>
            </div>
          ))}
          {busy && <div className="message assistant"><span>JARVIS</span><p className="typing">Thinking...</p></div>}
        </div>
        <form onSubmit={send} className="composer">
          <select value={provider} onChange={(event) => setProvider(event.target.value)} aria-label="AI provider">
            <option value="ollama">Ollama</option>
            <option value="groq">Groq</option>
          </select>
          <button type="button" className={`voice ${listening ? "active" : ""}`} onClick={toggleVoice} aria-label="Voice input">
            {listening ? "■" : "●"}
          </button>
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask JARVIS anything..." />
          <button className="send" disabled={busy || !input.trim()} aria-label="Send message">↗</button>
        </form>
        <p className="hint">{listening ? 'Say “Jarvis” to start. Continue speaking after each answer, or say “go to sleep”. Keep this tab focused while speaking.' : 'Press the voice button to activate JARVIS.'}</p>
      </section>
    </main>
  );
}
