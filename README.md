# FinSight AI – Intelligent Stock Market Analysis Platform

## Overview

**FinSight AI** is an AI-powered stock market analysis platform designed to help users understand market trends, evaluate stock performance, and identify potential investment opportunities.

The application combines **real-time financial data, artificial intelligence, sentiment analysis, and explainable AI (XAI)** to provide meaningful insights instead of just raw numbers.

Unlike traditional dashboards that only display stock prices, FinSight AI aims to **explain market behavior and assist decision-making** using machine learning and data-driven insights.

This project is currently under active development.

---

# Built With

The application is developed using **Base44**, an AI-powered development platform used to build intelligent applications quickly and efficiently.

Core technologies used:

* **Base44** – Application development and AI orchestration
* **AI Prediction Models** – Stock price prediction
* **Financial Market APIs** – Real-time stock data
* **Sentiment Analysis** – Market news and investor sentiment
* **Explainable AI (XAI)** – Model transparency and prediction reasoning

---

# Key Features

## Real-Time Market Data

FinSight AI fetches live stock market data and displays important metrics including:

* Open price
* High price
* Low price
* Closing price
* Trading volume

Users can visualize price movement using interactive charts.

---

## AI-Based Stock Price Prediction

The system analyzes historical market data and predicts possible future stock prices using machine learning models.

Predictions are generated based on multiple market indicators such as:

* Historical closing prices
* Market trends
* Trading activity
* Market index movement

This helps users understand potential price direction.

---

## Market Index Comparison

The platform compares individual stocks with major market indices such as:

* **NIFTY 50**

This allows users to evaluate whether a stock is **outperforming or underperforming the overall market**.

---

## Relative Strength Analysis

Relative strength analysis helps determine how strong a stock is compared to the broader market.

FinSight AI calculates:

Stock Performance ÷ Market Index Performance

This metric helps identify strong stocks that are performing better than the market.

---

## Sentiment Analysis

FinSight AI analyzes financial news and market sentiment related to a specific stock.

The system identifies whether current news sentiment is:

* Positive
* Neutral
* Negative

Sentiment signals can influence market movement and investor decisions.

---

## Explainable AI (XAI)

Most AI prediction systems behave like "black boxes".

FinSight AI introduces **Explainable AI (XAI)** so users can understand **why the AI made a prediction**.

The platform analyzes multiple factors including:

* Recent price momentum
* Market trend direction
* Trading activity
* Market volatility
* Index movement

The system explains which factors are **bullish signals** and which are **risk factors**.

This improves transparency and user trust in the predictions.

---

## AI Opportunity Finder

FinSight AI automatically scans multiple stocks and identifies potential investment opportunities.

Stocks are ranked based on:

* AI predicted price movement
* Sentiment score
* Market trend
* Risk level
* AI confidence score

This helps users quickly identify promising stocks without manually analyzing each one.

---

## AI Confidence Score

Each prediction includes a **confidence score** that represents how reliable the prediction is based on current data patterns.

Higher confidence indicates stronger agreement among indicators used by the AI system.

---

## Risk Analysis

FinSight AI highlights potential risks by analyzing factors such as:

* High market volatility
* Negative sentiment trends
* Weak market momentum

This helps users become aware of potential downside risks.

---

## Email Alert System (Planned)

Future versions of FinSight AI will include an **email notification system** that alerts users when:

* A strong buy signal appears
* A sell signal is detected
* Sentiment changes significantly
* Market volatility increases
* Major prediction changes occur

---

# Performance Optimization

To improve performance and reduce loading time, the system includes:

* Data caching
* Reduced API calls
* Lazy loading of heavy features
* Optimized data fetching
* Efficient prediction workflows

These optimizations allow the dashboard to load quickly and remain responsive.

---

# Project Goals

The goal of FinSight AI is to move beyond traditional stock dashboards and create a **smart financial intelligence platform** that helps users:

* Understand market behavior
* Identify opportunities
* Evaluate risk
* Trust AI predictions through transparency

---

# Future Enhancements

Planned improvements include:

* Portfolio analysis and AI portfolio suggestions
* Advanced prediction accuracy tracking
* Automated trading signal alerts
* Multi-stock prediction comparison
* Improved sentiment analysis using financial news sources
* Advanced explainable AI visualizations

---

# Status

FinSight AI is currently **under active development**, and new features are continuously being added to improve the platform's capabilities and user experience.

---

## ⚙️ Running the Project Locally

Follow these steps to run the FinSight application on your local machine.

### 1️⃣ Clone the Repository

```bash
git clone <your-repository-url>
cd Base44_FinSight
```

### 2️⃣ Install Dependencies

Make sure Node.js is installed on your system, then run:

```bash
npm install
```

### 3️⃣ Create Environment Variables

Create a file named `.env.local` in the root directory of the project and add the following:

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_app_url
```

These variables allow the frontend to connect with the Base44 backend services.

### 4️⃣ Start the Development Server

Run the following command:

```bash
npm run dev
```

### 5️⃣ Open the Application

After the server starts, open your browser and go to:

```
http://localhost:5173
```

The FinSight dashboard should now be running locally.

---

## 📝 Notes

* The frontend runs locally using **Vite**.
* Backend APIs are served through the Base44 application.
* Some features such as AI insights or prediction history may not work if the Base44 integration limits are reached.


# Author

Developed by **Yashvin**
AI & Data Science Engineering Student
