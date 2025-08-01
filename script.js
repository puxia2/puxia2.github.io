// Global variables
let data = [];
let currentScene = 1;
let monthlyData = {};
let salaryData = {};
let jobTitleData = {};

// Initialize application
document.addEventListener("DOMContentLoaded", function () {
  loadData();
  setupNavigation();
  setupEventListeners();
});

// Load data
async function loadData() {
  try {
    const response = await d3.csv("us_ai_job_dataset.csv");
    data = response;
    processData();
    createScene1();
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

// Process data
function processData() {
  // Process monthly data
  monthlyData = {};
  salaryData = {};
  jobTitleData = {};

  data.forEach((d) => {
    // Parse date
    const date = new Date(d.posting_date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const monthKey = `${year}-${month.toString().padStart(2, "0")}`;

    // Monthly job posting statistics
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: month,
        year: year,
        count: 0,
        avgSalary: 0,
        avgExperience: 0,
        avgBenefits: 0,
        totalSalary: 0,
        totalExperience: 0,
        totalBenefits: 0,
      };
    }

    monthlyData[monthKey].count++;
    monthlyData[monthKey].totalSalary += parseFloat(d.salary_usd) || 0;
    monthlyData[monthKey].totalExperience +=
      parseFloat(d.years_experience) || 0;
    monthlyData[monthKey].totalBenefits += parseFloat(d.benefits_score) || 0;

    // Salary time series data
    if (!salaryData[monthKey]) {
      salaryData[monthKey] = {
        date: date,
        avgSalary: 0,
        count: 0,
        totalSalary: 0,
      };
    }
    salaryData[monthKey].totalSalary += parseFloat(d.salary_usd) || 0;
    salaryData[monthKey].count++;

    // Job title statistics
    if (!jobTitleData[monthKey]) {
      jobTitleData[monthKey] = {};
    }
    if (!jobTitleData[monthKey][d.job_title]) {
      jobTitleData[monthKey][d.job_title] = 0;
    }
    jobTitleData[monthKey][d.job_title]++;
  });

  // Calculate averages
  Object.keys(monthlyData).forEach((key) => {
    const month = monthlyData[key];
    month.avgSalary = month.totalSalary / month.count;
    month.avgExperience = month.totalExperience / month.count;
    month.avgBenefits = month.totalBenefits / month.count;
  });

  Object.keys(salaryData).forEach((key) => {
    salaryData[key].avgSalary =
      salaryData[key].totalSalary / salaryData[key].count;
  });
}

// Setup navigation
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const scene = parseInt(this.getAttribute("data-scene"));
      switchScene(scene);
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Month selector
  document
    .getElementById("month-select")
    .addEventListener("change", function () {
      createScene3();
    });
}

// Switch scenes
function switchScene(sceneNumber) {
  // Hide all scenes
  document.querySelectorAll(".scene").forEach((scene) => {
    scene.style.display = "none";
  });

  // Remove all active states
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Show selected scene
  document.getElementById(`scene${sceneNumber}`).style.display = "block";
  document
    .querySelector(`[data-scene="${sceneNumber}"]`)
    .classList.add("active");

  currentScene = sceneNumber;

  // Create corresponding chart
  switch (sceneNumber) {
    case 1:
      createScene1();
      break;
    case 2:
      createScene2();
      break;
    case 3:
      createScene3();
      break;
  }
}

