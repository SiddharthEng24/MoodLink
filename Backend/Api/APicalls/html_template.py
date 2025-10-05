"""
HTML Template for Meeting Reports
Contains the fixed HTML structure that Gemini should use for all reports.
"""

HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meeting Emotion Analysis Report</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-primary: #1a1a2e;
            --bg-secondary: #16213e;
            --bg-card: #0f3460;
            --text-light: #e0e0e0;
            --text-medium: #c0c0c0;
            --accent-blue: #53d8fb;
            --accent-purple: #bb86fc;
            --gradient-start: #0f3460;
            --gradient-end: #16213e;
            --shadow-light: rgba(0, 0, 0, 0.4);
            --shadow-dark: rgba(0, 0, 0, 0.8);
            --border-color: rgba(255, 255, 255, 0.1);

            /* Emotion Colors */
            --emotion-bored: #808080;
            --emotion-confused: #ffa500;
            --emotion-neutral: #add8e6;
            --emotion-happy: #ffdd4a;
            --emotion-sad: #4682b4;
            --emotion-angry: #dc143c;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-50px); }
            to { opacity: 1; transform: translateX(0); }
        }

        @keyframes progressFill {
            from { width: 0%; }
            to { width: var(--fill-width); }
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Montserrat', sans-serif;
            background: var(--bg-primary);
            color: var(--text-light);
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            scroll-behavior: smooth;
        }

        header {
            background: linear-gradient(90deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
            padding: 3rem 1.5rem;
            text-align: center;
            border-bottom: 2px solid var(--border-color);
            box-shadow: 0 4px 15px var(--shadow-dark);
            animation: fadeIn 1s ease-out;
        }

        header h1 {
            font-family: 'Poppins', sans-serif;
            font-size: 3.5rem;
            color: var(--accent-blue);
            text-shadow: 0 0 15px rgba(83, 216, 251, 0.5);
            margin-bottom: 0.5rem;
        }

        header p {
            font-size: 1.2rem;
            color: var(--text-medium);
        }

        main {
            flex-grow: 1;
            max-width: 1400px;
            margin: 2rem auto;
            padding: 0 1.5rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            animation: fadeIn 1.5s ease-out 0.2s forwards;
            opacity: 0;
        }

        section {
            background: var(--bg-card);
            border-radius: 15px;
            padding: 2rem;
            box-shadow: 0 8px 25px var(--shadow-dark);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
            border: 1px solid var(--border-color);
        }

        section::before {
            content: '';
            position: absolute;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
            background: linear-gradient(45deg, rgba(83, 216, 251, 0.1), rgba(187, 134, 252, 0.1));
            z-index: 0;
            filter: blur(20px);
            opacity: 0;
            transition: opacity 0.5s ease;
        }

        section:hover::before {
            opacity: 1;
        }

        section:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 35px var(--shadow-dark);
        }

        section h2 {
            font-family: 'Poppins', sans-serif;
            font-size: 2rem;
            color: var(--accent-purple);
            margin-bottom: 1.5rem;
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 0.75rem;
            text-shadow: 0 0 10px rgba(187, 134, 252, 0.3);
        }

        section p, section ul {
            font-size: 1.1rem;
            margin-bottom: 1rem;
            color: var(--text-medium);
        }

        section ul {
            list-style: none;
            padding-left: 0;
        }

        section ul li {
            margin-bottom: 0.75rem;
            padding-left: 1.5rem;
            position: relative;
        }

        section ul li::before {
            content: '•';
            color: var(--accent-blue);
            font-size: 1.5rem;
            position: absolute;
            left: 0;
            top: -2px;
        }

        .session-overview div {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px dashed var(--border-color);
            animation: slideInLeft 0.7s ease-out var(--delay, 0s) forwards;
            opacity: 0;
        }
        .session-overview div:last-child {
            border-bottom: none;
        }
        .session-overview div strong {
            color: var(--text-light);
            font-weight: 600;
        }
        .session-overview div span {
            color: var(--accent-blue);
            font-weight: 500;
        }

        .emotion-frequency-chart .chart-bar {
            background-color: var(--bg-primary);
            border-radius: 8px;
            margin-bottom: 1rem;
            height: 35px;
            display: flex;
            align-items: center;
            padding: 0 0.5rem;
            overflow: hidden;
            box-shadow: inset 0 0 8px var(--shadow-dark);
        }

        .emotion-frequency-chart .bar-fill {
            height: 100%;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 1rem;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            transition: background-color 0.3s ease;
            animation: progressFill 1.5s ease-out forwards;
        }

        .emotion-frequency-chart .chart-bar:nth-child(1) .bar-fill { background-color: var(--emotion-bored); }
        .emotion-frequency-chart .chart-bar:nth-child(2) .bar-fill { background-color: var(--emotion-confused); }
        .emotion-frequency-chart .chart-bar:nth-child(3) .bar-fill { background-color: var(--emotion-neutral); }
        .emotion-frequency-chart .chart-bar:nth-child(4) .bar-fill { background-color: var(--emotion-happy); }
        .emotion-frequency-chart .chart-bar:nth-child(5) .bar-fill { background-color: var(--emotion-sad); }
        .emotion-frequency-chart .chart-bar:nth-child(6) .bar-fill { background-color: var(--emotion-angry); }

        .emotion-frequency-chart .bar-fill span {
            color: var(--text-light);
            font-size: 0.9rem;
            text-shadow: 1px 1px 3px var(--shadow-dark);
        }
        .emotion-frequency-chart .bar-fill span:last-child {
            margin-left: auto;
        }

        .emotion-timeline {
            position: relative;
            padding-left: 30px;
            margin-top: 2rem;
        }

        .emotion-timeline::before {
            content: '';
            position: absolute;
            left: 10px;
            top: 0;
            bottom: 0;
            width: 4px;
            background: linear-gradient(to bottom, var(--accent-blue), var(--accent-purple));
            border-radius: 2px;
            box-shadow: 0 0 10px rgba(83, 216, 251, 0.5);
        }

        .timeline-event {
            position: relative;
            margin-bottom: 1.5rem;
            padding: 0.75rem 1rem;
            background-color: var(--bg-primary);
            border-radius: 8px;
            box-shadow: 0 2px 10px var(--shadow-dark);
            margin-left: 20px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            animation: slideInLeft 0.7s ease-out var(--delay, 0s) forwards;
            opacity: 0;
            border-left: 4px solid var(--accent-blue);
        }

        .timeline-event:hover {
            transform: translateX(5px);
            box-shadow: 0 4px 15px var(--shadow-dark);
        }

        .timeline-event::before {
            content: '';
            position: absolute;
            left: -35px;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            background-color: var(--accent-purple);
            border: 3px solid var(--accent-blue);
            border-radius: 50%;
            z-index: 1;
            box-shadow: 0 0 10px rgba(187, 134, 252, 0.7);
        }

        .timeline-event.bored::before { background-color: var(--emotion-bored); border-color: var(--emotion-bored); }
        .timeline-event.confused::before { background-color: var(--emotion-confused); border-color: var(--emotion-confused); }
        .timeline-event.neutral::before { background-color: var(--emotion-neutral); border-color: var(--emotion-neutral); }
        .timeline-event.happy::before { background-color: var(--emotion-happy); border-color: var(--emotion-happy); }
        .timeline-event.sad::before { background-color: var(--emotion-sad); border-color: var(--emotion-sad); }
        .timeline-event.angry::before { background-color: var(--emotion-angry); border-color: var(--emotion-angry); }

        .timeline-event strong {
            color: var(--text-light);
            font-weight: 600;
        }
        .timeline-event span {
            color: var(--accent-blue);
            margin-left: 0.5rem;
            font-size: 0.95rem;
        }

        .detailed-analysis ol, .recommendations ul {
            padding-left: 1.5rem;
            list-style-type: decimal;
        }

        .detailed-analysis ol li, .recommendations ul li {
            margin-bottom: 1rem;
            color: var(--text-medium);
            position: relative;
        }

        .detailed-analysis ol li::marker, .recommendations ul li::marker {
            color: var(--accent-blue);
            font-weight: 600;
        }
        .recommendations ul li::before {
            content: '💡';
            font-size: 1.2rem;
            position: absolute;
            left: -25px;
            top: 0;
            color: var(--accent-purple);
        }
        .recommendations ul {
            list-style: none;
        }
        .recommendations ul li {
            padding-left: 30px;
        }

        footer {
            background: var(--bg-secondary);
            text-align: center;
            padding: 1.5rem;
            margin-top: 3rem;
            color: var(--text-medium);
            font-size: 0.9rem;
            border-top: 1px solid var(--border-color);
            box-shadow: 0 -2px 10px var(--shadow-dark);
            animation: fadeIn 1s ease-out 0.5s forwards;
            opacity: 0;
        }

        @media (max-width: 1024px) {
            main {
                grid-template-columns: 1fr;
                padding: 0 1rem;
            }
            header h1 {
                font-size: 2.8rem;
            }
            header p {
                font-size: 1rem;
            }
            section h2 {
                font-size: 1.7rem;
            }
            section p, section ul, section ol {
                font-size: 1rem;
            }
            .session-overview div {
                font-size: 0.95rem;
            }
        }

        @media (max-width: 600px) {
            header h1 {
                font-size: 2rem;
            }
            header p {
                font-size: 0.9rem;
            }
            main {
                margin: 1.5rem auto;
            }
            section {
                padding: 1.5rem;
            }
            section h2 {
                font-size: 1.5rem;
            }
            .emotion-frequency-chart .bar-fill span {
                font-size: 0.8rem;
            }
            .timeline-event {
                margin-left: 10px;
                padding: 0.6rem 0.8rem;
            }
            .timeline-event::before {
                left: -28px;
                width: 14px;
                height: 14px;
            }
            .emotion-timeline {
                padding-left: 20px;
            }
            .emotion-timeline::before {
                left: 5px;
            }
        }
    </style>
