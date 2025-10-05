# MoodLink  
### *“Linking people through emotional awareness.”*  

---

## 💡 Inspiration  
We wanted to **bridge the gap between individuals with lower emotional intelligence (EQ)** and those they interact with online. Many people struggle to read facial cues during virtual conversations. *MoodLink* allows them to stay emotionally connected and aware of how those they converse with.

---

## ⚙️ What It Does  
MoodLink is a **Chrome extension** that analyzes the **facial expressions** of the person you’re meeting with online.  

- Currently supports **one-on-one meetings** as well as **meetings with multiple individuals**.  
- Uses a **trained machine learning model** to detect emotional states such as **happy, sad, confused, bored,** or **neutral**.  
- While the extension is toggled on, it provides **real-time mood updates** every 3 seconds.  
- When toggled off, it generates a **summary report via Gemini**, showing the proportions of different moods observed during the session.


---

## 🛠️ How We Built It  
- The **frontend** is built with JavaScript for the **GUI and background scripts**.  
- The **backend**, powered by **Django**, handles the analysis workflow.  
- Screenshots from meetings are captured, **cropped, and sanitized using OpenCV**, then sent via an **API call** to a **TensorFlow model** (done via [teachable machine](https://teachablemachine.withgoogle.com/train/pose)) that classifies the mood. 
- The extension is packaged and managed through **manifest.json** for smooth integration in Chrome.
- Called **Gemini** via another API call to convert a table of the stored mood information into easily digestible text for the viewer to review.  

---

## 🚧 Challenges We Ran Into  
1. Integrating the **frontend and backend** for seamless communication.  
2. Developing a **functional and reliable ML model** with limited time and data.  
3. Ensuring **state persistence** when switching browser tabs.  

---

## 🏆 Accomplishments We’re Proud Of  
1. Creating a **working machine learning model** capable of classifying emotions.  
2. Successfully building and deploying a **functional Chrome extension**, despite limited frontend experience.  

---

## 📚 What We Learned  
1. How to **design and train a simple machine learning model**.  
2. The fundamentals of **building a Chrome extension**.  
3. Creating **usable UI elements** and managing **frontend-backend communication**.  
4. Making **functional API calls** with Django.  

---

## 🚀 What’s Next for MoodLink  
Our next goal is to extend MoodLink’s capabilities to **multi-person video calls**, allowing it to analyze and display **group mood dynamics**. This will make it scalable and even more insightful for teams, classrooms, and virtual collaborations.

---
