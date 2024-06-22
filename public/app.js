// Sample questions for the ESG assessment
const questions = [
  { id: 'q1', text: 'How often do you use energy-efficient appliances?', category: 'environmental' },
  { id: 'q2', text: 'Do you actively participate in community service?', category: 'social' },
  { id: 'q3', text: 'Does your company have a diverse leadership team?', category: 'governance' },
  // Add more questions as needed
];

let currentQuestionIndex = 0;
let answers = {};

function displayQuestion() {
  const questionContainer = document.getElementById('questions');
  const currentQuestion = questions[currentQuestionIndex];
  
  questionContainer.innerHTML = `
      <div class="question">
          <p>${currentQuestion.text}</p>
          <select id="${currentQuestion.id}">
              <option value="">Select an answer</option>
              <option value="1">Never</option>
              <option value="2">Rarely</option>
              <option value="3">Sometimes</option>
              <option value="4">Often</option>
              <option value="5">Always</option>
          </select>
      </div>
  `;

  document.getElementById(currentQuestion.id).addEventListener('change', (event) => {
      answers[currentQuestion.id] = parseInt(event.target.value);
      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
          displayQuestion();
      } else {
          document.getElementById('submitBtn').style.display = 'block';
      }
  });
}

function calculateESGScore() {
  const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
  const maxPossibleScore = questions.length * 5;
  return Math.round((totalScore / maxPossibleScore) * 100);
}

function generateRecommendations(score) {
  const recommendations = [];
  if (score < 50) {
      recommendations.push('Consider switching to energy-efficient appliances.');
      recommendations.push('Look into volunteering opportunities in your local community.');
  } else if (score < 80) {
      recommendations.push('Explore renewable energy options for your home or business.');
      recommendations.push('Implement a diversity and inclusion program in your workplace.');
  } else {
      recommendations.push('Share your sustainable practices with others to inspire change.');
      recommendations.push('Consider becoming a B Corp to formalize your commitment to ESG principles.');
  }
  return recommendations;
}

function displayResults() {
  const score = calculateESGScore();
  document.getElementById('esgScore').textContent = score;
  
  const recommendationsList = document.getElementById('recommendations');
  const recommendations = generateRecommendations(score);
  recommendationsList.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
  
  document.getElementById('questionnaire').style.display = 'none';
  document.getElementById('results').style.display = 'block';
  document.getElementById('dashboard').style.display = 'block';
  
  createScoreChart(score);
}

function createScoreChart(score) {
  const ctx = document.getElementById('scoreChart').getContext('2d');
  new Chart(ctx, {
      type: 'doughnut',
      data: {
          labels: ['Your Score', 'Remaining'],
          datasets: [{
              data: [score, 100 - score],
              backgroundColor: ['#4CAF50', '#E0E0E0']
          }]
      },
      options: {
          responsive: true,
          title: {
              display: true,
              text: 'Your ESG Score'
          }
      }
  });
}

async function saveUserData() {
  const score = calculateESGScore();
  const goals = document.getElementById('goalInput').value;
  
  try {
      const response = await fetch('/api/save', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answers, score, goals }),
      });
      
      const data = await response.json();
      
      if (data.id) {
          alert(`Your unique code is: ${data.id}. Please save this to access your results later.`);
      } else {
          throw new Error('Failed to save data');
      }
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while saving your data. Please try again.');
  }
}

async function retrieveUserData(id) {
  try {
      const response = await fetch(`/api/retrieve/${id}`);
      const data = await response.json();
      
      if (data.error) {
          throw new Error(data.error);
      }
      
      answers = data.answers;
      document.getElementById('esgScore').textContent = data.score;
      document.getElementById('goalInput').value = data.goals;
      
      document.getElementById('questionnaire').style.display = 'none';
      document.getElementById('results').style.display = 'block';
      document.getElementById('dashboard').style.display = 'block';
      
      createScoreChart(data.score);
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while retrieving your data. Please check your unique code and try again.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  displayQuestion();
  
  document.getElementById('submitBtn').addEventListener('click', displayResults);
  
  document.getElementById('setGoalBtn').addEventListener('click', () => {
      const goal = document.getElementById('goalInput').value;
      const currentScore = calculateESGScore();
      const goalStatus = document.getElementById('goalStatus');
      if (goal > currentScore) {
          goalStatus.textContent = `Great! Your goal is to improve your score by ${goal - currentScore} points.`;
      } else {
          goalStatus.textContent = 'Please set a goal higher than your current score.';
      }
  });

  document.getElementById('saveBtn').addEventListener('click', saveUserData);
  
  document.getElementById('retrieveBtn').addEventListener('click', () => {
      const id = document.getElementById('retrieveInput').value;
      if (id && id.length === 8) {
          retrieveUserData(id);
      } else {
          alert('Please enter a valid 8-digit code.');
      }
  });
});