</head>
<body>
    <header>
        <h1>Meeting Emotion Analysis Report</h1>
        <p>A deep dive into emotional engagement during your session.</p>
    </header>

    <main>
        <section class="session-overview" style="grid-column: span 1 / auto;">
            <h2>📊 Session Overview</h2>
            <div style="--delay: 0.1s;">
                <strong>Duration:</strong>
                <span>{{DURATION}}</span>
            </div>
            <div style="--delay: 0.2s;">
                <strong>Total Emotion Readings:</strong>
                <span>{{TOTAL_READINGS}}</span>
            </div>
            <div style="--delay: 0.3s;">
                <strong>Started:</strong>
                <span>{{START_TIME}}</span>
            </div>
            <div style="--delay: 0.4s;">
                <strong>Ended:</strong>
                <span>{{END_TIME}}</span>
            </div>
        </section>

        <section class="emotion-summary" style="grid-column: span 1 / auto;">
            <h2>📈 Emotion Frequency</h2>
            <p>Breakdown of emotions detected during the session.</p>
            <div class="emotion-frequency-chart">
                {{EMOTION_CHART_BARS}}
            </div>
        </section>

        <section class="emotion-timeline-section" style="grid-column: span 2 / auto;">
            <h2>⏱️ Emotion Timeline</h2>
            <p>A chronological view of emotional shifts throughout the session.</p>
            <div class="emotion-timeline">
                {{TIMELINE_EVENTS}}
            </div>
        </section>

        <section class="detailed-analysis" style="grid-column: span 2 / auto;">
            <h2>🔍 Detailed Analysis</h2>
            <p>A comprehensive summary of observed emotional patterns and insights.</p>
            <ol>
                {{ANALYSIS_POINTS}}
            </ol>
        </section>

        <section class="recommendations" style="grid-column: span 2 / auto;">
            <h2>💡 Recommendations for Future Meetings</h2>
            <p>Based on the emotional feedback, consider these actionable steps:</p>
            <ul>
                {{RECOMMENDATIONS}}
            </ul>
        </section>
    </main>

    <footer>
        <p>&copy; 2025 Emotion Analytics. All rights reserved. | Data processed securely for enhanced meeting productivity.</p>
    </footer>
</body>
</html>'''