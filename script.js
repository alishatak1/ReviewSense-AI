// ===============================
// ReviewSense AI
// Script File
// ===============================

// Get HTML Elements
const loadingText = document.getElementById("loadingText");
const themeGrid = document.getElementById("themeGrid");
const reviewInput = document.getElementById("reviewInput");
const uploadBtn = document.getElementById("uploadBtn");
const csvFile = document.getElementById("csvFile");
const loadDemoBtn = document.getElementById("loadDemoBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
// Load Demo Reviews
loadDemoBtn.addEventListener("click", () => {

    reviewInput.value = `★★★★★
Delivery was quick and the food arrived hot.

★☆☆☆☆
My refund is still pending after one week.

★★☆☆☆
Customer support only gave chatbot replies.

★★★★★
Loved the packaging and fast delivery.

★☆☆☆☆
One item was missing from my order.`;

});
const totalReviews = document.getElementById("totalReviews");
const themesFound = document.getElementById("themesFound");
const painPoints = document.getElementById("painPoints");
const featureCount = document.getElementById("featureCount");
const positiveReviews = document.getElementById("positiveReviews");
const neutralReviews = document.getElementById("neutralReviews");
const negativeReviews = document.getElementById("negativeReviews");
const painPointList = document.getElementById("painPointList");
const featureList = document.getElementById("featureList");
const productBrief = document.getElementById("productBrief");
let sentimentChart;
let themeChart;

// Open File Explorer when Upload button is clicked
uploadBtn.addEventListener("click", () => {
    csvFile.click();
});

// Read uploaded CSV file
csvFile.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        reviewInput.value = e.target.result;

    };

    reader.readAsText(file);

});

// Analyze Reviews
analyzeBtn.addEventListener("click", analyzeReviews);
async function analyzeReviews() {

    const text = reviewInput.value.trim();

    if (text === "") {
        alert("Please enter reviews first!");
        return;
    }

    // Split reviews
    const reviews = text
        .split(/\n\s*\n/)
        .filter(review => review.trim() !== "");

    // Total Reviews
    totalReviews.textContent = reviews.length;

    // ---------- Theme Detection ----------

    let support = 0;
    let delivery = 0;
    let refund = 0;
    let missing = 0;

    reviews.forEach(review => {

        const r = review.toLowerCase();

        if (r.includes("support") || r.includes("chatbot"))
            support++;

        if (r.includes("delivery") || r.includes("late") || r.includes("delay"))
            delivery++;

        if (r.includes("refund"))
            refund++;

        if (r.includes("missing"))
            missing++;

    });

    // Count how many different themes exist
    let themeTotal = 0;

    if (support > 0) themeTotal++;
    if (delivery > 0) themeTotal++;
    if (refund > 0) themeTotal++;
    if (missing > 0) themeTotal++;

    themesFound.textContent = themeTotal;

    // Highest pain point count
    painPoints.textContent = Math.max(
        support,
        delivery,
        refund,
        missing
    );

    // Number of feature suggestions
    featureCount.textContent = themeTotal;
    let positive = 0;
let neutral = 0;
let negative = 0;

const positiveWords = [
    "good",
    "great",
    "excellent",
    "amazing",
    "fast",
    "love",
    "loved",
    "awesome",
    "best",
    "happy"
];

const negativeWords = [
    "bad",
    "late",
    "delay",
    "delayed",
    "refund",
    "missing",
    "poor",
    "worst",
    "terrible",
    "cancel",
    "cancelled",
    "chatbot",
];

reviews.forEach(review => {

    const text = review.toLowerCase();

    let pos = 0;
    let neg = 0;

    positiveWords.forEach(word => {
        if (text.includes(word)) pos++;
    });

    negativeWords.forEach(word => {
        if (text.includes(word)) neg++;
    });

    if (pos > neg)
        positive++;

    else if (neg > pos)
        negative++;

    else
        neutral++;

});

positiveReviews.textContent = positive;
neutralReviews.textContent = neutral;
negativeReviews.textContent = negative;
// Destroy previous charts

if(sentimentChart)
    sentimentChart.destroy();

if(themeChart)
    themeChart.destroy();

const sentimentCtx = document
.getElementById("sentimentChart");

sentimentChart = new Chart(sentimentCtx,{

    type:"pie",

    data:{
        labels:["Positive","Neutral","Negative"],

        datasets:[{

            data:[positive,neutral,negative]

        }]
    }

});

const themeCtx = document
.getElementById("themeChart");

themeChart = new Chart(themeCtx,{

    type:"bar",

    data:{

        labels:[
            "Support",
            "Delivery",
            "Refund",
            "Missing"
        ],

        datasets:[{

            label:"Mentions",

            data:[
                support,
                delivery,
                refund,
                missing
            ]

        }]
    }

});
    themeGrid.innerHTML = "";

const themes = [

    {
        icon: "📞",
        name: "Customer Support",
        count: support,
        priority: "High"
    },

    {
        icon: "🚚",
        name: "Delivery",
        count: delivery,
        priority: "High"
    },

    {
        icon: "💰",
        name: "Refund",
        count: refund,
        priority: "Medium"
    },

    {
        icon: "📦",
        name: "Missing Items",
        count: missing,
        priority: "Medium"
    }

];

themes.forEach(theme => {

    if(theme.count===0) return;

    themeGrid.innerHTML += `

        <div class="theme-card">

            <h3>${theme.icon} ${theme.name}</h3>

            <p>${theme.count} Mentions</p>

            <span class="${theme.priority.toLowerCase()}">

                ${theme.priority} Priority

            </span>

        </div>

    `;

});
loadingText.style.display = "block";
analyzeBtn.disabled = true;

try {

    const response = await fetch("http://localhost:3001/analyze", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            reviews: text
        })

    });

    const data = await response.json();

    painPointList.innerHTML = "";

    data.painPoints.forEach(point => {

        painPointList.innerHTML += `<li>${point}</li>`;

    });

    featureList.innerHTML = "";

    data.features.forEach(feature => {

        featureList.innerHTML += `<li>${feature}</li>`;

    });

    productBrief.textContent = data.summary;

} catch (err) {

    alert("AI analysis failed.");

    console.log(err);

} finally {

    loadingText.style.display = "none";
    analyzeBtn.disabled = false;

}
}