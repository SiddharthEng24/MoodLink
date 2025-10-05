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
The path forward for this is to be able to personalize the extension a bit more by adding names and other elements that humanize the people on the other side of the screen as opposed to just metrics. This would likely appeal to users more and enable improved perception and interaction with the provided data. Additionally, making a separate model for speech mannerisms would also be an addition we could strive to achieve.

---

## 🪄 How To Run

#### Prerequisites
- Python 3.8 or higher
- Google Chrome browser
- Git

#### 1. Clone the Repository
```bash
git clone https://github.com/SiddharthEng24/MoodLink.git
cd MoodLink
```

#### 2. Set Up the Backend (Django API)

##### Navigate to Backend Directory
```bash
cd Backend/Api
```

##### Create and Activate Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

##### Install Dependencies
```bash
pip install -r requirements.txt
```

##### Set Up Environment Variables
Create a `.env` file in the `Backend` directory and add your Gemini API key:
```
DJANGO_SECRET_KEY='your-django-secet-key'
GEMINI_API_KEY=your_gemini_api_key_here
```

##### Run Database Migrations
```bash
python manage.py migrate
```

##### Start the Django Server
```bash
python manage.py runserver
```
The backend will be running at `http://localhost:8000`

#### 3. Install Chrome Extension

##### Load Extension in Chrome
1. Open Google Chrome
2. Go to `chrome://extensions/`
3. Turn on **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `Extension` folder from the cloned repository
6. The MoodLink extension should now appear in your extensions list

##### Using the Extension
1. Join any video meeting (Google Meet, Zoom, etc.)
2. Click on the MoodLink extension icon in Chrome
3. Click **ON** to start emotion detection
4. The extension will capture screenshots every 3 seconds and analyze emotions
5. Click **OFF** to stop and generate a summary report
6. Use the **Close** button to clean up all files and reset the session

#### 4. Verify Setup
- Ensure the Django server is running (`http://localhost:8000`)
- Test the extension on a video meeting
- Check that emotions are being detected and displayed
- Verify that summary reports generate properly when stopping the session

---