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
    .attr("height", height + margin.top + margin.bottom);

  const g = svg
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

  // Find the month with job postings more than 50
  // const highCountMonth = chartData.filter((d) => d.count >= 50);

  // Find the most popular month
  const maxMonth = chartData.reduce((max, d) =>
    d.count > max.count ? d : max
  );

  // Find the least popular month
  const minMonth = chartData.reduce((min, d) =>
    d.count < min.count ? d : min
  );

  // ---------------------------------------
  // Draw Chart

  // Add labels
  g.append("text")
    .attr("class", "x-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom)
    .text("Month");

  g.append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .text("Number of Job Postings");

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

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-45)");

  g.append("g").call(d3.axisLeft(y));

  // Add grid
  g.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

  // Draw bar chart
  g.selectAll(".bar")
    .data(chartData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.displayMonth))
    .attr("width", x.bandwidth())
    .attr("y", (d) => y(d.count))
    .attr("height", (d) => height - y(d.count))
    .attr("fill", (d) =>
      maxMonth.displayMonth === d.displayMonth ||
      minMonth.displayMonth === d.displayMonth
        ? "#667eea"
        : "#764ba2"
    )
    .attr("opacity", 0.6)
    .on("mouseover", function (event, d) {
      showTooltip(event, d);
    })
    .on("mouseout", hideTooltip);

  // Add annotations
  g.append("text")
    .attr("class", "annotation")
    .attr("x", x(maxMonth.displayMonth) + width / 3)
    .attr("y", y(maxMonth.count) - 60)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .attr("fill", "#667eea")
    .selectAll("tspan")
    .data([
      "AI companies tend to offer",
      "the most job opportunities in March (Spring)",
      "and least in August (Summer).",
    ])
    .enter()
    .append("tspan")
    .attr("x", x(maxMonth.displayMonth) + width / 3)
    .attr("dy", "1.2em")
    .text((d) => d);

  g.append("line")
    .attr("class", "arrow-1")
    .attr("x1", x(maxMonth.displayMonth) + width / 4 - 10)
    .attr("y1", y(maxMonth.count) - 20)
    .attr("x2", x(maxMonth.displayMonth) + x.bandwidth() / 2)
    .attr("y2", y(maxMonth.count) - 5)
    .attr("stroke", "#667eea")
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", "5,5");

  g.append("line")
    .attr("class", "arrow-2")
    .attr("x1", x(minMonth.displayMonth) + x.bandwidth() / 2)
    .attr("y1", y(minMonth.count) - 125)
    .attr("x2", x(minMonth.displayMonth) + x.bandwidth() / 2)
    .attr("y2", y(minMonth.count) - 5)
    .attr("stroke", "#667eea")
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", "5,5");
}

