# AI Job Market Narrative Visualization

This is an interactive narrative visualization project based on D3.js that showcases various trends and insights in the AI job market.

## Project Overview

This project uses an "interactive slideshow" structure with three different scenes to tell the story of the AI job market:

### Scene 1: Monthly Job Posting Trends

- **Chart Type**: Bar Chart
- **Function**: Displays the number of job postings per month
- **Interaction**: Hover to show detailed information (average salary, experience years, benefits score)
- **Annotations**: Automatically highlights the month with the most job postings

### Scene 2: Salary Time Trends

- **Chart Type**: Line Chart
- **Function**: Shows salary trends over time
- **Interaction**: Draggable date slider allowing users to explore different time periods
- **Design**: References modern financial chart design

### Scene 3: Popular Job Titles Analysis

- **Chart Type**: Horizontal Bar Chart
- **Function**: Shows the 5 most popular AI job titles for a specific month
- **Interaction**: Dropdown menu to select month
- **Insights**: Understand market demand across different periods

## Technology Stack

- **D3.js v7**: Main visualization library
- **d3-annotation**: Chart annotation functionality
- **HTML5/CSS3**: Modern UI design
- **JavaScript ES6+**: Interactive logic

## Data Source

Uses the `us_ai_job_dataset.csv` dataset, which includes:

- Job ID and title
- Salary information (USD)
- Experience requirements
- Company information
- Job posting date
- Benefits score, etc.

## Design Features

### Visual Design

- Gradient backgrounds and glassmorphism effects
- Modern card-based layout
- Responsive design supporting mobile devices
- Unified color scheme (blue-purple gradient)

### Interactive Experience

- Smooth scene transitions
- Rich hover effects
- Intuitive control interface
- Detailed tooltips

### Narrative Structure

- Clear scene navigation
- Progressive information display
- Guided user interaction
- Data-driven insights

## Usage

1. Open the `index.html` file
2. Use the top navigation bar to switch between different scenes
3. Use the slider in Scene 2 to explore different time periods
4. Select a specific month in Scene 3 to view popular job titles
5. Hover over chart elements to view detailed information

## File Structure

```
puxia2.github.io/
├── index.html          # Main page
├── styles.css          # Style file
├── script.js           # JavaScript logic
├── us_ai_job_dataset.csv  # Data file
└── README.md           # Project documentation
```

## Deployment

The project is configured for GitHub Pages and can be accessed at:
https://puxia2.github.io/

## Development

### Local Development

1. Clone the repository
2. Run with a local server (e.g., Python's http.server)
3. Access in browser at localhost:8000

### Customization

- Modify `styles.css` to adjust visual styles
- Add new interactive features in `script.js`
- Update data files to display new datasets

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

This project is for educational purposes only.