// Scene 1: Monthly job postings bar chart
function createScene1() {
  const container = document.getElementById("chart1");
  container.innerHTML = "";

  const margin = { top: 40, right: 30, bottom: 60, left: 60 };
  const width = container.clientWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Prepare data - create continuous timeline from Jan 2024 to Apr 2025
  const allMonths = [];
  const startDate = new Date(2024, 0, 1); // January 2024
  const endDate = new Date(2025, 3, 1); // April 2025

  for (
    let d = new Date(startDate);
    d <= endDate;
    d.setMonth(d.getMonth() + 1)
  ) {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const monthKey = `${year}-${month.toString().padStart(2, "0")}`;

    allMonths.push({
      date: new Date(d),
      monthKey: monthKey,
      displayMonth: `${d.toLocaleDateString("en-US", {
        month: "short",
      })} ${year}`,
      count: monthlyData[monthKey] ? monthlyData[monthKey].count : 0,
      avgSalary: monthlyData[monthKey] ? monthlyData[monthKey].avgSalary : 0,
      avgExperience: monthlyData[monthKey]
        ? monthlyData[monthKey].avgExperience
        : 0,
      avgBenefits: monthlyData[monthKey]
        ? monthlyData[monthKey].avgBenefits
        : 0,
      year: year,
      month: month,
    });
  }

  const chartData = allMonths;

  // Find peak month
  const maxMonth = chartData.reduce((max, d) =>
    d.count > max.count ? d : max
  );

  // Scales
  const x = d3
    .scaleBand()
    .domain(chartData.map((d) => d.displayMonth))
    .range([0, width])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(chartData, (d) => d.count) * 1.1])
    .range([height, 0]);

  // Add grid
  svg
    .append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

  // Draw bar chart
  svg
    .selectAll(".bar")
    .data(chartData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.displayMonth))
    .attr("width", x.bandwidth())
    .attr("y", (d) => y(d.count))
    .attr("height", (d) => height - y(d.count))
    .attr("fill", (d) =>
      d.displayMonth === maxMonth.displayMonth ? "#667eea" : "#764ba2"
    )
    .attr("opacity", 0.8)
    .on("mouseover", function (event, d) {
      showTooltip(event, d);
    })
    .on("mouseout", hideTooltip);

  // Add axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-45)");

  svg.append("g").call(d3.axisLeft(y));

  // Add labels
  svg
    .append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .text("Month");

  svg
    .append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .text("Number of Job Postings");

  // Add annotations
  svg
    .append("text")
    .attr("class", "annotation")
    .attr("x", x(maxMonth.displayMonth) + x.bandwidth() / 2)
    .attr("y", y(maxMonth.count) - 15)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("fill", "#667eea")
    .text(`Peak: ${maxMonth.count} jobs`);

  svg
    .append("line")
    .attr("class", "annotation-connector")
    .attr("x1", x(maxMonth.displayMonth) + x.bandwidth() / 2)
    .attr("y1", y(maxMonth.count) - 10)
    .attr("x2", x(maxMonth.displayMonth) + x.bandwidth() / 2)
    .attr("y2", y(maxMonth.count) + 5)
    .attr("stroke", "#667eea")
    .attr("stroke-width", 2);
}

// Scene 2: Salary trends line chart
function createScene2() {
  const container = document.getElementById("chart2");
  container.innerHTML = "";

  const margin = { top: 40, right: 30, bottom: 60, left: 80 };
  const width = container.clientWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Prepare data
  const chartData = Object.keys(salaryData)
    .sort()
    .map((key) => ({
      date: salaryData[key].date,
      avgSalary: salaryData[key].avgSalary,
    }));

  // Scales
  const x = d3
    .scaleTime()
    .domain(d3.extent(chartData, (d) => d.date))
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(chartData, (d) => d.avgSalary) * 1.1])
    .range([height, 0]);

  // Add grid
  svg
    .append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

  // Create line generator
  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.avgSalary))
    .curve(d3.curveMonotoneX);

  // Draw line
  svg
    .append("path")
    .datum(chartData)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "#667eea")
    .attr("stroke-width", 3)
    .attr("d", line);

  // Add data points
  svg
    .selectAll(".dot")
    .data(chartData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => x(d.date))
    .attr("cy", (d) => y(d.avgSalary))
    .attr("r", 4)
    .attr("fill", "#667eea")
    .on("mouseover", function (event, d) {
      showSalaryTooltip(event, d);
    })
    .on("mouseout", hideTooltip);

  // Add axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y/%m")));

  svg
    .append("g")
    .call(d3.axisLeft(y).tickFormat((d) => `$${d3.format(",.0f")(d)}`));

  // Add labels
  svg
    .append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .text("Time");

  svg
    .append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .text("Average Salary (USD)");

  // Create slider
  createDateSlider(chartData);
}

