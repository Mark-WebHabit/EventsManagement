import Chart from "chart.js/auto";

export const createChart1 = (chart1Ref, data, chart1Labels, chart1Values) => {
  if (chart1Ref.current && data.length > 0) {
    const ctx = chart1Ref.current.getContext("2d");

    if (chart1Ref.current.chart) {
      chart1Ref.current.chart.destroy();
    }

    chart1Ref.current.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: chart1Labels?.map((c) => c.abbreviation),
        datasets: [
          {
            label: "Attendees",
            data: chart1Values || [],
            backgroundColor: [
              "#1E90FF", // Dodger Blue
              "rgba(30, 144, 255, 0.8)", // Lighter shade of dodger blue
              "rgba(0, 0, 255, 0.8)", // Blue
              "rgba(0, 0, 139, 0.8)", // Dark blue
              // Add more shades of blue as needed
            ],
            borderColor: "#1E90FF",
            borderWidth: 1,
          },
        ],
      },
      options: {
        maintainAspectRatio: true,
        aspectRatio: 1,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                size: 13,
              },
              stepSize: 1,
            },
            title: {
              display: true,
              text: "Students",
              color: "red",
              font: {
                size: 15,
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
            labels: {
              font: {
                size: 14,
              },
            },
          },
          tooltip: {
            bodyFont: {
              size: 16,
            },
            titleFont: {
              size: 16,
            },
          },
        },
      },
    });
  }
};

export const createChart2 = (chart2Ref, data, chart2Values) => {
  if (chart2Ref.current && data.length > 0) {
    const ctx = chart2Ref.current.getContext("2d");

    if (chart2Ref.current.chart) {
      chart2Ref.current.chart.destroy();
    }

    chart2Ref.current.chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Present", "Absent"],
        datasets: [
          {
            label: "Attendance Population",
            data: chart2Values || [],
            backgroundColor: ["#1E90FF", "#32CD32"], // Dodger Blue and Lime Green
            borderWidth: 1,
          },
        ],
      },
      options: {
        maintainAspectRatio: true, // Ensures the chart maintains its aspect ratio
        aspectRatio: 1, // Adjust this value to control the proportion (1 means the chart is a square)
        responsive: true, // Ensures the chart resizes with the container
        plugins: {
          legend: {
            display: true,
            labels: {
              font: {
                size: 13,
              },
            },
          },
          tooltip: {
            bodyFont: {
              size: 20,
            },
            titleFont: {
              size: 20,
            },
          },
        },
      },
    });
  }
};

export const createChart3 = (chart3Ref, chart3Labels, chart3Values) => {
  if (chart3Ref.current && chart3Labels.length > 0 && chart3Values.length > 0) {
    const ctx = chart3Ref.current.getContext("2d");

    if (chart3Ref.current.chart) {
      chart3Ref.current.chart.destroy();
    }

    chart3Ref.current.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: chart3Labels,
        datasets: [
          {
            label: "Attendance based on major",
            data: chart3Values || [],
            backgroundColor: [
              "#1E90FF", // Dodger Blue
              "rgba(30, 144, 255, 0.8)", // Lighter shade of dodger blue
              "rgba(0, 0, 255, 0.8)", // Blue
              "rgba(0, 0, 139, 0.8)", // Dark blue
              // Add more shades of blue as needed
            ],
            borderColor: "#1E90FF",
            borderWidth: 1,
          },
        ],
      },
      options: {
        maintainAspectRatio: true,
        aspectRatio: 1,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                size: 16,
              },
              stepSize: 1,
            },
            title: {
              display: true,
              text: "Students",
              color: "red",
              font: {
                size: 20,
              },
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              font: {
                size: 16,
              },
            },
          },
          tooltip: {
            bodyFont: {
              size: 20,
            },
            titleFont: {
              size: 20,
            },
          },
        },
      },
    });
  }
};

export const generateChart = (ref, labels, values, title) => {
  if (ref) {
    const ctx = ref.getContext("2d");

    // Destroy the previous chart instance if it exists
    if (ref.chart) {
      ref.chart.destroy();
    }

    // Define color palette for the pie chart
    const colors = [
      "#1E90FF", // Dodger Blue
      "#00BFFF", // Deep Sky Blue
      "#87CEFA", // Light Sky Blue
      "#4682B4", // Steel Blue
      "#5F9EA0", // Cadet Blue
      "#6495ED", // Cornflower Blue
      "#00CED1", // Dark Turquoise
      "#40E0D0", // Turquoise
      "#AFEEEE", // Pale Turquoise
      "#ADD8E6", // Light Blue
    ];

    // Create a new pie chart
    ref.chart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: title,
            data: values || [],
            backgroundColor: colors,
            borderColor: colors.map((color) => color.replace("1)", "0.8)")), // Adding transparency to borders
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              font: {
                size: 12,
              },
              color: "#333", // Text color
            },
          },
          tooltip: {
            bodyFont: {
              size: 14,
            },
            titleFont: {
              size: 16,
            },
            backgroundColor: "rgba(0,0,0,0.7)", // Dark background for tooltips
            callbacks: {
              label: function (context) {
                let label = context.label || "";
                if (label) {
                  label += ": ";
                }
                label += context.raw;
                return label;
              },
            },
          },
          title: {
            display: !!title,
            text: title,
            font: {
              size: 15,
              weight: "bold",
            },
            color: "#333", // Title color
          },
        },
      },
    });
  }
};
