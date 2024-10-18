const apiKey = "da552f3f1766b44c27f0e2cd3538693b";
let verticalChart, doughnutChart, lineChart;
function getWeatherData() {
    let cityName = document.getElementById("cityInput").value;
    let selectedWeatherDiv = document.getElementById("selectedWeather");

    if (!cityName) {
        let returnedValueForSelectedWeatherDiv = "<span>Kindly enter a valid city please</span>";
        selectedWeatherDiv.innerHTML = returnedValueForSelectedWeatherDiv;
        console.log(selectedWeatherDiv);
    }
    else {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
            .then(response => response.json())
            .then(response => displayCurrentData(response))
            .catch(error => console.error('Error fetching forecast data: ' + error));

        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`)
            .then(response => response.json())
            .then(response => displayWeatherForecast(response))
            .catch(error => console.error('Error fetching forecast data:', error));
    }
}

function displayCurrentData(weatherData) {
    let selectedWeatherDiv = document.getElementById("selectedWeather");
    console.log(weatherData);
    if (weatherData.message == "city not found") {
        let returnedValueForSelectedWeatherDiv = "<span>city not found!</span>";
        selectedWeatherDiv.innerHTML = returnedValueForSelectedWeatherDiv;
        console.log(selectedWeatherDiv);
    }
    else {
        weatherDesc = weatherData.weather[0].main;
        console.log(weatherDesc)
        if (weatherDesc == "Clear") {
            selectedWeatherDiv.style.backgroundImage = "url('./images/sky.avif')";
        }
        else if (weatherDesc == "Rain") {
            selectedWeatherDiv.style.backgroundImage = "url('./images/rain.jpg')";
        }

        else if (weatherDesc == "Clouds") {
            selectedWeatherDiv.style.backgroundImage = "url('./images/cloudy.jpg')";
        }

        else if (weatherDesc == "Snow") {
            selectedWeatherDiv.style.backgroundImage = "url('./images/snow.avif')";
        }


        console.log("Inner");
        const weatherInfo = `
        <h3 class="text-3xl font-bold">${weatherData.name}, ${weatherData.sys.country}</h3>
        <p class="text-lg">Temperature: ${weatherData.main.temp}°C</p>
        <p>Humidity: ${weatherData.main.humidity}%</p>
        <p>Wind Speed: ${weatherData.wind.speed} m/s</p>
        <p>Weather: ${weatherData.weather[0].description}</p>
        <img src="http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png" alt="Weather Icon">`;

        document.getElementById('selectedWeather').innerHTML = weatherInfo;
    }
}


function displayWeatherForecast(data) {
    const forecastContainer = document.getElementById('weatherForNext5days');
    forecastContainer.innerHTML = '';

    const forecastList = data.list.filter((value, index) => {
        if (index % 8 === 0)
            return value;
    });

    const temperatures = [];
    const weatherConditions = {};
    const days = [];




    forecastList.forEach(forecast => {
        const day = new Date(forecast.dt_txt).toDateString();
        const temp = forecast.main.temp;
        const condition = forecast.weather[0].main;

        days.push(day);
        temperatures.push(temp);

        if (weatherConditions[condition]) {
            weatherConditions[condition]++;
        } else {
            weatherConditions[condition] = 1;
        }



        // Generate the forecast card as a string
        const forecastCard = `
<div class="p-4 bg-blue-100 rounded-lg text-center">
    <h4 class="text-xl font-semibold">${day}</h4>
    <p>Temp: ${temp}°C</p>
    <p>Weather: ${condition}</p>
    <img src="http://openweathermap.org/img/w/${forecast.weather[0].icon}.png" alt="Weather Icon" class="mx-auto">
</div>
`;

        // Create a div and set the innerHTML to forecastCard
        const forecastElement = document.createElement('div');
        forecastElement.innerHTML = forecastCard;

        // Access the firstChild, which is the first div inside the forecastCard
        const firstChild = forecastElement.querySelector('div');  // This refers to the first <div> element

        // Debugging: Check if firstChild exists
        if (firstChild) {
            // Set the background image based on the weather description
            weatherDesc = forecast.weather[0].main;
            console.log(forecast);
            console.log(weatherDesc);

            if (weatherDesc === "Clear") {
                firstChild.style.backgroundImage = "url('./images/sky.avif')";
            } else if (weatherDesc === "Rain") {
                firstChild.style.backgroundImage = "url('./images/rain.jpg')";
            } else if (weatherDesc === "Clouds") {
                firstChild.style.backgroundImage = "url('./images/cloudy.jpg')";
            } else if (weatherDesc === "Snow") {
                firstChild.style.backgroundImage = "url('./images/snow.avif')";
            }

            // Append the forecast element to the container
            forecastContainer.appendChild(firstChild);
        } else {
            console.error("firstChild is undefined, cannot set backgroundImage.");
        }


    });

    destroyCharts();

    resetCanvas('verticalChart');
    resetCanvas('doughnutChart');
    resetCanvas('lineChart');


    verticalChart = createVerticalBarChart(days, temperatures);
    doughnutChart = createDoughnutChart(weatherConditions);
    lineChart = createLineChart(days, temperatures);
}

function destroyCharts() {
    if (verticalChart) {
        verticalChart.destroy();
        verticalChart = null; // Clear the reference
    }
    if (doughnutChart) {
        doughnutChart.destroy();
        doughnutChart = null; // Clear the reference
    }
    if (lineChart) {
        lineChart.destroy();
        lineChart = null; // Clear the reference
    }
}

function resetCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        const parent = canvas.parentNode;
        const newCanvas = document.createElement('canvas');
        newCanvas.id = canvasId; // Keep the same ID
        newCanvas.className = canvas.className; // Copy classes
        parent.replaceChild(newCanvas, canvas); // Replace the old canvas
    } else {
        console.error(`Canvas with ID ${canvasId} not found.`);
    }
}

function createVerticalBarChart(labels, data) {
    const ctx = document.getElementById('verticalChart').getContext('2d');

    if (!ctx) {
        console.error("Failed to get the context for verticalChart.");
        return null;
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: data,
                backgroundColor: 'rgba(128, 128, 128, 0.5)', // Light gray for bars
                borderColor: 'rgba(100, 100, 100, 1)', // Darker gray for borders
                borderWidth: 1
            }]
        },
        options: {
            animations: {
                tension: {
                    duration: 2000,
                    easing: 'easeInBounce',
                    from: 1,
                    to: 0,
                    loop: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createDoughnutChart(conditions) {
    const ctx = document.getElementById('doughnutChart').getContext('2d');
    const conditionLabels = Object.keys(conditions);
    const conditionData = Object.values(conditions);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: conditionLabels,
            datasets: [{
                data: conditionData,
                backgroundColor: [
                    'rgba(211, 211, 211, 0.5)', // Light Gray
                    'rgba(169, 169, 169, 0.5)', // Dark Gray
                    'rgba(128, 128, 128, 0.5)', // Gray
                    'rgba(105, 105, 105, 0.5)', // Dim Gray
                    'rgba(192, 192, 192, 0.5)', // Silver
                ]
            }]
        },
        options: {
            animations: {
                delay: {
                    delay: 500,
                }
            }
        }
    });
}

function createLineChart(labels, data) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: data,
                fill: false,
                borderColor: 'rgba(75, 75, 75, 1)', // Dark gray for line
                tension: 0.4
            }]
        },
        options: {
            animations: {
                drop: {
                    duration: 1000,
                    easing: 'easeInOutBounce'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

