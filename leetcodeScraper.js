const axios = require('axios');

const ENDPOINT = "https://leetcode.com/api/problems/algorithms/"
const ENDPOINT_LINK = "https://leetcode.com/problems/"

const getRandomProblem = async () => {
  return await axios.get(ENDPOINT).then(resp => {
    // extracting questions count and number of questions from total questions.
    let questions = resp.data.stat_status_pairs

    // check for only free questions.
    questions.filter(question => question.paid_only == false)

    // TODO: check whether question is solved or not

    let questions_count = questions.length

    // choosing a random index from the lot
    let index = Math.floor(Math.random() * questions_count);
    let question = questions[index]
    return {
      id: question.stat.question_id,
      title: question.stat.question__title,
      link: `${ENDPOINT_LINK}${question.stat.question__title_slug}`,
      difficulty: question.difficulty.level
    }
  })
  .catch(err => {console.log(err);return null;})
}

module.exports = getRandomProblem;
