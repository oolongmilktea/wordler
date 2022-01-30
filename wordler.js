function filterAbsentLetters(wordList = [], absentLetters = []) {
  if (absentLetters.length === 0) {
    return wordList;
  }

  return wordList.filter(word => {
    for (const absentLetter of absentLetters) {
      if (word.indexOf(absentLetter) >= 0) {
        return false;
      }
    }
    return true;
  });
}

function filterCorrectLetters(wordList = [], correctLetters = {}) {
  if (Object.keys(correctLetters).length === 0) {
    return wordList;
  }

  return wordList.filter(word => {
    for (const [correctLetter, index] of Object.entries(correctLetters)) {
      if (correctLetter !== null && word[index] !== correctLetter) {
        return false;
      }
    }
    return true;
  });
}

function filterPresentLetters(wordList = [], presentLetters = {}) {
  if (Object.keys(presentLetters).length === 0) {
    return wordList;
  }

  return wordList.filter(word => {
    for (const [presentLetter, disallowedPositions] of Object.entries(presentLetters)) {
      const position = word.indexOf(presentLetter);
      if (position < 0) {
        // Present letter must be present.
        return false;
      }
      if (disallowedPositions.has(position)) {
        // Present letter can not be at a disallowed position.
        return false;
      }
    }
    return true;
  })
}

function filterWordList(
  absentLetters = new Set(),
  correctLetters = {},
  presentLetters = {},
) {
  const absentFiltered = filterAbsentLetters(WORD_LIST, absentLetters);
  const correctFiltered = filterCorrectLetters(absentFiltered, correctLetters);
  const presentFiltered = filterPresentLetters(correctFiltered, presentLetters);
  return presentFiltered;
}

function wordler() {
  let absentLetters = new Set();
  let correctLetters = {};
  let presentLetters = {};

  const { boardState = [], evaluations = [] } = JSON.parse(window.localStorage.gameState);
  for (const [guessNum, guess] of boardState.entries()) {
    if (guess === '') continue;
    for (const [index, evaluation] of evaluations[guessNum].entries()) {
      let letter = guess[index];
      switch (evaluation) {
        case "correct":
          correctLetters[letter] = index;
          break;
        case "present":
          if (!(letter in presentLetters)) {
            presentLetters[letter] = new Set();
          }
          presentLetters[letter].add(index);
          break;
        case "absent":
          // edge case with multiple letters
          if (!(letter in presentLetters) && !(letter in correctLetters)) {
            absentLetters.add(letter);
          }
          break;
      }
    }
  }
  return filterWordList(absentLetters, correctLetters, presentLetters);
}

// Listen to keyboard enters to update
document.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    chrome.runtime.sendMessage(wordler());
  }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    let possible = wordler();
    sendResponse({ possible });
  } catch (e) {
    console.error("encountered JSON parse error", e);
  }
});

// Run when wordle page first opens
chrome.runtime.sendMessage(wordler());