// Create date slider
function createDateSlider(data) {
  const sliderContainer = document.getElementById("date-slider");
  sliderContainer.innerHTML = "";

  const width = 300;
  const height = 40;

  const svg = d3
    .select(sliderContainer)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([20, width - 20]);

  // Draw slider track
  svg
    .append("line")
    .attr("x1", 20)
    .attr("y1", height / 2)
    .attr("x2", width - 20)
    .attr("y2", height / 2)
    .attr("stroke", "#ccc")
    .attr("stroke-width", 2);

  // Create slider handle
  const slider = svg
    .append("circle")
    .attr("cx", x(data[0].date))
    .attr("cy", height / 2)
    .attr("r", 8)
    .attr("fill", "#667eea")
    .attr("cursor", "pointer")
    .call(
      d3.drag().on("drag", function (event) {
        const newX = Math.max(20, Math.min(width - 20, event.x));
        slider.attr("cx", newX);
        updateDateRange(newX, x);
      })
    );

  // Update date range display
  function updateDateRange(xPos, scale) {
    const date = scale.invert(xPos);
    document.getElementById("date-range-text").textContent = `${
      date.getMonth() + 1
    }/${date.getFullYear()}`;
  }
}

// Scene 3: Popular job titles bar chart
function createScene3() {
  const container = document.getElementById("chart3");
  container.innerHTML = "";

  const selectedMonth = document.getElementById("month-select").value;
  const monthKey = `2024-${selectedMonth.toString().padStart(2, "0")}`;

  if (!jobTitleData[monthKey]) {
    container.innerHTML =
      '<p style="text-align: center; color: #666;">No data available for this month</p>';
    return;
  }

  const margin = { top: 40, right: 30, bottom: 80, left: 120 };
  const width = container.clientWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Prepare data
  const chartData = Object.entries(jobTitleData[monthKey])
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Scales
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(chartData, (d) => d.count)])
    .range([0, width]);

  const y = d3
    .scaleBand()
    .domain(chartData.map((d) => d.title))
    .range([0, height])
    .padding(0.1);

  // Add grid
  svg
    .append("g")
    .attr("class", "grid")
    .call(d3.axisBottom(x).tickSize(-height).tickFormat(""));

  // Draw bar chart
  svg
    .selectAll(".bar")
    .data(chartData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", (d) => y(d.title))
    .attr("width", (d) => x(d.count))
    .attr("height", y.bandwidth())
    .attr("fill", "#667eea")
    .attr("opacity", 0.8)
    .on("mouseover", function (event, d) {
      showJobTitleTooltip(event, d);
    })
    .on("mouseout", hideTooltip);

  // Add axes
  svg.append("g").call(d3.axisLeft(y));

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Add labels
  svg
    .append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .text("Number of Jobs");

  svg
    .append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .text("Job Title");
}

// Tooltip functions
function showTooltip(event, d) {
  const tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = `
        <strong>${d.displayMonth}</strong><br>
        Job Postings: ${d.count}<br>
        Average Salary: $${d3.format(",.0f")(d.avgSalary)}<br>
        Average Experience: ${d.avgExperience.toFixed(1)} years<br>
        Average Benefits Score: ${d.avgBenefits.toFixed(1)}
    `;
  tooltip.style.opacity = 1;
  tooltip.style.left = event.pageX + 10 + "px";
  tooltip.style.top = event.pageY - 10 + "px";
}

function showSalaryTooltip(event, d) {
  const tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = `
        <strong>${d.date.getMonth() + 1}/${d.date.getFullYear()}</strong><br>
        Average Salary: $${d3.format(",.0f")(d.avgSalary)}
    `;
  tooltip.style.opacity = 1;
  tooltip.style.left = event.pageX + 10 + "px";
  tooltip.style.top = event.pageY - 10 + "px";
}

function showJobTitleTooltip(event, d) {
  const tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = `
        <strong>${d.title}</strong><br>
        Number of Jobs: ${d.count}
    `;
  tooltip.style.opacity = 1;
  tooltip.style.left = event.pageX + 10 + "px";
  tooltip.style.top = event.pageY - 10 + "px";
}

function hideTooltip() {
  const tooltip = document.getElementById("tooltip");
  tooltip.style.opacity = 0;
}