// Scene 2: Salary trends line chart
function createScene2() {
  const container = document.getElementById("chart2");
  container.innerHTML = "";

  const margin = { top: 40, right: 60, bottom: 60, left: 80 };
  const width = container.clientWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  const g = svg
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
      avgSalary: salaryData[monthKey] ? salaryData[monthKey].avgSalary : 0,
    });
  }

  const chartData = allMonths;

  // Add labels
  g.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .text("Time");

  g.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .text("Average Salary (USD)");

  // Scales
  const x = d3
    .scaleTime()
    .domain(d3.extent(chartData, (d) => d.date))
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([
      d3.min(
        chartData.filter((d) => d.avgSalary > 0),
        (d) => d.avgSalary
      ) * 0.9,
      d3.max(chartData, (d) => d.avgSalary) * 1.1,
    ])
    .range([height, 0]);

  // Add axes
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")));

  g.append("g").call(
    d3.axisLeft(y).tickFormat((d) => `$${d3.format(",.0f")(d)}`)
  );

  // Add grid
  g.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

  // line path generator
  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.avgSalary));

  // add line to chart
  g.append("path")
    .datum(chartData.filter((d) => d.avgSalary > 0))
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "#667eea")
    .attr("stroke-width", 3)
    .attr("d", line(chartData.filter((d) => d.avgSalary > 0)));

  // Tooltip
  const focus = g.append("g").attr("class", "focus").style("display", "none");

  // Add focus circle
  focus
    .append("circle")
    .attr("r", 6)
    .attr("fill", "#667eea")
    .attr("stroke", "white")
    .attr("stroke-width", 2);

  // Add focus text
  focus
    .append("text")
    .attr("x", 9)
    .attr("dy", ".35em")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("fill", "#333");

  // Add hover lines
  focus
    .append("line")
    .attr("class", "x-hover-line")
    .attr("stroke", "#667eea")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3,3")
    .attr("y1", 0)
    .attr("y2", 0);

  focus
    .append("line")
    .attr("class", "y-hover-line")
    .attr("stroke", "#667eea")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3,3")
    .attr("x1", 0)
    .attr("x2", 0);

  // Add overlay for mouse tracking
  g.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", () => focus.style("display", null))
    .on("mouseout", () => focus.style("display", "none"))
    .on("mousemove", mousemove);

  // Mouse move function
  function mousemove(event) {
    const mouseX = d3.pointer(event)[0];
    const x0 = x.invert(mouseX);
    const dataWithValues = chartData.filter((d) => d.avgSalary > 0);

    if (dataWithValues.length === 0) return;

    const bisectDate = d3.bisector((d) => d.date).left;
    const i = bisectDate(dataWithValues, x0, 1);

    if (i === 0) {
      const d = dataWithValues[0];
      focus.attr("transform", `translate(${x(d.date)},${y(d.avgSalary)})`);
      focus.select("text").text(`$${d3.format(",.0f")(d.avgSalary)}`);
      focus.select(".x-hover-line").attr("y2", height - y(d.avgSalary));
      focus.select(".y-hover-line").attr("x2", -x(d.date));
    } else if (i >= dataWithValues.length) {
      const d = dataWithValues[dataWithValues.length - 1];
      focus.attr("transform", `translate(${x(d.date)},${y(d.avgSalary)})`);
      focus.select("text").text(`$${d3.format(",.0f")(d.avgSalary)}`);
      focus.select(".x-hover-line").attr("y2", height - y(d.avgSalary));
      focus.select(".y-hover-line").attr("x2", -x(d.date));
    } else {
      const d0 = dataWithValues[i - 1];
      const d1 = dataWithValues[i];
      const d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      focus.attr("transform", `translate(${x(d.date)},${y(d.avgSalary)})`);
      focus.select("text").text(`$${d3.format(",.0f")(d.avgSalary)}`);
      focus.select(".x-hover-line").attr("y2", height - y(d.avgSalary));
      focus.select(".y-hover-line").attr("x2", -x(d.date));
    }
  }
}

// Scene 3: Popular job titles bar chart
function createScene3() {
  const container = document.getElementById("chart3");
  container.innerHTML = "";

  const selectedMonth = document.getElementById("month-select").value;
  const monthKey = selectedMonth; // Now the value is already in the format "2024-01", "2024-02", etc.

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
    .append("g");

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Prepare data
  const chartData = Object.entries(jobTitleData[monthKey])
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Add labels
  g.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .text("Number of Jobs");

  g.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .text("Job Title");

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

  // Add axes
  g.append("g").call(d3.axisLeft(y));

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3
        .axisBottom(x)
        .tickValues(d3.range(0, d3.max(chartData, (d) => d.count) + 1))
        .tickFormat(d3.format("d"))
    );

  // Add grid
  g.append("g")
    .attr("class", "grid")
    .call(
      d3
        .axisBottom(x)
        .tickSize(-height)
        .tickValues(d3.range(0, d3.max(chartData, (d) => d.count) + 1))
        .tickFormat("")
    );

  // Draw bar chart
  g.selectAll(".bar")
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
