async function loadSlides(moduleName) {
  try {
    const res = await fetch(`data/${moduleName}-slides.json`);
    return await res.json();
  } catch (e) {
    console.error('Error loading slides:', e);
    return [];
  }
}

async function initSlides() {
  const container = document.querySelector('.slide-container');
  if (!container) return;

  const moduleName = container.getAttribute('data-module');
  if (!moduleName) return;

  const titleEl = container.querySelector('.slide-title');
  const bodyEl = container.querySelector('.slide-body');
  const progressEl = container.querySelector('.slide-progress');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');

  const slides = await loadSlides(moduleName);
  let index = 0;

  function renderSlide() {
    if (!slides.length) {
      titleEl.textContent = 'No slides found';
      bodyEl.textContent = 'Check your JSON file.';
      progressEl.textContent = '';
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      return;
    }
    const slide = slides[index];
    titleEl.textContent = slide.title;
    bodyEl.textContent = slide.body;
    progressEl.textContent = `Slide ${index + 1} of ${slides.length}`;
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === slides.length - 1;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (index > 0) {
        index--;
        renderSlide();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (index < slides.length - 1) {
        index++;
        renderSlide();
      }
    });
  }

  renderSlide();
}

async function loadQuestions(moduleName) {
  try {
    const res = await fetch(`data/${moduleName}-questions.json`);
    return await res.json();
  } catch (e) {
    console.error('Error loading questions:', e);
    return [];
  }
}

async function initQuiz(moduleName) {
  const generateBtn = document.getElementById('generate-question');
  if (!generateBtn) return;

  const topicFilter = document.getElementById('topic-filter');
  const difficultyFilter = document.getElementById('difficulty-filter');
  const card = document.querySelector('.quiz-card');
  const qText = document.querySelector('.quiz-question');
  const qOptions = document.querySelector('.quiz-options');
  const revealBtn = document.getElementById('reveal-answer');
  const explanationEl = document.querySelector('.quiz-explanation');

  const questions = await loadQuestions(moduleName);

  function pickQuestion() {
    const topic = topicFilter ? topicFilter.value : 'all';
    const difficulty = difficultyFilter ? difficultyFilter.value : 'all';

    let pool = questions;
    if (topic !== 'all') {
      pool = pool.filter(q => q.topic === topic);
    }
    if (difficulty !== 'all') {
      pool = pool.filter(q => q.difficulty === difficulty);
    }
    if (!pool.length) return null;
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  }

  generateBtn.addEventListener('click', () => {
    const q = pickQuestion();
    if (!q) {
      if (qText) qText.textContent = 'No questions match this filter yet.';
      if (qOptions) qOptions.innerHTML = '';
      if (card) card.classList.remove('hidden');
      if (revealBtn) revealBtn.classList.add('hidden');
      if (explanationEl) explanationEl.classList.add('hidden');
      return;
    }

    if (qText) qText.textContent = q.question;
    if (qOptions) {
      qOptions.innerHTML = '';
      q.options.forEach((opt, i) => {
        const li = document.createElement('li');
        li.textContent = opt;
        li.classList.add('quiz-option');
        li.addEventListener('click', () => {
          document
            .querySelectorAll('.quiz-option')
            .forEach(o => o.classList.remove('selected'));
          li.classList.add('selected');
        });
        qOptions.appendChild(li);
      });
    }

    if (explanationEl) {
      explanationEl.textContent = `Answer: ${q.options[q.answerIndex]} — ${q.explanation}`;
    }
    if (card) card.classList.remove('hidden');
    if (revealBtn) {
      revealBtn.classList.remove('hidden');
      if (explanationEl) explanationEl.classList.add('hidden');
      revealBtn.onclick = () => {
        if (explanationEl) explanationEl.classList.remove('hidden');
      };
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.slide-container');
  if (container && container.getAttribute('data-module')) {
    const moduleName = container.getAttribute('data-module');
    initSlides();
    if (moduleName) initQuiz(moduleName);
  }
});
