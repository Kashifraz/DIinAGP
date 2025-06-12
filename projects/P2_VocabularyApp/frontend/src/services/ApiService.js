const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage (for web) or SecureStore (for mobile)
    let token = null;
    try {
      if (typeof localStorage !== 'undefined') {
        token = localStorage.getItem('authToken');
        console.log('🔵 Token from localStorage:', token ? 'Present' : 'Missing');
      }
    } catch (error) {
      console.log('🔵 localStorage not available:', error.message);
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log('🔵 API Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body ? JSON.parse(config.body) : undefined
    });

    try {
      const response = await fetch(url, config);
      console.log('🔵 API Response Status:', response.status);
      console.log('🔵 API Response Headers:', response.headers);

      const data = await response.json();
      console.log('🔵 API Response Data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  }

  // Authentication APIs
  async register(email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile(token) {
    return this.request('/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async testAuth() {
    return this.request('/auth/test', {
      method: 'GET',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health', {
      method: 'GET',
    });
  }

  // Learning APIs
  async startLearningSession(hskLevel) {
    return this.request(`/learning/start/${hskLevel}`, {
      method: 'POST',
    });
  }

  async getCurrentWord(sessionId) {
    return this.request(`/learning/session/${sessionId}/current-word`, {
      method: 'GET',
    });
  }

  async markWordAsLearned(sessionId, vocabularyId) {
    return this.request(`/learning/session/${sessionId}/learn/${vocabularyId}`, {
      method: 'POST',
    });
  }

  async getSessionProgress(sessionId) {
    return this.request(`/learning/session/${sessionId}/progress`, {
      method: 'GET',
    });
  }

  async getUserLearningStatistics() {
    return this.request('/learning/statistics', {
      method: 'GET',
    });
  }

  // Vocabulary APIs
  async getVocabularyByLevel(hskLevel, page = 0, size = 10, sortBy = null, sortDirection = 'asc') {
    let url = `/vocabulary/level/${hskLevel}?page=${page}&size=${size}`;
    if (sortBy) {
      url += `&sortBy=${sortBy}&sortDirection=${sortDirection}`;
    }
    return this.request(url, {
      method: 'GET',
    });
  }

  async getVocabularyById(id) {
    return this.request(`/vocabulary/${id}`, {
      method: 'GET',
    });
  }

  async searchByChinese(query, page = 0, size = 10) {
    return this.request(`/vocabulary/search/chinese?q=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
      method: 'GET',
    });
  }

  async searchByEnglish(query, page = 0, size = 10) {
    return this.request(`/vocabulary/search/english?q=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
      method: 'GET',
    });
  }

  async searchByPinyin(query, page = 0, size = 10) {
    return this.request(`/vocabulary/search/pinyin?q=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
      method: 'GET',
    });
  }

  async searchByLevelAndTerm(hskLevel, query, page = 0, size = 10) {
    return this.request(`/vocabulary/search/level/${hskLevel}?q=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
      method: 'GET',
    });
  }

  async getVocabularyStatistics() {
    return this.request('/vocabulary/statistics', {
      method: 'GET',
    });
  }

  async getRandomVocabulary(hskLevel, count = 10) {
    return this.request(`/vocabulary/random/level/${hskLevel}?count=${count}`, {
      method: 'GET',
    });
  }

  // Quiz APIs
  async startQuiz(hskLevel, quizType = 'EASY') {
    console.log('🎯 ApiService.startQuiz called with:', { hskLevel, quizType });
    const result = await this.request(`/quiz/start?hskLevel=${hskLevel}&quizType=${quizType}`, {
      method: 'POST',
    });
    console.log('🎯 ApiService.startQuiz result:', result);
    return result;
  }

  async getQuizQuestion(quizAttemptId, questionNumber) {
    console.log('🎯 ApiService.getQuizQuestion called with:', { quizAttemptId, questionNumber });
    const result = await this.request(`/quiz/question/${quizAttemptId}/${questionNumber}`, {
      method: 'GET',
    });
    console.log('🎯 ApiService.getQuizQuestion result:', result);
    return result;
  }

  async submitQuizAnswer(quizAttemptId, userAnswer, questionNumber, quizType) {
    console.log('🎯 ApiService.submitQuizAnswer called with:', { quizAttemptId, userAnswer, questionNumber, quizType });
    const result = await this.request('/quiz/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quizAttemptId,
        userAnswer,
        questionNumber,
        quizType,
      }),
    });
    console.log('🎯 ApiService.submitQuizAnswer result:', result);
    return result;
  }

  async completeQuiz(quizAttemptId) {
    return this.request(`/quiz/complete/${quizAttemptId}`, {
      method: 'POST',
    });
  }

  async getQuizProgress(quizAttemptId) {
    return this.request(`/quiz/progress/${quizAttemptId}`, {
      method: 'GET',
    });
  }

  async getQuizHistory() {
    return this.request('/quiz/history', {
      method: 'GET',
    });
  }

  async getQuizStatistics(hskLevel) {
    return this.request(`/quiz/statistics/${hskLevel}`, {
      method: 'GET',
    });
  }

  async testQuiz() {
    return this.request('/quiz/test', {
      method: 'GET',
    });
  }

  // Quiz Results APIs
  async getQuizHistory() {
    return this.request('/quiz-results/history', {
      method: 'GET',
    });
  }

  async getQuizHistoryByLevel(hskLevel) {
    return this.request(`/quiz-results/history/level/${hskLevel}`, {
      method: 'GET',
    });
  }

  async getQuizHistoryByType(quizType) {
    return this.request(`/quiz-results/history/type/${quizType}`, {
      method: 'GET',
    });
  }

  async getDetailedQuizResults(quizAttemptId) {
    return this.request(`/quiz-results/detailed/${quizAttemptId}`, {
      method: 'GET',
    });
  }

  async getQuizStatistics() {
    return this.request('/quiz-results/statistics', {
      method: 'GET',
    });
  }

  async getQuizReview(quizAttemptId) {
    return this.request(`/quiz-results/review/${quizAttemptId}`, {
      method: 'GET',
    });
  }

  async getQuizStatisticsByLevel(hskLevel) {
    return this.request(`/quiz-results/statistics/level/${hskLevel}`, {
      method: 'GET',
    });
  }
}

export default new ApiService();
